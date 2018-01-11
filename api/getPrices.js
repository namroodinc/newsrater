import osmosis from "osmosis";
import request from "superagent";
import { tescoPrimaryKey, waitroseShop } from "../config";

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

  const returnWaitrosePrices = (name) => new Promise((resolve) => {
    console.log(`${waitroseShop}${name}`);
    let savedData = [];
    osmosis
      .get(`${waitroseShop}${name}`)
      .find('body')
      .set('title')
      .data((listings) => {
        console.log(listings);
        // const { title, rating } = listings;
        // if (title !== '') {
        //   const ratingCalc = (parseInt(rating.left.replace(/\D/g,'') / 2)) + (parseInt(rating.right.replace(/\D/g,'') / 2));
        //   savedData.push({
        //     title,
        //     rating: ratingCalc
        //   })
        // }
      })
      .done(() => resolve(savedData));
  });

  return Promise.all([returnTescoPrices(publication), returnWaitrosePrices(publication)]).then((values) => {

    const responseTesco = values[0].uk.ghs.products.results;
    const responseWaitrose = values[1];

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
