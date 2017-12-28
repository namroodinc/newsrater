import * as contentful from "contentful-management";
import sentiment from "sentiment";

const client = contentful.createClient({
  accessToken: cfCmaToken
});
const getSpace = client.getSpace(cfSpaceId);

import getApi from "../utils/getApi";
import sentimentTags from "../utils/sentiment/tags";
import { cfSpaceId, cfCmaToken, newsApi, newsApiKey } from "../config";
const typeOfUpdate = 'Top Headlines for today';

const sentimentResponse = (text) => {
  const { score, positive, negative } = sentiment(text, sentimentTags);
  return {
    score,
    positive,
    negative
  }
}

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
            getSpace
              .then((space) => space.getEntry(data.sys.id))
              .then((entry) => {
                results.articles.map(article => {
                  const { publishedAt, title, url } = article;
                  const articleFindIndex = entry.fields.articles['en-US'].findIndex(article => article.title === title);
                  if (articleFindIndex < 0) {
                    entry.fields.articles['en-US'].push({
                      publishedAt,
                      title,
                      url,
                      sentimentScore: {
                        title: sentimentResponse(title)
                      }
                    });
                  }
                });
                return entry.update();
              })
              .then((entry) => entry.publish())
              .then((entry) => console.log(`** ${entry.fields.name['en-US']} ${typeOfUpdate} updated & published.`))
              .catch(console.error);
          });
      }
    });
  })
  .catch(console.error);
