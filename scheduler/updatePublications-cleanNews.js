import * as contentful from "contentful-management";

const client = contentful.createClient({
  accessToken: cfCmaToken
});
const getSpace = client.getSpace(cfSpaceId);

import { cfSpaceId, cfCmaToken } from "../config";
const typeOfUpdate = 'news articles';

getSpace
  .then((space) => space.getEntries({
    content_type: 'publication',
    // limit: 10,
    order: 'sys.updatedAt'
  }))
  .then((response) => {
    response.items.map(data => {

      getSpace
        .then((space) => space.getEntry(data.sys.id))
        .then((entry) => {

          console.log('Before there were: ', entry.fields.articles['en-US'].length, ' news articles');
          const articleSort = entry.fields.articles['en-US'].sort((a, b) => {
            return new Date(b.publishedAt) - new Date(a.publishedAt);
          }).splice(0, 40);
          console.log('Now there are: ', articleSort.length, ' news articles');

          console.log('Before there were: ', entry.fields.articlesTags['en-US'].length, ' news articles tags');
          const articlesTagsSort = entry.fields.articlesTags['en-US'].sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
          }).splice(0, 30);
          console.log('Now there are: ', articleSort.length, ' news articles tags');

          entry.fields.articles['en-US'] = articleSort;
          entry.fields.articlesTags['en-US'] = articlesTagsSort;
          return entry.update();
        })
        .then((entry) => entry.publish())
        .then((entry) => console.log(`** ${entry.fields.name['en-US']} ${typeOfUpdate} cleaned & published.`))
        .catch(console.error);

    });
  })
  .catch(console.error);
