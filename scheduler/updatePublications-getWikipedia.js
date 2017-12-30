import * as contentful from "contentful-management";

import getWikipedia from "../crawlers/getWikipedia";
import cfPostApi from "../utils/cfPostApi";
import getWikipediaSanitize from "../utils/getWikipediaSanitize";
import { cfSpaceId, cfCmaToken } from "../config";
const client = contentful.createClient({
  accessToken: cfCmaToken
});
const getSpace = client.getSpace(cfSpaceId);
const typeOfUpdate = 'Information';

getSpace
  .then((space) => space.getEntries({
    content_type: 'publication'
  }))
  .then((response) => {
    response.items.map(data => {
      const name = data.fields.name['en-US'];
      const disambiguation = data.fields.disambiguation ? data.fields.disambiguation['en-US'] : '';
      getWikipedia(`${name} ${disambiguation}`)
        .then((wikipediaResponse) => {
          getSpace
            .then((space) => space.getEntry(data.sys.id))
            .then((entry) => {
              let fields = Object.assign({}, entry.fields);
              let updatedFields = {};
              let format = [];
              let politicalAlignment = [];
              const { infobox, description } = wikipediaResponse;

              infobox.map(infoboxResponse => {
                const { label, value } = infoboxResponse;
                switch (label) {
                  case 'Owner(s)':
                  case 'Owned by':
                  case 'Owner':
                    updatedFields.ownership = {
                      'en-US': getWikipediaSanitize(value)
                    }
                    break;
                  case 'Available in':
                  case 'Language':
                    updatedFields.language = {
                      'en-US': getWikipediaSanitize(value)
                    }
                    break;
                  case 'Number of employees':
                    updatedFields.numberOfEmployees = {
                      'en-US': getWikipediaSanitize(value)
                    }
                    break;
                  case 'ISSN':
                    updatedFields.issn = {
                      'en-US': getWikipediaSanitize(value)
                    }
                    break;
                  case 'Country':
                    updatedFields.country = {
                      'en-US': getWikipediaSanitize(value)
                    }
                    break;
                  case 'OCLC number':
                    updatedFields.oclcNumber = {
                      'en-US': getWikipediaSanitize(value)
                    }
                    break;
                  case 'Headquarters':
                    if (Array.isArray(value)) {
                      let address = '';
                      value.map((line, i) => i === 0 ? address += line : address += `, ${line}`);
                      updatedFields.headquarters = {
                        'en-US': getWikipediaSanitize(address)
                      }
                    } else {
                      updatedFields.headquarters = {
                        'en-US': getWikipediaSanitize(value)
                      }
                    }
                    break;
                  case 'Circulation':
                    updatedFields.circulation = {
                      'en-US': getWikipediaSanitize(value)
                    }
                    break;
                  case 'Publisher':
                    updatedFields.publisher = {
                      'en-US': getWikipediaSanitize(value)
                    }
                    break;
                  case 'Launched':
                  case 'Founded':
                    const splitDate = value.split(';');
                    updatedFields.founded = {
                      'en-US': getWikipediaSanitize(splitDate[0])
                    }
                    break;
                  case 'Format':
                  case 'Type':
                  case 'Type of site':
                    if (Array.isArray(value)) {
                      value.map(type => format.push(getWikipediaSanitize(type)));
                    } else {
                      format.push(getWikipediaSanitize(value));
                    }
                    break;
                  case 'Political alignment':
                    if (Array.isArray(value)) {
                      value.map(alignment => politicalAlignment.push(getWikipediaSanitize(alignment)));
                    } else {
                      politicalAlignment.push(getWikipediaSanitize(value));
                    }
                    break;
                  case 'Alexa rank':
                  case 'Area served':
                  case 'CEO':
                  case 'Commercial':
                  case 'Created by':
                  case 'Current status':
                  case 'Editor':
                  case 'Industry':
                  case 'Key people':
                  case 'Registration':
                  case 'Services':
                  case 'Website':
                    // To be ignored
                    break;
                  default:
                    console.log(`${label} --is missing, (${value})`);
                }
              });
              updatedFields.description = {
                'en-US': getWikipediaSanitize(description.description)
              }
              updatedFields.format = {
                'en-US': format
              }
              updatedFields.politicalAlignment = {
                'en-US': politicalAlignment
              }

              const newFields = Object.assign({}, fields, updatedFields);
              return cfPostApi(entry.sys.id, entry.sys.version, {
                "fields": newFields
              });
            })
            .then((entry) => console.log(`** ${entry.fields.name['en-US']} ${typeOfUpdate} updated & published.`))
            .catch(console.error);
        });
    });
  })
  .catch(console.error);
