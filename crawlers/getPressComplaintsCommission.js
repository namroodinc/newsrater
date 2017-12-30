import osmosis from "osmosis";
import { pccBaseUrl } from "../config";

const cleanString = (text) => {
  const value = text.value.match(/\(([^)]+)\)/)[1];
  return parseInt(value);
}

module.exports = (publication) => {
  const returnResults = (decision) => new Promise((resolve) => { // TODO: Add reject (resolve, reject) error
    let savedData = 0;
    osmosis
      .get(`${pccBaseUrl}publication=${publication}&decision=${decision}&cases=on`)
      .find('.content table')
      .set({
        value: 'td b'
      })
      .data((text) => savedData = cleanString(text))
      .done(() => resolve(savedData));
  });

  return Promise.all([returnResults(0), returnResults(1), returnResults(2), returnResults(3), returnResults(4)]).then((values) => {
    const val0 = parseInt(values[0]);
    const val1 = parseInt(values[1]);
    const val2 = parseInt(values[2]);
    const val3 = parseInt(values[3]);
    const val4 = parseInt(values[4]);
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
