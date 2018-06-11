import * as contentful from "contentful-management";

import getApi from "../utils/getApi";
import { cfSpaceId, cfCmaToken, d4TaggingUrl } from "../config";
// const typeOfUpdate = 'trends';

const client = contentful.createClient({
  accessToken: cfCmaToken
});
const getSpace = client.getSpace(cfSpaceId);

getSpace
  .then((space) => space.getEntries({
    content_type: 'publication'
  }))
  .then((response) => {
    response.items
      .filter(data => data.fields.countryGeocode['en-US'] === 'US' || data.fields.countryGeocode['en-US'] === 'GB' || data.fields.countryGeocode['en-US'] === 'AU')
      .map(data => {
        const articles = data.fields.articles['en-US'];

        return Promise.all(articles.map(article => getApi(`${d4TaggingUrl}${encodeURIComponent(article.title.trim())}`))).then((values) => console.log(values));

        // getApi(`${d4TaggingUrl}`)
        //   .then((tagData) => {
        //     getSpace
        //       .then((space) => space.getEntry(data.sys.id))
        //       .then((entry) => {
        //         // return entry.update();
        //       })
        //       // .then((entry) => entry.publish())
        //       // .then((entry) => console.log(`** ${entry.fields.name['en-US']} ${typeOfUpdate} updated & published.`))
        //       // .catch(console.error);
        //   });
      });
  })
  .catch(console.error);
