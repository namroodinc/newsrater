import { extremeNegative, extremePositive } from "../../config";

const percentage = (length, articlesLength, weighting) => {
  return (length * 100 / articlesLength) / weighting;
}

export default function (fieldsArticles) {
  const articles = fieldsArticles;

  const mappedArticles = articles.map((article) => {
    const { title } = article.sentimentScore;
    return ((title.score.score));
  });

  const scorePositive = mappedArticles.filter(num => num >= 0 && num < extremePositive);
  const scoreExtremePositive = mappedArticles.filter(num => num >= extremePositive);
  const scoreNegative = mappedArticles.filter(num => num < 0 && num > extremeNegative);
  const scoreExtremeNegative = mappedArticles.filter(num => num <= extremeNegative);

  const scorePositivePercentage = percentage(scorePositive.length, articles.length, 1);
  const scoreExtremePositivePercentage = percentage(scoreExtremePositive.length, articles.length, 2);
  const scoreNegativePercentage = percentage(scoreNegative.length, articles.length, 3);
  const scoreExtremeNegativePercentage = percentage(scoreExtremeNegative.length, articles.length, 4);

  return (scorePositivePercentage + scoreExtremePositivePercentage + scoreNegativePercentage + scoreExtremeNegativePercentage);
}
