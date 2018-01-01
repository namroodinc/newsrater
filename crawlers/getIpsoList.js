import osmosis from "osmosis";
import { ipsoList } from "../config";

module.exports = (name, website) => {
  const returnResults = new Promise((resolve) => { // TODO: Add reject (resolve, reject) error
    let savedData = [];
    osmosis
      .get(`${ipsoList}`)
      .find('.menu--theme-pink-nested')
      .set({
        label: 'input@id',
        value: 'label'
      })
      .data((listings) => {
        const { label, value } = listings;
        const labelSplit = label.split('-');
        const valueSanitize = value.replace(/ *\([^)]*\) */g, "");
        savedData.push({
          id: labelSplit[1],
          name: valueSanitize
        })
      })
      .done(() => resolve(savedData));
  });

  return Promise.all([returnResults]).then((values) => {
    const filteredIpsoList = values[0].filter(list => list.name.indexOf(name) !== -1 || list.name.indexOf(website) !== -1)
    return filteredIpsoList;
  });
}
