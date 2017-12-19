import * as contentful from "contentful-management";
import sentiment from "sentiment";
import getApi from "../utils/getApi";
import { cfSpaceId, cfCmaToken, newsApi, newsApiKey } from "../config";
const client = contentful.createClient({
  accessToken: cfCmaToken
});
const getSpace = client.getSpace(cfSpaceId);

getSpace
  .then((space) => space.getEntries({
    content_type: 'publication'
  }))
  .then((response) => {
    response.items.map(data => {
      const newsApiId = data.fields.newsApiId['en-US'];
      getApi(`${newsApi}?sources=${newsApiId}&apiKey=${newsApiKey}`)
        .then(results => {
          getSpace
            .then((space) => space.getEntry(data.sys.id))
            .then((entry) => {
              results.articles.map(article => {
                const { author, description, publishedAt, title } = article;
                entry.fields.articles['en-US'].push({
                  author,
                  description,
                  publishedAt,
                  title,
                  sentimentScore: {
                    description: sentiment(description),
                    title: sentiment(title)
                  }
                });
              });
              return entry.update();
            })
            .then((entry) => console.log(`* ${entry.fields.name['en-US']} Site Rankings updated.`))
            .catch(console.error)
        })
    });
  })
  .catch(console.error);
