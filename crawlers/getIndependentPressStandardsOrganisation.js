import osmosis from "osmosis";
import { ipsoBaseUrl } from "../config";

const getNumberOfCases = (listings) => {
  return parseInt(listings.length);
}

module.exports = (publications) => {
  const returnResults = (outcomes) => new Promise((resolve) => { // TODO: Add reject (resolve, reject) error
    let savedData = [];
    osmosis
      .get(`${ipsoBaseUrl}publications=${publications}&outcomes=${outcomes}`)
      .find('.tabs--table')
      .set('value')
      .follow('@href')
      .data((listings) => {
        const { value } = listings;
        savedData.push({
          value
        })
      })
      .done(() => resolve(getNumberOfCases(savedData)));
  });

  return Promise.all([returnResults('3'), returnResults('26,1'), returnResults('2'), returnResults('27'), returnResults('28')]).then((values) => {
    const val0 = values[0];
    const val1 = values[1];
    const val2 = values[2];
    const val3 = values[3];
    const val4 = values[4];
    return {
      'Resolved': val0,
      'Upheld': val1,
      'Not Upheld': val2,
      'Sufficient Remedial Action': val3,
      'No finding': val4,
      'Total': (val0 + val1 + val2 + val3 + val4)
    };
  });
}
