import * as contentful from "contentful-management";

import getWikipediaGetGoogleGeocode from "../combiners/getWikipediaGetGoogleGeocode";
import cfPostApi from "../utils/cfPostApi";
import { cfSpaceId, cfCmaToken } from "../config";
const typeOfUpdate = 'Information';

const client = contentful.createClient({
  accessToken: cfCmaToken
});
const getSpace = client.getSpace(cfSpaceId);

getSpace
  .then((space) => space.getEntries({
    content_type: 'publication'
  }))
  .then((response) => {
    response.items.map(data => {
      const name = data.fields.name['en-US'];
      const disambiguation = data.fields.disambiguation ? data.fields.disambiguation['en-US'] : '';
      getWikipediaGetGoogleGeocode(name, disambiguation, data.fields.headquarters)
        .then((wikipediaResponse) => {
          console.log(wikipediaResponse);
          getSpace
            .then((space) => space.getEntry(data.sys.id))
            .then((entry) => {
              let fields = Object.assign({}, entry.fields);
              let updatedFields = wikipediaResponse;

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
