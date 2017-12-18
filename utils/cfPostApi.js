import request from "superagent";

export default function (api, cfCmaToken, revision, data) {
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
