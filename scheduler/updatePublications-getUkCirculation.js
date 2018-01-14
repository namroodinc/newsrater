import * as contentful from "contentful-management";
import getUkCirculation from "../crawlers/getUkCirculation";
import getWikipediaSanitize from "../utils/getWikipediaSanitize";
import { cfSpaceId, cfCmaToken, ukNewspaperCirculation } from "../config";

const client = contentful.createClient({
  accessToken: cfCmaToken
});
const getSpace = client.getSpace(cfSpaceId);
const typeOfUpdate = 'Circulation figures';

getUkCirculation(ukNewspaperCirculation)
  .then(values => {
    let circulation = [];
    values.map(value => {
      value.map(pub => {
        let find = circulation.findIndex(i => i.Title === pub.Title);
        if (find > 0) {
          circulation[find] = Object.assign({}, circulation[find], pub);
        } else {
          circulation.push(pub);
        }
      });
    })
    return circulation;
  })
  .then(values => {
    return values.map(publication => {
      const pubName = publication.Title;
      const pubCirculation = publication;
      delete pubCirculation.Title;
      return {
        name: getWikipediaSanitize(pubName),
        circulationHistory: Object.keys(pubCirculation)
          .map(pub => {
            return {
              year: getWikipediaSanitize(pub),
              value: parseInt(pubCirculation[pub])
            }
          })
          .filter(by => by.value)
      }
    })
  })
  .then(values => {
    getSpace
      .then((space) => space.getEntries({
        content_type: 'publication'
      }))
      .then((response) => {
        response.items.map(data => {
          let circulation = [];
          values
            .filter(pub => pub.name === data.fields.name['en-US'])
            .map(pub => pub.circulationHistory.map(publication => circulation.push(publication)));

          if (circulation.length > 0) {
            getSpace
              .then((space) => space.getEntry(data.sys.id))
              .then((entry) => {
                entry.fields.circulationHistroy['en-US'] = circulation.sort((a, b) => b.year - a.year);
                return entry.update();
              })
              .then((entry) => entry.publish())
              .then((entry) => console.log(`** ${entry.fields.name['en-US']} ${typeOfUpdate} updated & published.`))
              .catch(console.error);
          }
        });
      })
      .catch(console.error);
  });
