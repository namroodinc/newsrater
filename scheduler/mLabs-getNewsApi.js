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

      if (newsApiId) {
        getApi(`${newsApi}?sources=${newsApiId}&apiKey=${newsApiKey}`)
          .then(results => {

            const articles = results.articles.map(article => {
              const { title } = article;
              return title;
            });

            const articleTagging = articles.map(title => {
              return new Promise((resolve) => {
                getApi(`${d4TaggingUrl}${encodeURIComponent(title.trim())}`)
                  .then((data) => {
                    const results = data
                      .annotations
                      .filter(annotation => annotation['link_probability'] > 0.2);

                    resolve({
                      title,
                      data: results
                    });
                  });
              });
            });

            return Promise.all(articleTagging)
              .then((values) => {
                values.map((value) => {
                  console.log(value.title);
                  console.log(value.data);
                  console.log('---------');
                })
              });

          });
      }
    });
  })
  .catch(console.error);
