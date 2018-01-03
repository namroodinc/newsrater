import getWikipediaSanitize from "./getWikipediaSanitize";

export default function (wikipediaResponse) {
  let updatedFields = {};
  let updatedArrays = {
    format: [],
    politicalAlignment: []
  }

  const { infobox, description } = wikipediaResponse;

  const formatValue = (field, value, pushTo) => {

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
        value.map((val, i) => i === 0 ? newValue += val : newValue += `, ${val}`);
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
        formatValue('ownership', value);
        break;
      case 'Available in':
      case 'Language':
        formatValue('language', value);
        break;
      case 'Number of employees':
        formatValue('numberOfEmployees', value);
        break;
      case 'ISSN':
        formatValue('issn', value);
        break;
      case 'OCLC number':
        formatValue('oclcNumber', value);
        break;
      case 'Headquarters':
        formatValue('headquarters', value);
        break;
      case 'Circulation':
        formatValue('circulation', value);
        break;
      case 'Readership':
        formatValue('readership', value);
        break;
      case 'Publisher':
        formatValue('publisher', value);
        break;
      case 'Launched':
      case 'Founded':
        formatValue('founded', value);
        break;
      case 'Format':
      case 'Type':
      case 'Type of site':
        formatValue('founded', value, 'format');
        break;
      case 'Political alignment':
        formatValue('founded', value, 'politicalAlignment');
        break;
      case 'Alexa rank':
      case 'Area served':
      case 'CEO':
      case 'Commercial':
      case 'Country':
      case 'Created by':
      case 'Current status':
      case 'Editor':
      case 'Industry':
      case 'Key people':
      case 'Registration':
      case 'Services':
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
  updatedFields.format = {
    'en-US': updatedArrays.format
  }
  updatedFields.politicalAlignment = {
    'en-US': updatedArrays.politicalAlignment
  }

  return updatedFields;
}
