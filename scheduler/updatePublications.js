import getAlexa from "../crawlers/getAlexa";
import getApi from "../utils/getApi";
import postApi from "../utils/postApi";
import { alexaRankBaseUrl, mongoDb, mongoDbApiKey, mongoDbBaseUrl } from "../config";

const mLabsApi = `${mongoDbBaseUrl}${mongoDb}/collections/publications?apiKey=${mongoDbApiKey}`;

getApi(mLabsApi)
  .then(results => {
    return Promise.all(results.map(data => getAlexa(`${alexaRankBaseUrl}${data.website}`))).then((promises) => {
      promises.map((data, i) => {
        let result = results[i];
        result.stats.push({
          timestamp: Date.now(),
          data
        });
        postApi(`${mLabsApi}&q={'_id':${results[i]._id['$oid']}}`, result).then(response => console.log(response));
      })
    });
  });
