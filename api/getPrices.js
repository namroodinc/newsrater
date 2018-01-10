import request from "superagent";
import { tescoPrimaryKey, waitroseApiPartOne, waitroseApiPartTwo } from "../config";

module.exports = (publication) => {

  const returnTescoPrices = (name) => new Promise((resolve, reject) => {
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

  const returnWaitrosePrices = (name) => new Promise((resolve, reject) => {
    console.log(`${waitroseApiPartOne}${name}${waitroseApiPartTwo}`);
    request
      .get(`${waitroseApiPartOne}${name}${waitroseApiPartTwo}`)
      .end(function(err, res){
        console.log(res.body);
        if (err || !res.ok) {
          reject(res.toError());
        } else {
          resolve(res.body);
        }
      });
  });

  return Promise.all([returnTescoPrices(publication), returnWaitrosePrices(publication)]).then((values) => {

    const responseTesco = values[0].uk.ghs.products.results;
    const responseWaitrose = values[1];
    console.log(responseWaitrose);

    let responseTescoSort = responseTesco;
    if (responseTescoSort.length > 0) {
      responseTescoSort = responseTesco
        .sort((a, b) => b.price - a.price)
        .map((item) => {
          const { name, price } = item;
          return {
            source: 'tesco',
            name,
            price: parseFloat(price)
          }
        });
    }

    let responseWaitroseSort = responseWaitrose;
    if (responseWaitroseSort.length > 0) {
      responseWaitroseSort = responseWaitrose[responseWaitrose.length - 1]
        .sort((a, b) => b.price - a.price)
        .map((item) => {
          const { name, currentsaleunitretailpriceamount } = item;
          return {
            source: 'waitrose',
            name,
            price: parseFloat(currentsaleunitretailpriceamount)
          }
        });
    }

    let responses = [
      ...responseTescoSort,
      ...responseWaitroseSort
    ];

    return responses;
  });
}
