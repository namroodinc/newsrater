import osmosis from "osmosis";
import { alexaRankBaseUrl } from "../config";

module.exports = (api) => {
  const globals = new Promise((resolve) => { // TODO: Add reject (resolve, reject) error
    let savedData = {};
    osmosis
      .get(`${alexaRankBaseUrl}${api}`)
      .find('.globleRank .metrics-data')
      .set('globalRank')
      .find('.countryRank .metrics-data')
      .set('countryRank')
      .data((globals) => {
        savedData = globals;
      })
      .done(() => {
        resolve(savedData);
      });
  });

  const getStats = new Promise((resolve) => { // TODO: Add reject (resolve, reject) error
    let savedData = [];
    osmosis
      .get(`${alexaRankBaseUrl}${api}`)
      .find('.pybar-row')
      .set({
        title: '.pybar-label',
        rating: {
          left: '.pybar-bar.pybar-l > .pybar-bg > span@style',
          right: '.pybar-bar.pybar-r > .pybar-bg > span@style'
        }
      })
      .data((listings) => {
        const { title, rating } = listings;
        if (title !== '') {
          const ratingCalc = (parseInt(rating.left.replace(/\D/g,'') / 2)) + (parseInt(rating.right.replace(/\D/g,'') / 2));
          savedData.push({
            title,
            rating: ratingCalc
          })
        }
      })
      .done(() => resolve(savedData));
  });

  return Promise.all([globals, getStats]).then((values) => {
    return {
      rankings: values[0],
      demographics: values[1]
    };
  });
}
