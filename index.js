const express = require('express');
require('dotenv').config();

const getAlexa = require('./crawlers/getAlexa');

const app = express();
const router = express.Router();

// Environment Variables
const ALEXA_RANK = process.env.ALEXA_RANK;

app.set('trust proxy', 1); // trust first proxy
app.set('port', (process.env.PORT || 5000));
app.use('/', router);



// Alexa
app.get('/api/alexa/:website*', function response(req, res) {
  const website = req.params.website;

  console.log(website);

  const alexaBody = getAlexa(`${ALEXA_RANK}${website}`);
  alexaBody.then((data) => {
    res.send(data);
  });
});


// mLabs
app.get('/api/insert*', function response(req, res) {
  const query = req.query.url;
  console.log(query);
});



//
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
