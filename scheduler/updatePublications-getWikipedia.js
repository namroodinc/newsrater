import * as contentful from "contentful-management";

import getWikipedia from "../crawlers/getWikipedia";
import cfPostApi from "../utils/cfPostApi";
import getWikipediaResponse from "../utils/getWikipediaResponse";
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
      getWikipedia(name, disambiguation)
        .then((wikipediaResponse) => {
          getSpace
            .then((space) => space.getEntry(data.sys.id))
            .then((entry) => {
              let fields = Object.assign({}, entry.fields);
              let updatedFields = getWikipediaResponse(wikipediaResponse);

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
