import * as contentful from "contentful-management";
import parseDomain from "parse-domain";
import sentiment from "sentiment";
import isoFetch from "isomorphic-fetch";
import { parseString } from "xml2js";

const client = contentful.createClient({
  accessToken: cfCmaToken
});
const getSpace = client.getSpace(cfSpaceId);

import sentimentTags from "../utils/sentiment/tags";
import { cfSpaceId, cfCmaToken, googleNews } from "../config";
const typeOfUpdate = 'Latest Google News Headlines';

const getSum = (total, num) => {
  return total + num;
}

const sentimentResponse = (text, allCaps) => {
  const scoreCaps = allCaps.length > 0 ? allCaps.map(caps => caps.length * 0.5).reduce(getSum) : 0;

  const { score, positive, negative } = sentiment(text, sentimentTags);
  return {
    score: {
      score: (score + -scoreCaps),
      scoreCaps: -scoreCaps,
      scoreSentiment: score
    },
    positive,
    negative,
    allCaps
  }
}

getSpace
  .then((space) => space.getEntries({
    content_type: 'publication'
  }))
  .then((response) => {
    response.items.map(data => {
      const website = !data.fields.website ? null : data.fields.website['en-US'];

      if (website) {
        const parsedDomain = parseDomain(website);
        const { domain, tld } = parsedDomain;

        isoFetch(`${googleNews}/site:${domain}.${tld}/site:${domain}.${tld}`, {
          method: 'GET'
        })
          .then(response => {
            if (response.ok) return response.text();
            throw new Error(`Fetch ${domain}.${tld} failed`);
          })
          .then(body => {
            parseString(body, (err, result) => {
              const stringifyResults = JSON.stringify(result.rss.channel[0].item, undefined, 3);
              const results = JSON.parse(stringifyResults);

              console.log(results);

              getSpace
                .then((space) => space.getEntry(data.sys.id))
                .then((entry) => {

                  results.map(article => {
                    const { pubDate, title, link } = article;
                    const articleFindIndex = entry.fields.articles['en-US'].findIndex(article => article.title === title[0]);
                    if (articleFindIndex < 0) {
                      const allCaps = title[0].match(/\b([A-Z]{2,})\b/g);
                      let allCapsArray = allCaps ? allCaps.filter(caps => ((0.5 * caps.length) > 1.5)) : [];

                      entry.fields.articles['en-US'].push({
                        publishedAt: pubDate[0],
                        title: title[0],
                        url: link[0],
                        sentimentScore: {
                          title: sentimentResponse(title[0], allCapsArray)
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
          })
      }
    });
  });
