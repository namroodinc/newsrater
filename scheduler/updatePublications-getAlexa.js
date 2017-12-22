import * as contentful from "contentful-management";
import parseDomain from "parse-domain";
import getAlexa from "../crawlers/getAlexa";
import { cfSpaceId, cfCmaToken } from "../config";
const client = contentful.createClient({
  accessToken: cfCmaToken
});
const getSpace = client.getSpace(cfSpaceId);
const typeOfUpdate = 'Site Rankings';

getSpace
  .then((space) => space.getEntries({
    content_type: 'publication'
  }))
  .then((response) => {
    response.items.map(data => {
      const parsedDomain = parseDomain(data.fields.website['en-US']);
      const { domain, tld } = parsedDomain;
      getAlexa(`${domain}.${tld}`)
        .then((alexaResponse) => {
          getSpace
            .then((space) => space.getEntry(data.sys.id))
            .then((entry) => {
              const { rankings, demographics } = alexaResponse;
              entry.fields.siteRankings['en-US'].push({
                timestamp: Date.now(),
                data: rankings
              });
              entry.fields.demographics['en-US'] = demographics;
              return entry.update();
            })
            .then((entry) => entry.publish())
            .then((entry) => console.log(`** ${entry.fields.name['en-US']} ${typeOfUpdate} updated&published.`))
            .catch(console.error);
        });
    });
  })
  .catch(console.error);
