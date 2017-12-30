import * as contentful from "contentful-management";
import getPressComplaintsCommission from "../crawlers/getPressComplaintsCommission";
import { cfSpaceId, cfCmaToken } from "../config";
const client = contentful.createClient({
  accessToken: cfCmaToken
});
const getSpace = client.getSpace(cfSpaceId);
const typeOfUpdate = 'Press Complaints Commission';

getSpace
  .then((space) => space.getEntries({
    content_type: 'publication'
  }))
  .then((response) => {
    response.items.map(data => {
      if (data.fields.checkPcc['en-US']) {
        getPressComplaintsCommission(`${data.fields.name['en-US']}`)
          .then((pccResponse) => {
            getSpace
              .then((space) => space.getEntry(data.sys.id))
              .then((entry) => {
                entry.fields.pressComplaints['en-US'] = {
                  timestamp: Date.now(),
                  data: pccResponse
                };
                return entry.update();
              })
              .then((entry) => entry.publish())
              .then((entry) => console.log(`** ${entry.fields.name['en-US']} ${typeOfUpdate} updated & published.`))
              .catch(console.error);
          });
      }
    });
  })
  .catch(console.error);
