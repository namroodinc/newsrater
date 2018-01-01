import * as contentful from "contentful-management";
import inquirer from "inquirer";

import getTwitter from "../api/getTwitter";
import getWikipedia from "../crawlers/getWikipedia";
import getWikipediaResponse from "../utils/getWikipediaResponse";
import { cfSpaceId, cfCmaToken } from "../config";

const client = contentful.createClient({
  accessToken: cfCmaToken
});
const getSpace = client.getSpace(cfSpaceId);

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
  }
];

inquirer.prompt(questions).then(answers => {
  const { name, disambiguation, website } = answers;

  const inputFields = {
    name: {
      'en-US': name
    },
    disambiguation: {
      'en-US': disambiguation
    },
    website: {
      'en-US': website
    },
    description: {
      'en-US': 'Description required.'
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
      'en-US': true
    },
    pressComplaints: {
      'en-US': {}
    },
    checkIpso: {
      'en-US': true
    },
    independentPressStandardsOrganisation: {
      'en-US': {}
    },
    twitterAccounts: {
      'en-US': []
    }
  };

  getWikipedia(`${name} ${disambiguation}`)
    .then((wikipediaResponse) => {
      const updatedFields = getWikipediaResponse(wikipediaResponse);

      getTwitter(`${name}`)
        .then((twitterResponse) => {
          const twitterSelection = {
            type: 'checkbox',
            name: 'twitterAccounts',
            message: 'Twitter Accounts',
            choices: twitterResponse.results.map(data => {
              const { id, name, screen_name, verified } = data;
              const isVerified = verified ? 'V -' : '';
              return {
                name: `${isVerified} ${name} (@${screen_name}) /id-${id}`
              }
            })
          }

          inquirer.prompt(twitterSelection).then(twitterAnswers => {
            const filteredAccounts = twitterAnswers.twitterAccounts.map(data => {
              const splitId = data.split('/id-');
              const filtered = twitterResponse.results.filter(filtered => filtered.id === parseInt(splitId[1]));
              const { id, name, screen_name, profile_background_color, verified } = filtered[0];
              return {
                id,
                name,
                screenName: screen_name,
                backgroundColor: profile_background_color,
                verified
              }
            });
            const twitterAccounts = {
              twitterAccounts: {
                'en-US': filteredAccounts
              }
            }

            const newFields = Object.assign({}, inputFields, updatedFields, twitterAccounts);
            getSpace
              .then((space) => space.createEntryWithId('publication', Date.now(), {
                fields: newFields
              }))
              .then((entry) => console.log(`** ${entry.fields.name['en-US']} created as draft.`))
              .catch(console.error)
          });
        });
    });
});
