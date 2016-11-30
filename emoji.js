var utils = require("./utils.js");

// grabbed from
// http://www.fileformat.info/info/unicode/char/2618/index.htm
var asUni = {
  grimace: "\uD83D\uDE2C",
  tiger: "\uD83D\uDC2F",
  newMoon: "\uD83C\uDF1A",
  fullMoon: "\uD83C\uDF1D",
  eastMoon: "\uD83C\uDF1B",
  westMoon: "\uD83C\uDF1C",
  shamrock: "\u2618",
  fourLeaf: "\uD83C\uDF40",
  rain: "\u26C8",
};

function lucky() {
  var luckyNumber = 10;
  var chance = utils.getRandomIntInclusive(1, luckyNumber);
  if (chance === luckyNumber) {
    return asUni["fourLeaf"];
    console.log("how lucky!")
  } else {
    return asUni["shamrock"];
  }
};


module.exports = {asUni, lucky};
