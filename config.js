require('dotenv').config();

const alexaRankBaseUrl = process.env.ALEXA_RANK_BASE_URL;
const appBaseUrl = process.env.APP_BASE_URL;
const mongoDb = process.env.MONGODB_DB;
const mongoDbApiKey = process.env.MONGODB_API_KEY;
const mongoDbBaseUrl = process.env.MONGODB_BASE_URL;

export {
  alexaRankBaseUrl,
  appBaseUrl,
  mongoDb,
  mongoDbApiKey,
  mongoDbBaseUrl
};
