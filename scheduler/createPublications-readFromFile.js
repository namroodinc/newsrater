import read from "read-file";
import { csvParseRows } from "d3";

import stepTwo from "../inquirer/createNewPublication-stepTwo";

read("./list.csv", (err, buffer) => {
  const parsedRows = csvParseRows(buffer.toString('utf8'));

  function delay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }

  async function delayedLog(data) {
    await delay();
    stepTwo(data[0], data[1], data[2], data[3], data[4], data[5]);
  }

  async function processArray(parsedRows) {
    parsedRows.forEach(async (data) => {
      await delayedLog(data);
    });
    console.log("Done!");
  }

  processArray(parsedRows);
});
