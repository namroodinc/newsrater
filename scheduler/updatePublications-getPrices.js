import * as contentful from "contentful-management";
import {
  cfSpaceId,
  cfCmaToken
} from "../config";
import inquirer from "inquirer";
import currencies from "../fixtures/currencies";
const typeOfUpdate = 'prices';

import getPrices from "../api/getPrices";

const client = contentful.createClient({
  accessToken: cfCmaToken
});
const getSpace = client.getSpace(cfSpaceId);

getSpace
  .then((space) => space.getEntries({
    content_type: 'publication',
    order: 'sys.updatedAt'
  }))
  .then((response) => {

    const publicationsCopy = response.items;

    function copyFilesAndRunAnalysis(publication) {
      return new Promise(function(resolve) {
        getPrices(publication.fields.name['en-US'])
          .then((values) => {
            const pricesSelection = {
              type: 'checkbox',
              name: 'pricesList',
              message: 'Prices selection',
              choices: values.map(data => {
                return {
                  name: `${data.name} - /price-${data.price} - /id-${data.id}`,
                  checked: data.name === publication.fields.name['en-US'] || data.source === 'custom'
                }
              })
            };

            inquirer.prompt(pricesSelection).then(pricesAnswers => {

              const pricesSelected = pricesAnswers.pricesList.map(data => {
                const splitId = data.split('/id-');
                const filtered = values.filter(filtered => filtered.id === splitId[1]);
                return filtered[0]
              });

              if (pricesSelected.length > 0) {
                getSpace
                  .then((space) => space.getEntry(publication.sys.id))
                  .then((entry) => {
                    const currency = currencies[entry.fields.countryGeocode['en-US']];
                    entry.fields.publicationPrice['en-US'].push({
                      timestamp: Date.now(),
                      data: pricesSelected,
                      currency
                    });
                    return entry.update();
                  })
                  .then((entry) => entry.publish())
                  .then((entry) => {
                    console.log(`** ${entry.fields.name['en-US']} ${typeOfUpdate} updated & published.`)
                    resolve(values);
                  })
                  .catch(console.error);
              } else {
                resolve('No price added for ', publication.fields.name['en-US'])
              }

            });

          });
      });
    }

    function* doPublication(publications) {
      yield copyFilesAndRunAnalysis(publications);
    }

    // BEGIN HERE
    console.log("Start.");
    const publicationBatch = doPublication(publicationsCopy.shift());
    publicationBatch
      .next()
      .value
      .then(function re(data) {
        console.log(data);
        return publicationsCopy.length ? doPublication(publicationsCopy.shift()).next().value.then(re) : "Finished."
      })
      .then(() => {
        console.log('complete');
      });

  })
  .catch(console.error);
