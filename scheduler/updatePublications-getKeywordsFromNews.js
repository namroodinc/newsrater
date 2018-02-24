import * as contentful from "contentful-management";

import getApi from "../utils/getApi";
import { cfSpaceId, cfCmaToken, d4TaggingUrl } from "../config";
const typeOfUpdate = 'trends';

const client = contentful.createClient({
  accessToken: cfCmaToken
});
const getSpace = client.getSpace(cfSpaceId);

const occurrence = function (array) {
  var result = [];
  if (array instanceof Array) { // Check if input is array.
    array.forEach(function (v) {
      const findResultIndex = result.findIndex(res => res.trend === v);
      if (!result[findResultIndex]) { // Initial object property creation.
        result.push({
          trend: v,
          count: 1
        }); // Create an array for that property.
      } else { // Same occurrences found.
        const resultObject = result[findResultIndex];
        result[findResultIndex].count = resultObject.count + 1; // Fill the array.
      }
    });
  }
  return result;
};

getSpace
  .then((space) => space.getEntries({
    content_type: 'publication'
  }))
  .then((response) => {
    response.items.map(data => {
      const articles = data.fields.articles['en-US'];
      const name = data.fields.name['en-US'];

      let tags = '';
      articles.map(article => tags += `${article.title} `);

      getApi(`${d4TaggingUrl}${tags.replace(/[^a-zA-Z0-9\s]/g, '')}`)
        .then((tagData) => {
          const results = occurrence(tagData.annotations
            .filter(result => result['link_probability'] > 0.7)
            .map(result => result.title))
            .sort((a, b) => b.count - a.count)
            .filter(result => result.trend !== name);

          getSpace
            .then((space) => space.getEntry(data.sys.id))
            .then((entry) => {

              entry.fields.articlesTags['en-US'].push({
                timestamp: Date.now(),
                trends: results
              });

              return entry.update();
            })
            .then((entry) => entry.publish())
            .then((entry) => console.log(`** ${entry.fields.name['en-US']} ${typeOfUpdate} updated & published.`))
            .catch(console.error);
        });

    });
  })
  .catch(console.error);
