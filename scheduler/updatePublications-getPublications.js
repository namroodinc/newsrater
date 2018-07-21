import * as contentful from "contentful-management";
import parseDomain from "parse-domain";
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
    console.log('name,disambiguation,url,newsApiId,twitterScreenName,country,headquarters,backgroundColor');
    response.items
      .filter(data => {
        const country = data.fields.country['en-US'];
        return country === 'United States' || country === 'United Kingdom' || country === 'Australia';
      })
      .map(data => {
        const name = data.fields.name['en-US'];
        const disambiguation = data.fields.disambiguation ? data.fields.disambiguation['en-US'] : '';
        const parsedDomain = parseDomain(data.fields.website['en-US']);
        const { domain, tld } = parsedDomain;
        const newsApiId = data.fields.newsApiId['en-US'];
        const twitterScreenName = data.fields.twitterAccounts['en-US'][0].screenName;
        const country = data.fields.country['en-US'];
        const headquarters = data.fields.headquarters['en-US'];
        const backgroundColor = data.fields.twitterAccounts['en-US'][0].backgroundColor;

        console.log(`${name},${disambiguation},${domain}.${tld},${newsApiId},${twitterScreenName},${country},"${headquarters}",#${backgroundColor}`);
      });
  })
  .catch(console.error);
