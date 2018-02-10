import getWikipediaSanitize from "./getWikipediaSanitize";

export default function (wikipediaResponse) {
  let updatedFields = {};
  let updatedArrays = {
    format: [],
    politicalAlignment: []
  }

  const { infobox, description } = wikipediaResponse;

  const formatValue = ({ field, value, pushTo, arrayLimit }) => {

    if (pushTo !== undefined) {
      if (Array.isArray(value)) {
        value.map(val => {
          if (val !== '') updatedArrays[pushTo].push(getWikipediaSanitize(val))
        });
      } else {
        if (value !== '') updatedArrays[pushTo].push(getWikipediaSanitize(value));
      }
    } else {
      if (Array.isArray(value)) {
        let newValue = '';
        let oldValue = value;
        if (arrayLimit !== undefined) oldValue = value.slice(0, arrayLimit);
        oldValue.map((val, i) => i === 0 ? newValue += val : newValue += `, ${val}`);
        updatedFields[field] = {
          'en-US': getWikipediaSanitize(newValue)
        }
      } else {
        updatedFields[field] = {
          'en-US': getWikipediaSanitize(value)
        }
      }
    }

  }

  infobox.map(infoboxResponse => {
    const { label, value } = infoboxResponse;
    switch (label) {
      case 'Owner(s)':
      case 'Owned by':
      case 'Owner':
        formatValue({ field: 'ownership', value });
        break;
      case 'Available in':
      case 'Language':
        formatValue({ field: 'language', value });
        break;
      case 'Number of employees':
        formatValue({ field: 'numberOfEmployees', value });
        break;
      case 'ISSN':
        formatValue({ field: 'issn', value });
        break;
      case 'OCLC number':
        formatValue({ field: 'oclcNumber', value });
        break;
      case 'Headquarters':
        formatValue({ field: 'headquarters', value, arrayLimit: 1 });
        break;
      case 'Readership':
        formatValue({ field: 'readership', value });
        break;
      case 'Publisher':
        formatValue({ field: 'publisher', value });
        break;
      case 'Launched':
      case 'Founded':
        formatValue({ field: 'founded', value });
        break;
      case 'Format':
      case 'Type':
      case 'Type of site':
        formatValue({ value, pushTo: 'format' });
        break;
      case 'Political alignment':
        formatValue({ value, pushTo: 'politicalAlignment' });
        break;
      case 'Alexa rank':
      case 'Area served':
      case 'CEO':
      case 'Circulation':
      case 'Commercial':
      case 'Country':
      case 'Created by':
      case 'Current status':
      case 'Editor':
      case 'Founder':
      case 'Founder(s)':
      case 'Industry':
      case 'Key people':
      case 'Registration':
      case 'Services':
      case 'Sister newspapers':
      case 'Website':
        // To be ignored
        break;
      default:
        console.log(`${label} --is missing, (${value})`);
    }
  });
  updatedFields.description = {
    'en-US': getWikipediaSanitize(description.description)
  }
  if (updatedArrays.format.length > 0) {
    updatedFields.format = {
      'en-US': updatedArrays.format
    }
  }
  if (updatedArrays.politicalAlignment.length > 0) {
    updatedFields.politicalAlignment = {
      'en-US': updatedArrays.politicalAlignment
    }
  }

  return updatedFields;
}
