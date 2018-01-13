import getUkCirculation from "../crawlers/getUkCirculation";
import getWikipediaSanitize from "../utils/getWikipediaSanitize";
import { ukNewspaperCirculation } from "../config";

getUkCirculation(ukNewspaperCirculation)
  .then(values => {
    let array = [];
    values.map(value => {
      value.map(pub => {
        let find = array.findIndex(i => i.Title === pub.Title);
        if (find > 0) {
          array[find] = Object.assign({}, array[find], pub);
        } else {
          array.push(pub);
        }
      });
    })
    return array;
  })
  .then(values => {
    return values.map(publication => {
      const pubName = publication.Title;
      const pubCirculation = publication;
      delete pubCirculation.Title;
      return {
        publicationTitle: getWikipediaSanitize(pubName),
        circulationHistory: Object.keys(pubCirculation).map(pub => {
          return {
            year: getWikipediaSanitize(pub),
            value: pubCirculation[pub]
          }
        })
      }
    })
  })
  .then(values => {
    console.log(JSON.stringify(values.find(pub => pub.publicationTitle === 'Financial Times'), undefined, 3));
  });
