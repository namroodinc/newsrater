import request from "superagent";
import { cfBaseUrl, cfSpaceId, cfCmaToken } from "../config";

export default function (entryId, revision, data) {
  const api = `${cfBaseUrl}/spaces/${cfSpaceId}/entries/${entryId}`;
  return new Promise((resolve, reject) => {
    request('PUT', api)
      .set('Authorization', `Bearer ${cfCmaToken}`)
      .set('Content-Type', 'application/vnd.contentful.management.v1+json')
      .set('X-Contentful-Version', revision)
      .send(data)
      .end(function(err, res){
        if (err || !res.ok) {
          reject(res.toError());
        } else {
          resolve(res.body);
        }
      });
  });
}
