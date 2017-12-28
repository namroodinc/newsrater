import * as contentful from "contentful-management";
import parseDomain from "parse-domain";
import sentiment from "sentiment";

import isoFetch from "isomorphic-fetch";
import { parseString } from "xml2js";

const client = contentful.createClient({
  accessToken: cfCmaToken
});
const getSpace = client.getSpace(cfSpaceId);

import { cfSpaceId, cfCmaToken, googleNews } from "../config";
// const typeOfUpdate = 'Latest Google News Headlines';

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
      const parsedDomain = parseDomain(data.fields.website['en-US']);
      const { domain, tld } = parsedDomain;

      isoFetch(`${googleNews}/site:${domain}.${tld}/site:${domain}.${tld}`, {
        method: 'GET'
      })
        .then(response => {
          if (response.ok) {
            return response.text();
          }
          throw new Error(`Fetch ${domain}.${tld} failed`);
        })
        .then(body => {
          parseString(body, function( err, result ) {
            var s = JSON.stringify(result.rss.channel[0].item, undefined, 3);
            console.log(`${googleNews}/site:${domain}.${tld}/site:${domain}.${tld}`);
            var mapped = JSON.parse(s);
            mapped.map(res => console.log(sentimentResponse(res.title[0])));
            console.log('-------------------------------')
          });
        })
    });
  });
