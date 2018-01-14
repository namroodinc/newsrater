import scraper from "table-scraper";

module.exports = (api) => {
  const globals = new Promise((resolve) => { // TODO: Add reject (resolve, reject) error
    scraper
      .get(api)
      .then(function(tableData) {
        resolve(tableData);
      });
  });

  return Promise.all([globals]).then((values) => {
    return values[0];
  });
}
