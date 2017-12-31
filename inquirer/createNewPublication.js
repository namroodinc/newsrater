import * as contentful from "contentful-management";
import inquirer from "inquirer";

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
    }
  };

  getWikipedia(`${name} ${disambiguation}`)
    .then((wikipediaResponse) => {
      const updatedFields = getWikipediaResponse(wikipediaResponse);
      const newFields = Object.assign({}, inputFields, updatedFields);
      getSpace
        .then((space) => space.createEntryWithId('publication', Date.now(), {
          fields: newFields
        }))
        .then((entry) => console.log(`** ${entry.fields.name['en-US']} created as draft.`))
        .catch(console.error)
    });
});
