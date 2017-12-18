import * as contentful from "contentful-management";
import getAlexa from "../crawlers/getAlexa";
import { cfSpaceId, cfCmaToken } from "../config";
const client = contentful.createClient({
  accessToken: cfCmaToken
});
const getSpace = client.getSpace(cfSpaceId);

getSpace
  .then((space) => space.getEntries({
    content_type: 'publication'
  }))
  .then((response) => {
    response.items.map(data => getAlexa(data.fields.website['en-US']).then((alexaResponse) => {
      getSpace
        .then((space) => space.getEntry(data.sys.id))
        .then((entry) => {
          entry.fields.siteRankings['en-US'].push({
            timestamp: Date.now(),
            data: alexaResponse
          });
          return entry.update();
        })
        .then((entry) => console.log(`* ${entry.fields.name['en-US']} Site Rankings updated.`))
        .catch(console.error)
    }));
  })
  .catch(console.error);
