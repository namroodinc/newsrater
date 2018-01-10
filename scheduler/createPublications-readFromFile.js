import read from "read-file";
import { csvParseRows } from "d3";

import stepTwo from "../inquirer/createNewPublication-stepTwo";

read("./list.csv", (err, buffer) => {
  const parsedRows = csvParseRows(buffer.toString('utf8'));

  const publications = parsedRows;
  let publicationsCopy = publications.slice(0);

  function copyFilesAndRunAnalysis(publication) {
    return new Promise(function(resolve) {
      stepTwo(publication[0], publication[1], publication[2], publication[3], publication[4], publication[5], publication[6])
        .then(answers => {
          console.log(answers);
          resolve(publication); // control should return to generator here
        });
    });
  }

  function* doPublication(publications) {
    yield copyFilesAndRunAnalysis(publications);
  }

  // BEGIN HERE
  console.log("Start.");

  const publicationBatch = doPublication(publicationsCopy.shift());
  publicationBatch.next().value.then(function re(data) {
    console.log(data);
    return publicationsCopy.length ? doPublication(publicationsCopy.shift()).next().value.then(re) : "Finished."
  })
    .then((complete) => {
      console.log(complete);
    });

});
