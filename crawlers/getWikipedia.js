import osmosis from "osmosis";
import { wikipediaSearch } from "../config";

export default function (publicationName) {
  const globals = new Promise((resolve) => { // TODO: Add reject (resolve, reject) error
    let savedData = [];
    osmosis
      .get(`${wikipediaSearch}?search=${publicationName}`)
      .find('.infobox tr')
      .set({
        label: 'th',
        value: 'th + td',
        valueLinkText: 'th + td a',
        valueLinkHref: 'th + td a@href'
      })
      .data((listings) => {
        const { label } = listings;
        if (label) savedData.push(listings);
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
      .get(`${wikipediaSearch}?search=${publicationName}`)
      .find('.infobox + p')
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
