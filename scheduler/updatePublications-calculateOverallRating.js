import * as contentful from "contentful-management";

const client = contentful.createClient({
  accessToken: cfCmaToken
});
const getSpace = client.getSpace(cfSpaceId);

import articleCalculation from "../utils/calculations/articles";
import educationCalculation from "../utils/calculations/education";
import equalityCalculation from "../utils/calculations/equality";
import { cfSpaceId, cfCmaToken } from "../config";
const typeOfUpdate = 'calculating Overall Rating';

getSpace
  .then((space) => space.getEntries({
    content_type: 'publication'
  }))
  .then((response) => {
    response.items.map(data => {
      getSpace
        .then((space) => space.getEntry(data.sys.id))
        .then((entry) => {
          const articles = articleCalculation(entry.fields.articles['en-US']);
          const education = educationCalculation(entry.fields.demographics['en-US']);
          const equality = equalityCalculation(entry.fields.demographics['en-US']);
          const total = (articles + education) / 2;

          entry.fields.overallRating['en-US'].push({
            timestamp: Date.now(),
            ratings: {
              articles,
              education,
              equality,
              total
            }
          });

          entry.fields.simpleRating['en-US'] = parseInt(total);
          return entry.update();
        })
        .then((entry) => entry.publish())
        .then((entry) => console.log(`** ${entry.fields.name['en-US']} ${typeOfUpdate} updated & published.`))
        .catch(console.error);
    });
  })
  .catch(console.error);
