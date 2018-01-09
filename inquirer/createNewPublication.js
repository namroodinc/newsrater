import inquirer from "inquirer";
import stepTwo from "./createNewPublication-stepTwo";

const questions = [
  {
    type: 'input',
    name: 'name',
    message: "Name"
  },
  {
    type: 'input',
    name: 'disambiguation',
    message: "Disambiguation"
  },
  {
    type: 'input',
    name: 'sundayEdition',
    message: "Sunday Edition"
  },
  {
    type: 'input',
    name: 'website',
    message: "Website"
  },
  {
    type: 'input',
    name: 'newsApiId',
    message: "News API ID"
  },
  {
    type: 'list',
    name: 'pcc',
    message: "PCC",
    choices: [
      {
        name: 'Yes',
        checked: true
      },
      {
        name: 'No'
      }
    ]
  },
  {
    type: 'list',
    name: 'ipso',
    message: "IPSO",
    choices: [
      {
        name: 'Yes',
        checked: true
      },
      {
        name: 'No'
      }
    ]
  }
];

inquirer.prompt(questions).then(answers => {
  const { name, disambiguation, sundayEdition, website, newsApiId, pcc, ipso } = answers;
  stepTwo(name, disambiguation, sundayEdition, website, newsApiId, pcc, ipso);
});
