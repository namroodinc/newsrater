import * as contentful from "contentful-management";
import inquirer from "inquirer";

import getGoogleGeocode from "../api/getGoogleGeocode";
import getTesco from "../api/getTesco";
import getTwitter from "../api/getTwitter";
import getIpsoList from "../crawlers/getIpsoList";
import getWikipedia from "../crawlers/getWikipedia";
import getWikipediaResponse from "../utils/getWikipediaResponse";
import { cfSpaceId, cfCmaToken } from "../config";

const client = contentful.createClient({
  accessToken: cfCmaToken
});
const getSpace = client.getSpace(cfSpaceId);

export default function (name, disambiguation, sundayEdition, website, newsApiId, pcc, ipso) {

  const inputFields = {
    name: {
      'en-US': name
    },
    disambiguation: {
      'en-US': disambiguation
    },
    sundayEdition: {
      'en-US': sundayEdition
    },
    website: {
      'en-US': `https://www.${website}`
    },
    description: {
      'en-US': 'Description required.'
    },
    newsApiId: {
      'en-US': newsApiId
    },
    simpleRating: {
      'en-US': 0
    },
    simpleRatingDifference: {
      'en-US': 0
    },
    overallRating: {
      'en-US': []
    },
    format: {
      'en-US': []
    },
    demographics: {
      'en-US': []
    },
    siteRankings: {
      'en-US': []
    },
    articles: {
      'en-US': []
    },
    checkPcc: {
      'en-US': pcc === 'Yes' ? true : false
    },
    pressComplaints: {
      'en-US': {}
    },
    checkIpso: {
      'en-US': ipso === 'Yes' ? true : false
    },
    ipsoList: {
      'en-US': []
    },
    independentPressStandardsOrganisation: {
      'en-US': {}
    },
    twitterAccounts: {
      'en-US': []
    },
    publicationPrice: {
      'en-US': []
    },
    geocodeAddress: {
      'en-US': {}
    }
  };

  return new Promise((resolve, reject) => {

    const createIpso = (name, website, fields) => {
      getIpsoList(name, website)
        .then(ipsoListResponse => {
          const ipsoSelection = {
            type: 'checkbox',
            name: 'ipsoList',
            message: 'IPSO ID selection',
            choices: ipsoListResponse.map(data => {
              return {
                name: `${data.name} - /id-${data.id}`,
                checked: data.name === name || data.name === website
              }
            })
          };

          inquirer.prompt(ipsoSelection).then(ipsoAnswers => {
            const ipsoSelected = ipsoAnswers.ipsoList.map(data => {
              const splitId = data.split('/id-');
              const filtered = ipsoListResponse.filter(filtered => filtered.id === splitId[1]);
              const { id, name } = filtered[0];
              return {
                id,
                name
              }
            });

            const ipsoList = {
              ipsoList: {
                'en-US': ipsoSelected
              }
            };

            const newFields = Object.assign({}, fields, ipsoList);
            createTesco(newFields);
          });
        });
    }

    const createTesco = (fields) => {

      const { name, sundayEdition } = fields;

      const priceName = name['en-US'];
      const priceSundayEdition = sundayEdition['en-US'];

      getTesco(priceName, priceSundayEdition)
        .then(tescoResponse => {

          const tescoSelection = {
            type: 'checkbox',
            name: 'tescoList',
            message: 'Tesco Prices selection',
            choices: tescoResponse.map(data => {
              return {
                name: `${data.name} - /price-${data.price} - /id-${data.id}`,
                checked: data.name === priceName || data.name === priceSundayEdition
              }
            })
          };

          inquirer.prompt(tescoSelection).then(tescoAnswers => {

            const tescoSelected = tescoAnswers.tescoList.map(data => {
              const splitId = data.split('/id-');
              const filtered = tescoResponse.filter(filtered => filtered.id === splitId[1]);
              return filtered[0]
            });

            const tescoList = {
              publicationPrice: {
                'en-US': tescoSelected
              }
            };

            const newFields = Object.assign({}, fields, tescoList);
            createDraft(newFields);

          });
        });
    }

    const createDraft = (fields) => {
      const { name, disambiguation } = fields;
      let generateId = name['en-US'];
      if (disambiguation['en-US'] !== '') {
        generateId += ` ${disambiguation['en-US']}`
      }
      const convertToId = generateId.toLowerCase().replace(/ /g, '-');
      console.log(convertToId);
      getSpace
        .then((space) => space.createEntryWithId('publication', convertToId, {
          fields
        }))
        .then((entry) => {
          console.log(`** ${entry.fields.name['en-US']} created as draft (with address).`);

          // RESOLVE
          resolve();
          // RESOLVE

        })
        .catch(console.error);
    }

    getWikipedia(name, disambiguation)
      .then((wikipediaResponse) => {

        const updatedFields = getWikipediaResponse(wikipediaResponse);

        getTwitter(`${name}`)
          .then((twitterResponse) => {
            const twitterSelection = {
              type: 'checkbox',
              name: 'twitterAccounts',
              message: 'Twitter Accounts',
              choices: twitterResponse.results.map(data => {
                const { id, name, screen_name, verified, time_zone } = data;
                const isVerified = verified ? 'V -' : '';
                return {
                  name: `${isVerified} ${name} (@${screen_name}), ${time_zone} - /id-${id}`
                }
              })
            };

            inquirer.prompt(twitterSelection).then(twitterAnswers => {
              const filteredAccounts = twitterAnswers.twitterAccounts.map(data => {
                const splitId = data.split('/id-');
                const filtered = twitterResponse.results.filter(filtered => filtered.id === parseInt(splitId[1]));
                const { id, name, screen_name, profile_link_color, verified } = filtered[0];
                return {
                  id,
                  name,
                  screenName: screen_name,
                  backgroundColor: profile_link_color,
                  verified
                }
              });
              const twitterAccounts = {
                twitterAccounts: {
                  'en-US': filteredAccounts
                }
              };

              if (updatedFields.headquarters !== undefined) {

                getGoogleGeocode(updatedFields.headquarters['en-US'])
                  .then(geocode => {
                    const geocodeResult = geocode.address.results[0];
                    const countryNameCode = geocodeResult.address_components.filter(component => component.types.indexOf('country') !== -1);
                    const geocodeAddress = {
                      geocodeAddress: {
                        'en-US': geocodeResult
                      },
                      headquarters: {
                        'en-US': geocodeResult.formatted_address
                      },
                      country: {
                        'en-US': countryNameCode[0].long_name
                      },
                      countryGeocode: {
                        'en-US': countryNameCode[0].short_name
                      }
                    };

                    const newFields = Object.assign({}, inputFields, updatedFields, twitterAccounts, geocodeAddress);
                    createIpso(name, website, newFields);
                  });

              } else {

                const newFields = Object.assign({}, inputFields, updatedFields, twitterAccounts);
                createIpso(name, website, newFields);

              }
            });
          });
      });

  });

}
