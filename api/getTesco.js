import request from "superagent";
import { tescoPrimaryKey, tescoSecondaryKey } from "../config";

module.exports = (publication, publicationSunday) => {

  const returnTescoPrices = (name) => new Promise((resolve) => {
    request
      .get(`https://dev.tescolabs.com/grocery/products/?query=${name}&offset=0&limit=10`)
      .set('Ocp-Apim-Subscription-Key', tescoPrimaryKey)
      .end(function(err, res){
        if (err || !res.ok) {
          reject(res.toError());
        } else {
          resolve(res.body);
        }
      });
  });

  let tescoPrices = [
    returnTescoPrices(publication)
  ];
  if (publicationSunday !== '') tescoPrices.push(returnTescoPrices(publicationSunday));


  return Promise.all(tescoPrices).then((values) => {

    const response = values[0].uk.ghs.products.results;
    let responseSunday = [];
    if (values[1] !== undefined) responseSunday = values[1].uk.ghs.products.results;

    let responseSort = response;
    if (responseSort.length > 0) {
      responseSort = response
        .sort((a, b) => b.price - a.price)
        .map((item, i) => {
          const { tpnb, name, id, price } = item;
          return {
            tpnb,
            name,
            id,
            price,
            isWeekend: i === 0 && responseSunday === undefined,
            isSaturday: i === 0 && responseSunday !== undefined,
            isSunday: responseSunday === undefined
          }
        });
    }

    let responses = [
      ...responseSort
    ];
    if (responseSunday !== undefined) {
      let responseSundaySort = responseSunday;
      if (responseSundaySort.length > 0) {
        responseSundaySort = responseSunday
          .map((item) => {
            const { tpnb, name, id, price } = item;
            return {
              tpnb,
              name,
              id,
              price,
              isWeekend: false,
              isSaturday: false,
              isSunday: true
            }
          });
      }

      responses = [
        ...responseSort,
        ...responseSundaySort
      ]
    }

    return responses;
  });
}
