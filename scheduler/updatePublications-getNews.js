import * as contentful from "contentful-management";
import sentiment from "sentiment";
import getApi from "../utils/getApi";
import { cfSpaceId, cfCmaToken, newsApi, newsApiKey } from "../config";
const client = contentful.createClient({
  accessToken: cfCmaToken
});
const getSpace = client.getSpace(cfSpaceId);
const typeOfUpdate = 'Top Headlines for today';

const sentimentResponse = (text) => {
  const { score, comparative, words, positive, negative } = sentiment(text);
  return {
    score,
    comparative,
    words,
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
      const newsApiId = data.fields.newsApiId['en-US'];
      getApi(`${newsApi}?sources=${newsApiId}&apiKey=${newsApiKey}`)
        .then(results => {
          getSpace
            .then((space) => space.getEntry(data.sys.id))
            .then((entry) => {
              results.articles.map(article => {
                const { author, description, publishedAt, title } = article;
                const articleFindIndex = entry.fields.articles['en-US'].findIndex(article => article.title === title);
                if (articleFindIndex < 0) {
                  entry.fields.articles['en-US'].push({
                    author,
                    description,
                    publishedAt,
                    title,
                    sentimentScore: {
                      description: sentimentResponse(description),
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
    });
  })
  .catch(console.error);
