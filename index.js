import express from "express";

import getAlexa from "./crawlers/getAlexa";
import getApi from "./utils/getApi";
import postApi from "./utils/postApi";

// Environment Variables
import { alexaRankBaseUrl, mongoDb, mongoDbApiKey, mongoDbBaseUrl } from "./config";

const app = express();
const router = express.Router();

app.set('trust proxy', 1); // trust first proxy
app.set('port', (process.env.PORT || 5000));
app.use('/', router);



// Alexa
app.get('/api/alexa/:website*', function response(req, res) {
  const website = req.params.website;
  const alexaBody = getAlexa(`${alexaRankBaseUrl}${website}`);
  alexaBody.then((data) => {
    res.send(data);
  });
});



// mLabs
// list collection
app.get('/api/list/:collection*', function response(req, res) {
  const { collection } = req.params;
  getApi(`${mongoDbBaseUrl}${mongoDb}/collections/${collection}?q=${JSON.stringify(req.query)}&apiKey=${mongoDbApiKey}`)
    .then((data) => {
      res.send(data);
    });
});
// insert into collection
app.get('/api/insert/:collection/:website*', function response(req, res) {
  const { collection, website } = req.params;
  const data = {
    website
  }
  postApi(`${mongoDbBaseUrl}${mongoDb}/collections/${collection}?apiKey=${mongoDbApiKey}`, data)
    .then((data) => {
      res.send(data);
    });
});



//
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
