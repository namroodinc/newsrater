import * as contentful from "contentful-management";
import getWikipedia from "../crawlers/getWikipedia";
import getWikipediaSanitize from "../utils/getWikipediaSanitize";
import { cfSpaceId, cfCmaToken } from "../config";
const client = contentful.createClient({
  accessToken: cfCmaToken
});
const getSpace = client.getSpace(cfSpaceId);
const typeOfUpdate = 'Information';

getSpace
  .then((space) => space.getEntries({
    content_type: 'publication'
  }))
  .then((response) => {
    response.items.map(data => {
      const name = data.fields.name['en-US'];
      const disambiguation = data.fields.disambiguation ? data.fields.disambiguation['en-US'] : '';
      getWikipedia(`${name} ${disambiguation}`)
        .then((wikipediaResponse) => {
          getSpace
            .then((space) => space.getEntry(data.sys.id))
            .then((entry) => {
              const { infobox, description } = wikipediaResponse;
              infobox.map(infoboxResponse => {
                const { label, value } = infoboxResponse;
                console.log(value);
                switch (label) {
                  case 'Owner(s)':
                  case 'Owned by':
                  case 'Owner':
                    // entry.fields.ownership['en-US'] = getWikipediaSanitize(value);
                    break;
                  default:
                }
              });
              entry.fields.description['en-US'] = getWikipediaSanitize(description.description);
              return entry.update();
            })
            .then((entry) => entry.publish())
            .then((entry) => console.log(`** ${entry.fields.name['en-US']} ${typeOfUpdate} updated & published.`))
            .catch(console.error);
        });
    });
  })
  .catch(console.error);
