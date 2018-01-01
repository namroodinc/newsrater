import getApi from "../utils/getApi";
import { googleMapsGeolocationApi } from "../config";

module.exports = (address) => {
  const returnGoogleGeocodeResults = new Promise((resolve) => {
    getApi(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${googleMapsGeolocationApi}`)
      .then(results => {
        resolve(results);
      });
  });

  return Promise.all([returnGoogleGeocodeResults]).then((values) => {
    return {
      'address': values[0]
    };
  });
}
