import * as contentful from "contentful-management";

const client = contentful.createClient({
  accessToken: cfCmaToken
});
const getSpace = client.getSpace(cfSpaceId);

import getApi from "../utils/getApi";
// import postApi from "../utils/postApi";
import { cfSpaceId, cfCmaToken, d4TaggingUrl, newsApi, newsApiKey } from "../config";
// mongoDb, mongoDbApiKey, mongoDbBaseUrl, 

getSpace
  .then((space) => space.getEntries({
    content_type: 'publication'
  }))
  .then((response) => {
    response
      .items
      .filter(data => {
        const countryCode = !data.fields.countryGeocode ? null : data.fields.countryGeocode['en-US'];
        return (countryCode === 'GB' || countryCode === 'US' || countryCode === 'AU')
      })
      .map(data => {
        const newsApiId = !data.fields.newsApiId ? null : data.fields.newsApiId['en-US'];

        if (newsApiId) {
          const lang = 'en';
          getApi(`${newsApi}?sources=${newsApiId}&apiKey=${newsApiKey}`)
            .then(results => {

              const articles = results.articles.map(article => {
                const { publishedAt, title, url } = article;
                return {
                  publishedAt,
                  title,
                  url
                }
              });

              const articleTagging = articles.map(article => {
                const { publishedAt, title, url } = article;
                return new Promise((resolve) => {
                  getApi(`${d4TaggingUrl}${encodeURIComponent(title.trim())}&lang=${lang}`)
                    .then((data) => {
                      const trends = data
                        .annotations
                        .filter(annotation => annotation['link_probability'] > 0.2);

                      resolve({
                        publishedAt,
                        title,
                        url,
                        trends
                      });
                    });
                });
              });

              return Promise.all(articleTagging)
                .then((values) => {
                  values.map((value) => {
                    console.log(value.title);
                    // values.trends.map(trend => {
                    //   return new Promise(resolve => {
                    //     postApi(
                    //       `${mongoDbBaseUrl}${mongoDb}/collections/metrics?apiKey=${mongoDbApiKey}`,
                    //       {
                    //         'type': 'trend',
                    //         'body': {
                    //           'title': trend.title,
                    //           'description': trend.title
                    //         }
                    //       }
                    //     ).then(values => console.log(values));
                    //   });
                    // });
                    console.log('---------');
                  })
                });

            });
        }
      });
  })
  .catch(console.error);
