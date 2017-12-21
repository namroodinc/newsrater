var asciify = require("asciify");

var style = {
  color: 'yellow',
  font: 'alligator2'
};

asciify(`Newsrater`, style, (err, res) => console.log(res));
asciify(`Scheduler`, style, (err, res) => console.log(res));
