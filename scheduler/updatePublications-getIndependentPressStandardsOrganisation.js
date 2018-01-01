import * as contentful from "contentful-management";
import getIndependentPressStandardsOrganisation from "../crawlers/getIndependentPressStandardsOrganisation";
import { cfSpaceId, cfCmaToken } from "../config";
const client = contentful.createClient({
  accessToken: cfCmaToken
});
const getSpace = client.getSpace(cfSpaceId);
const typeOfUpdate = 'Independent Press Standards Organisation';

getSpace
  .then((space) => space.getEntries({
    content_type: 'publication'
  }))
  .then((response) => {
    response.items.map(data => {
      if (data.fields.checkIpso['en-US']) {
        const publications = data.fields.ipsoList['en-US'];
        const idList = publications.map(item => item.id).join();

        getIndependentPressStandardsOrganisation(`${idList}`)
          .then((ipsoResponse) => {
            getSpace
              .then((space) => space.getEntry(data.sys.id))
              .then((entry) => {
                entry.fields.independentPressStandardsOrganisation['en-US'] = {
                  timestamp: Date.now(),
                  data: ipsoResponse
                };
                return entry.update();
              })
              .then((entry) => entry.publish())
              .then((entry) => console.log(`** ${entry.fields.name['en-US']} ${typeOfUpdate} updated & published.`))
              .catch(console.error);
          });
      }
    });
  })
  .catch(console.error);
