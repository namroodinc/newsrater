import * as contentful from "contentful-management";
import inquirer from "inquirer";

import getGoogleGeocode from "../api/getGoogleGeocode";
import getTwitter from "../api/getTwitter";
import getIpsoList from "../crawlers/getIpsoList";
import getWikipedia from "../crawlers/getWikipedia";
import getWikipediaResponse from "../utils/getWikipediaResponse";
import { cfSpaceId, cfCmaToken } from "../config";

const client = contentful.createClient({
  accessToken: cfCmaToken
});
const getSpace = client.getSpace(cfSpaceId);

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
        createDraft(newFields);
      });
    });
}

const createDraft = (fields) => {
  getSpace
    .then((space) => space.createEntryWithId('publication', Date.now(), {
      fields
    }))
    .then((entry) => console.log(`** ${entry.fields.name['en-US']} created as draft (with address).`))
    .catch(console.error);
}

const questions = [
  {
    type: 'input',
    name: 'name',
    message: "Name"
  },
  {
    type: 'input',
    name: 'disambiguation',
    message: "Disambiguation"
  },
  {
    type: 'input',
    name: 'website',
    message: "Website"
  },
  {
    type: 'input',
    name: 'newsApiId',
    message: "News API ID"
  },
  {
    type: 'list',
    name: 'pcc',
    message: "PCC",
    choices: [
      {
        name: 'Yes',
        checked: true
      },
      {
        name: 'No'
      }
    ]
  },
  {
    type: 'list',
    name: 'ipso',
    message: "IPSO",
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

inquirer.prompt(questions).then(answers => {
  const { name, disambiguation, website, newsApiId, pcc, ipso } = answers;

  const inputFields = {
    name: {
      'en-US': name
    },
    disambiguation: {
      'en-US': disambiguation
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
    geocodeAddress: {
      'en-US': {}
    }
  };

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
