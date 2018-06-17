import * as contentful from "contentful-management";

const client = contentful.createClient({
  accessToken: cfCmaToken
});
const getSpace = client.getSpace(cfSpaceId);

import getApi from "../utils/getApi";
import { cfSpaceId, cfCmaToken, d4TaggingUrl, newsApi, newsApiKey } from "../config";
//, mongoDb, mongoDbApiKey, mongoDbBaseUrl

getSpace
  .then((space) => space.getEntries({
    content_type: 'publication'
  }))
  .then((response) => {
    response.items.map(data => {
      const newsApiId = !data.fields.newsApiId ? null : data.fields.newsApiId['en-US'];
      const countryCode = !data.fields.countryGeocode ? null : data.fields.countryGeocode['en-US'];

      if (newsApiId && (countryCode === 'GB' || countryCode === 'US' || countryCode === 'AU' || countryCode === 'DE')) {
        let lang = 'en';
        if (countryCode === 'DE') {
          lang = 'de';
        } else if (countryCode === 'IT') {
          lang = 'it';
        }

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
                    const tags = data
                      .annotations
                      .filter(annotation => annotation['link_probability'] > 0.2);

                    resolve({
                      publishedAt,
                      title,
                      url,
                      tags
                    });
                  });
              });
            });

            return Promise.all(articleTagging)
              .then((values) => {
                values.map((value) => {
                  console.log(value.publishedAt);
                  console.log(value.title);
                  console.log(value.url);
                  console.log(value.tags);
                  console.log('---------');
                })
              });

          });
      } else {
        console.log(newsApiId, ' not annotated as not English/German/Italian');
      }
    });
  })
  .catch(console.error);
