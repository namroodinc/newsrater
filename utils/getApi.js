import request from "superagent";

export default function (api) {
  console.log(api);
  return new Promise((resolve, reject) => {
    request
      .get(api)
      .end(function(err, res){
        if (err || !res.ok) {
          reject(res.toError());
        } else {
          resolve(res.body);
        }
      });
  })
}
