import getUkCirculation from "../crawlers/getUkCirculation";
import getWikipediaSanitize from "../utils/getWikipediaSanitize";
import { ukNewspaperCirculation } from "../config";

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
        publicationTitle: getWikipediaSanitize(pubName),
        circulationHistory: Object.keys(pubCirculation)
          .map(pub => {
            return {
              year: getWikipediaSanitize(pub),
              value: parseInt(pubCirculation[pub])
            }
          })
          .filter(by => by.value)
          .sort((a, b) => b.year - a.year)
      }
    })
  })
  .then(values => {
    console.log(JSON.stringify(values.find(pub => pub.publicationTitle === 'Financial Times'), undefined, 3));
  });
