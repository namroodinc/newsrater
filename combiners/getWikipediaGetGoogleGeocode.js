import getGoogleGeocode from "../api/getGoogleGeocode";
import getWikipedia from "../crawlers/getWikipedia";
import getWikipediaResponse from "../utils/getWikipediaResponse";

export default function (publicationName, publicationDisambiguation, publicationHq) {

  const globals = new Promise((resolve) => {

    getWikipedia(publicationName, publicationDisambiguation, publicationHq)
      .then((wikipediaResponse) => {
        let updatedFields = getWikipediaResponse(wikipediaResponse);

        if (updatedFields.headquarters !== undefined || publicationHq !== undefined) {
          const address = updatedFields.headquarters !== undefined ? updatedFields.headquarters['en-US'] : publicationHq['en-US'];
          console.log(address);
          getGoogleGeocode(address)
            .then(geocode => {
              const geocodeResult = geocode.address.results[0];
              const countryNameCode = geocodeResult.address_components.filter(component => component.types.indexOf('country') !== -1);
              const geocodeAddress = {
                geocodeAddress: {
                  'en-US': geocodeResult
                },
                headquarters: {
                  'en-US': geocodeResult.formatted_address
                },
                country: {
                  'en-US': countryNameCode[0].long_name
                },
                countryGeocode: {
                  'en-US': countryNameCode[0].short_name
                }
              };

              const newFields = Object.assign({}, updatedFields, geocodeAddress);
              resolve(newFields);
            });

        } else {

          resolve(updatedFields);

        }

      });

  });

  return Promise.all([globals]).then((values) => {
    return values[0];
  });

}
