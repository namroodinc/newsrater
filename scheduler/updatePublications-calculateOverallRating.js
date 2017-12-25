import * as contentful from "contentful-management";
import { cfSpaceId, cfCmaToken } from "../config";
const client = contentful.createClient({
  accessToken: cfCmaToken
});
const getSpace = client.getSpace(cfSpaceId);
const typeOfUpdate = 'calculating Overall Rating';

const getSum = (total, num) => {
  return total + num;
}

getSpace
  .then((space) => space.getEntries({
    content_type: 'publication'
  }))
  .then((response) => {
    response.items.map(data => {
      getSpace
        .then((space) => space.getEntry(data.sys.id))
        .then((entry) => {
          const articles = entry.fields.articles['en-US'];
          const mappedArticles = articles.map((article) => {
            const { title, description } = article.sentimentScore;
            const titleScore = title.score;
            const descriptionScore = description.score;
            return ((titleScore + descriptionScore) / 2);
          });
          const reduceArticles = mappedArticles.reduce(getSum);
          const articleSentimentAnalysis = (reduceArticles / articles.length);
          entry.fields.overallRating['en-US'].push({
            timestamp: Date.now(),
            ratings: {
              articleSentimentAnalysis
            }
          });
          return entry.update();
        })
        .then((entry) => entry.publish())
        .then((entry) => console.log(`** ${entry.fields.name['en-US']} ${typeOfUpdate} updated & published.`))
        .catch(console.error);
    });
  })
  .catch(console.error);
