// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
// Returns a random integer between min (included) and max (included)
// Using Math.round() will give you a non-uniform distribution!
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  var ranInt = Math.floor(Math.random() * (max - min + 1)) + min;
  return ranInt;
}

// http://cwestblog.com/2011/05/02/cartesian-product-of-multiple-arrays/
function cartesianProductOf() {
  return Array.prototype.reduce.call(arguments, function(a, b) {
    var ret = [];
    a.forEach(function(a) {
      b.forEach(function(b) {
        ret.push(a.concat([b]));
      });
    });
    return ret;
  }, [[]]);
}

function identity(a) {
  return a;
}

module.exports = { getRandomIntInclusive, cartesianProductOf, identity };
