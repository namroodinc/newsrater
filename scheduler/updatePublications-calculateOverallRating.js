import * as contentful from "contentful-management";

const client = contentful.createClient({
  accessToken: cfCmaToken
});
const getSpace = client.getSpace(cfSpaceId);

import articleCalculation from "../utils/calculations/articles";
import complaintsCalculation from "../utils/calculations/complaints";
import educationCalculation from "../utils/calculations/education";
import equalityCalculation from "../utils/calculations/equality";
import sfwCalculation from "../utils/calculations/sfw";
import { cfSpaceId, cfCmaToken } from "../config";
const typeOfUpdate = 'calculating Overall Rating';

const getSum = (total, num) => {
  return total + num;
}

getSpace
  .then((space) => space.getEntries({
    content_type: 'publication'
  }))
  .then((response) => {

    const calculateComplaintsAvg = response.items
      .filter(data => data.fields.overallRating['en-US'].length > 0)
      .map(data => {
        const overallRating = data.fields.overallRating['en-US'];
        return overallRating[overallRating.length - 1].ratings.complaints;
      })
      .filter(data => data !== null);

    const complaintsAvg = (calculateComplaintsAvg.reduce(getSum) / calculateComplaintsAvg.length);

    response.items.map(data => {
      getSpace
        .then((space) => space.getEntry(data.sys.id))
        .then((entry) => {
          const articles = articleCalculation(entry.fields.articles['en-US']);
          const complaints = complaintsCalculation(entry.fields.pressComplaints['en-US'], entry.fields.independentPressStandardsOrganisation['en-US'], complaintsAvg);
          const education = educationCalculation(entry.fields.demographics['en-US']);
          const equality = equalityCalculation(entry.fields.demographics['en-US']);
          const sfw = sfwCalculation(entry.fields.demographics['en-US']);

          const toBeCalculated = [];
          if (articles !== null) toBeCalculated.push(articles);
          if (complaints !== null) toBeCalculated.push(complaints);
          if (education !== null) toBeCalculated.push(education);
          if (equality !== null) toBeCalculated.push(equality);
          if (sfw !== null) toBeCalculated.push(sfw);

          const total = (toBeCalculated.reduce(getSum)) / toBeCalculated.length;

          entry.fields.overallRating['en-US'].push({
            timestamp: Date.now(),
            ratings: {
              articles,
              complaints,
              education,
              equality,
              sfw,
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
