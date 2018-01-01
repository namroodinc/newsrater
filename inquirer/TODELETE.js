import inquirer from "inquirer";

import getTwitter from "../api/getTwitter";

const questions = [
  {
    type: 'input',
    name: 'name',
    message: "Name"
  }
];

inquirer.prompt(questions).then(answers => {
  const { name } = answers;

  getTwitter(`${name}`)
    .then((twitterResponse) => {
      const twitterSelection = {
        type: 'checkbox',
        name: 'twitterAccounts',
        message: 'Twitter Accounts',
        choices: twitterResponse.results.map(data => {
          const { id, name, screen_name, verified } = data;
          const isVerified = verified ? 'V -' : '';
          return {
            name: `${isVerified} ${name} (@${screen_name}) /id-${id}`
          }
        })
      }

      inquirer.prompt(twitterSelection).then(twitterAnswers => {
        const filteredAccounts = twitterAnswers.twitterAccounts.map(data => {
          const splitId = data.split('/id-');
          const filtered = twitterResponse.results.filter(filtered => filtered.id === parseInt(splitId[1]));
          const { id, name, screen_name, profile_background_color, verified } = filtered;
          return {
            id,
            name,
            screenName: screen_name,
            backgroundColor: profile_background_color,
            verified
          }
        });
        console.log(filteredAccounts);
      });
    });
});
