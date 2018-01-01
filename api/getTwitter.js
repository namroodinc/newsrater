import twitter from "twitter";
import { twitterConsumerKey, twitterConsumerSecret, twitterAccessToken, twitterAccessTokenSecret } from "../config";

const client = new twitter({
  consumer_key: twitterConsumerKey,
  consumer_secret: twitterConsumerSecret,
  access_token_key: twitterAccessToken,
  access_token_secret: twitterAccessTokenSecret
});

module.exports = (searchTerm) => {
  const returnSearchTermResults = new Promise((resolve, reject) => {
    const params = {
      q: searchTerm
    };
    client.get('users/search', params, function(error, tweets, response) {
      if (!error) {
        resolve(response.body);
      } else {
        reject(error);
      }
    });
  });

  return Promise.all([returnSearchTermResults]).then((values) => {
    return {
      'results': JSON.parse(values[0])
    };
  });
}
