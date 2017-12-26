require('dotenv').config();

const alexaRankBaseUrl = process.env.ALEXA_RANK_BASE_URL;
const mongoDb = process.env.MONGODB_DB;
const mongoDbApiKey = process.env.MONGODB_API_KEY;
const mongoDbBaseUrl = process.env.MONGODB_BASE_URL;
const cfBaseUrl = process.env.CF_BASE_URL;
const cfSpaceId = process.env.CF_SPACE_ID;
const cfDeliveryApi = process.env.CF_DELIVERY_API;
const cfPreviewApi = process.env.CF_PREVIEW_API;
const cfCmaToken = process.env.CF_CMA_TOKEN;
const newsApi = process.env.NEWS_API;
const newsApiKey = process.env.NEWS_API_KEY;
const wikipediaSearch = process.env.WIKIPEDIA_SEARCH;
const calcEducation = process.env.CALC_EDUCATION;
const extremeNegative = process.env.EXTREME_NEGATIVE;
const extremePositive = process.env.EXTREME_POSITIVE;

export {
  alexaRankBaseUrl,
  mongoDb,
  mongoDbApiKey,
  mongoDbBaseUrl,
  cfBaseUrl,
  cfSpaceId,
  cfDeliveryApi,
  cfPreviewApi,
  cfCmaToken,
  newsApi,
  newsApiKey,
  wikipediaSearch,
  calcEducation,
  extremeNegative,
  extremePositive
};
