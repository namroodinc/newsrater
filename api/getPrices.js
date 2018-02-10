import inquirer from "inquirer";
import request from "superagent";
import { tescoPrimaryKey } from "../config";

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

  const returnCustomPrices = (publicationName) => new Promise((resolve) => {
    let savedData = [];

    const startUpQuestions = [
      {
        type: 'list',
        name: 'add',
        message: `Add price for ${publicationName}?`,
        choices: [
          {
            name: 'Yes',
            checked: true
          },
          {
            name: 'No'
          }
        ]
      }
    ];

    const questions = [
      {
        type: 'input',
        name: 'price',
        message: "Price"
      },
      {
        type: 'list',
        name: 'daily',
        message: "Daily/Weekend",
        choices: [
          {
            name: 'Daily',
            checked: true
          },
          {
            name: 'Weekly'
          },
          {
            name: 'Saturday'
          },
          {
            name: 'Weekend'
          },
          {
            name: 'Sunday'
          }
        ]
      },
      {
        type: 'input',
        name: 'otherName',
        message: "Different Name?"
      }
    ];

    const questionsLoop = () => {
      return inquirer.prompt(startUpQuestions).then(answers => {
        const { add } = answers;

        if (add === 'No') {
          resolve(savedData);
        } else {
          inquirer.prompt(questions).then(answers => {
            const { price, daily, otherName } = answers;
            if (add === 'No') {
              resolve(savedData);
            } else {
              let name = otherName === '' ? publicationName : otherName;
              if (daily !== 'Daily') name += ` (${daily})`;
              savedData.push({
                id: name.replace(/ /g, '-').toLowerCase(),
                name,
                price: parseFloat(price),
                source: 'custom'
              });
            }
          }).then(() => {
            questionsLoop();
          });
        }
      });
    }
    questionsLoop();
  });

  return Promise.all([returnTescoPrices(publication), returnCustomPrices(publication)]).then((values) => {
    const responseTesco = values[0].uk.ghs.products.results;
    const responseCustom = values[1];

    let responseTescoSort = responseTesco;
    if (responseTescoSort.length > 0) {
      responseTescoSort = responseTesco
        .sort((a, b) => b.price - a.price)
        .map((item) => {
          const { id, name, price } = item;
          return {
            id,
            name,
            price: parseFloat(price),
            source: 'tesco'
          }
        });
    }
    let responses = [
      ...responseTescoSort,
      ...responseCustom
    ];

    return responses;
  });
}
