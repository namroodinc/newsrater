import * as contentful from "contentful-management";
import twitter from "twitter";
import { twitterConsumerKey, twitterConsumerSecret, twitterAccessToken, twitterAccessTokenSecret } from "../config";

const twitterClient = new twitter({
  consumer_key: twitterConsumerKey,
  consumer_secret: twitterConsumerSecret,
  access_token_key: twitterAccessToken,
  access_token_secret: twitterAccessTokenSecret
});

const client = contentful.createClient({
  accessToken: cfCmaToken
});
const getSpace = client.getSpace(cfSpaceId);

import { cfSpaceId, cfCmaToken } from "../config";

getSpace
  .then((space) => space.getEntries({
    content_type: 'publication',
    order: 'sys.updatedAt'
  }))
  .then((response) => {
    response.items.map(data => {

      const params = {
        screen_name: data.fields.twitterAccounts['en-US'][0].screenName
      };
      twitterClient.get('users/show', params, function(error, tweets, response) {
        if (!error) {
          const body = JSON.parse(response.body);
          const fileUrl = body.profile_image_url_https.replace('_normal', '');
          const fileTypeSplit = fileUrl.split('.');
          const fileType = fileTypeSplit[fileTypeSplit.length - 1];
          console.log(data.sys.id);

          getSpace
            .then((space) => space.createAsset({
              fields: {
                title: {
                  'en-US': `${data.fields.name['en-US']} Avatar`
                },
                file: {
                  'en-US': {
                    contentType: `image/${fileType}`,
                    fileName: `${data.sys.id}.${fileType}`,
                    upload: fileUrl
                  }
                }
              }
            }))
            .then((asset) => asset.processForAllLocales())
            .then((asset) => console.log(asset))
            .catch(console.error)

        } else {
          console.log(error);
        }
      });

    });
  })
  .catch(console.error);
