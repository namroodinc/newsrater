import * as contentful from "contentful-management";
import moment from "moment";
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

              console.log(`${domain}.${tld}`)
              console.log(rankings)
              console.log('---------------')

              entry.fields.siteRankings['en-US'].unshift({
                timestamp: Date.now(),
                data: rankings
              });

              const siteRankings = entry.fields.siteRankings['en-US']
                .filter(ranking => Object.keys(ranking.data).length !== 0)
                .sort((a, b) => {
                  return new Date(b.timestamp) - new Date(a.timestamp)
                })
                .reduce((unique, o) => {
                  if (!unique.find(obj => {
                    return moment(obj.timestamp).format('MMM DD YYYY') === moment(o.timestamp).format('MMM DD YYYY')
                  })) {
                    unique.push(o);
                  }
                  return unique;
                }, [])
                .splice(0, 30);

              entry.fields.siteRankings['en-US'] = siteRankings;
              entry.fields.demographics['en-US'] = demographics;

              return entry.update();
            })
            .then((entry) => entry.publish())
            .then((entry) => console.log(`** ${entry.fields.name['en-US']} ${typeOfUpdate} updated & published.`))
            .catch(console.error);
        });
    });
  })
  .catch(console.error);
