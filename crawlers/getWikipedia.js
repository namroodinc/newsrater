import osmosis from "osmosis";
import { wikipediaSearch } from "../config";

export default function (publicationName, publicationDisambiguation) {
  let apiUrl = `${wikipediaSearch}?search=${publicationName}`;
  if (publicationDisambiguation !== '') apiUrl += ` (${publicationDisambiguation})`;

  const globals = new Promise((resolve) => { // TODO: Add reject (resolve, reject) error
    let savedData = [];
    osmosis
      .get(apiUrl)
      .find('.infobox tr')
      .set({
        label: 'th',
        value: 'th + td',
        valueLinkText: 'th + td a',
        valueLinkHref: 'th + td a@href'
      })
      .data((listings) => {
        const {
          label,
          value
        } = listings;
        if (label && value !== undefined) {
          const splitValue = value.split('\n');
          if (splitValue.length > 1) {
            if (splitValue !== '') {
              savedData.push({
                label,
                value: splitValue
              });
            }
          } else {
            savedData.push(listings);
          }
        }
      })
      .done(() => resolve(savedData));
  });

  // Infobox - what I need to get
    // Type, Type of site
    // Format, Picture format
    // Owner(s), Owned by, Owner
    // Founded, Launched
    // Political alignment
    // Language, Available in
    // Headquarters
    // Country
    // Circulation
    // ISSN
    // OCLC Number
    // Website

  const description = new Promise((resolve) => { // TODO: Add reject (resolve, reject) error
    let wikipediaDescription = "";
    osmosis
      .get(apiUrl)
      .find('.infobox + p, .thumb.tright + p, .vertical-navbox + p')
      .set('description')
      .data((description) => {
        wikipediaDescription = description;
      })
      .done(() => resolve(wikipediaDescription));
  });

  return Promise.all([globals, description]).then((values) => {
    return {
      infobox: values[0],
      description: values[1]
    }
  });

}
