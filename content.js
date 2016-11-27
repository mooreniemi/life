var emoji = require("./emoji.js");
var utils = require("./utils.js");

/* @flow */

var size = 40;
var bw = 400;
var bh = bw;

function drawGrid(canvas, context) {
  var p = 10;

  for (var x = 0; x <= bw; x += size) {
    context.moveTo(0.5 + x + p, p);
    context.lineTo(0.5 + x + p, bh + p);
  }

  for (var y = 0; y <= bh; y += size) {
    context.moveTo(p, 0.5 + y + p);
    context.lineTo(bw + p, 0.5 + y + p);
  }

  context.fillStyle = "#89603e";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "#5FB661";
  context.stroke();
}


var zeroToNine = [...Array(10).keys()];
var gridAsArray = utils.cartesianProductOf(zeroToNine, zeroToNine);

function positionFromId(id) {
  var margin = 15;
  if(typeof(gridAsArray[id]) === 'undefined') {
    console.log(`off canvas position for id: ${id}`);
    return [-100,-100];
  }
  var [x, y] = gridAsArray[id];
  var position = [(x * size) + margin, (y * size) + margin];
  return position;
}

function lucky() {
  var luckyNumber = 10;
  var chance = utils.getRandomIntInclusive(1, luckyNumber);
  if (chance === luckyNumber) {
    console.log("how lucky!");
    return emoji["fourLeaf"];
  } else {
    return emoji["shamrock"];
  }
}
var offsets = { N: -1, S: 1, E: 10, W: -10 };
function printToCardinals(id, ctxt) {
  applyToNorth(id, printTo(lucky, ctxt));
  applyToSouth(id, printTo(lucky, ctxt));
  applyToEast(id, printTo(lucky, ctxt));
  applyToWest(id, printTo(lucky, ctxt));
}

function printTo(objFunc, ctxt) {
  function f(x, y) {
    var xOffset = 3;
    var yOffset = 24;
    ctxt.fillText(objFunc.call(), x + xOffset, y + yOffset);
  }
  return f;
}

function applyToNorth(id, nFunc) {
  var [c, d] = positionFromId(id + offsets['N']);
  nFunc.apply(null, [c, d]);
}
function applyToSouth(id, sFunc) {
  var [a, b] = positionFromId(id + offsets['S']);
  sFunc.apply(null, [a, b]);
}
function applyToEast(id, eFunc) {
  var [e, f] = positionFromId(id + offsets['E']);
  eFunc.apply(null, [e, f]);
}
function applyToWest(id, wFunc) {
  var [g, h] = positionFromId(id + offsets['W']);
  wFunc.apply(null, [g, h]);
}

var currentGridState = Array.from(new Array(100), () => []);
var updatedGridState = Array.from(new Array(100), () => []);

function populateGrid(context) {
  var turns = 100;
  for(var i=1; i <= turns; i += 1) {
    var activeId = utils.getRandomIntInclusive(0, 99);
    var [x,y] = positionFromId(activeId);

    switch(currentGridState[activeId].length) {
    case 0:
      context.fillStyle = "#5FB661";
      context.fillRect(x-4, y-4, 40, 40);
      break;
    case 1:
      context.font = "24px Arial";
      context.fillText(emoji['shamrock'], x+3, y+24);
      break;
    default:
      context.fillStyle = "rgba(137,96,62,0.6)";
      context.fillRect(x-4, y-4, 40, 40);
      context.fillStyle = "rgba(255, 255, 255, 1.0)";

      context.font = "24px Arial";
      printToCardinals(activeId, context);
      break;
    }

    currentGridState[activeId].push(positionFromId(activeId));
  }
}

function lifeStep(grid, newGrid) {
  function calculateCell(cell) {
    //If a dead cell has exactly three live neighbours, it comes to life
    //If a live cell has less than two live neighbours, it dies
    //If a live cell has more than three live neighbours, it dies
    //If a live cell has two or three live neighbours, it continues living
    return cell;
  }
  newGrid = grid.map(calculateCell);
  return newGrid;
}

module.exports = (function() {
  document.addEventListener("DOMContentLoaded", function(event) {
    console.log('dom loaded.');

    var canvas = document.querySelector("canvas");
    var context = canvas.getContext("2d");

    drawGrid(canvas, context);
    populateGrid(context);
  });
})();
