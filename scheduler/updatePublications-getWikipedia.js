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
                  case 'Language':
                  case 'Available in':
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
                  case 'OCLC number':
                    updatedFields.oclcNumber = {
                      'en-US': getWikipediaSanitize(value)
                    }
                    break;
                  case 'Headquarters':
                    updatedFields.headquarters = {
                      'en-US': getWikipediaSanitize(value)
                    }
                    break;
                  case 'Circulation':
                    updatedFields.circulation = {
                      'en-US': getWikipediaSanitize(value)
                    }
                    break;
                  case 'Launched':
                  case 'Founded':
                    console.log(value);
                    break;
                  default:
                    console.log(`${label} --is missing, (${value})`);
                }
              });
              updatedFields.description = {
                'en-US': getWikipediaSanitize(description.description)
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
