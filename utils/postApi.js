import request from "superagent";

export default function (api, data) {
  console.log(api, data);
  return new Promise((resolve, reject) => {
    request
      .post(api)
      .set('Content-Type', 'application/json')
      .send(data)
      .end(function(err, res){
        console.log(err, res);
        if (err || !res.ok) {
          reject(res.toError());
        } else {
          resolve(res.body);
        }
      });
  });
}
