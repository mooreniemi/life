var emoji = require("./emoji.js");
var utils = require("./utils.js");
var compass = require("./compass.js");

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
var currentGridState = Array.from(new Array(100), () => []);

function positionFromId(id) {
  var margin = 15;
  if (typeof(gridAsArray[id]) === 'undefined') {
    console.log(`ya fucked up: off canvas position for id: ${id}`);
  }
  var [x, y] = gridAsArray[id];
  var position = [(x * size) + margin, (y * size) + margin];
  return position;
}

function lucky() {
  var luckyNumber = 100;
  var chance = utils.getRandomIntInclusive(1, luckyNumber);
  if (chance === luckyNumber) {
    return emoji["fourLeaf"];
  } else {
    return emoji["shamrock"];
  }
}

function printToCardinals(id, ctxt) {
  compass.applyToNorth(id, printTo(lucky, ctxt));
  compass.applyToSouth(id, printTo(lucky, ctxt));
  compass.applyToEast(id, printTo(lucky, ctxt));
  compass.applyToWest(id, printTo(lucky, ctxt));
}

function printTo(objFunc, ctxt) {
  function f(x, y) {
    var xOffset = 3;
    var yOffset = 24;
    ctxt.fillText(objFunc.call(), x + xOffset, y + yOffset);
  }
  return f;
}

function gPrint(context, e, i) {
  var [x, y] = positionFromId(i);

  // grey out previous
  context.fillStyle = "rgba(137,96,62,0.9)";
  context.fillRect(x - 4, y - 4, 38, 38);

  switch (e.length) {
  case 0:
    context.fillStyle = "#89603e";
    context.fillRect(x - 4, y - 4, 38, 38);
    context.fillStyle = "grey";
    context.fillText(i, x + 3, y + 24);
    break;
    //case 1:
    //context.fillStyle = "#5FB661";
    //context.fillRect(x - 4, y - 4, 40, 40);
    //context.fillText(emoji['rain'], x + 3, y + 24);
    //context.fillStyle = "grey";
    //context.fillText(i, x + 3, y + 24);
    //break;
  default:
    context.fillStyle = "#5FB661";
    context.fillRect(x - 4, y - 4, 40, 40);
    context.fillStyle = "black";
    context.fillText(i, x + 3, y + 24);
    //printToCardinals(i, context);
    break;
  }
}

function populateGrid(context) {
  for (var i = 1; i <= 100; i += 1) {
    var activeId = utils.getRandomIntInclusive(0, 99);
    gPrint(context, currentGridState[activeId], activeId);
    currentGridState[activeId].push(positionFromId(activeId));
  }
}

function seedGlider(context) {
  var centerId = utils.getRandomIntInclusive(0, 99);
  var neighborhood = compass.getNeighbors(centerId);
  // glider from centerId: N, E, SE, S, SW
  var gliderPositions = [0, 6, 4, 3, 5];
  gliderPositions.map(function(p) {
    currentGridState[neighborhood[p]] = [neighborhood[p]];
    gPrint(context, currentGridState[neighborhood[p]], neighborhood[p]);
  });
}

function isLive(grid, a) {
  var sub = grid[a.mod(99)];
  var l = sub.length;
  return l > 0 ? 1 : 0;
}

function calculateCellIn(grid) {
  return function(cell, i) {
    var neighborhood = compass.getNeighbors(i).map(function(e) { return isLive(grid, e); });
    var numberOfLiveNeighbors = neighborhood.filter(utils.identity).length.clamp(0, 4);

    // rules from http://disruptive-communications.com/conwaylifejavascript/
    //If a live cell has less than two live neighbours, it dies
    //If a live cell has more than three live neighbours, it dies
    //If a live cell has two or three live neighbours, it continues living
    var nextLivingState = ['dead', 'dead', 'live', 'live', 'dead'];

    //If a dead cell has exactly three live neighbours, it comes to life
    var nextDeadState = ['dead', 'dead', 'dead', 'live', 'dead'];

    var nextPossibleState = [nextDeadState, nextLivingState];

    var nextState = nextPossibleState[isLive(grid, i)][numberOfLiveNeighbors];
    if (nextState === 'live') {
      cell.push(positionFromId(i));
    } else {
      cell.length = 0;
    }
    return cell;
  };
}

function lifeStep(grid) {
  console.log(currentGridState)
  return grid.map(calculateCellIn(grid));
}

module.exports = (function() {
  document.addEventListener("DOMContentLoaded", function(event) {
    var runButton = document.getElementById("run");
    var stopButton = document.getElementById("stop");
    var reseedButton = document.getElementById("reseed");

    var canvas = document.querySelector("canvas");
    var context = canvas.getContext("2d");
    context.font = "24px Arial";

    drawGrid(canvas, context);
    populateGrid(context);

    var interval = null;
    runButton.addEventListener('click', function() {
      interval = setInterval(function() {
        var newGridState = lifeStep(currentGridState);
        currentGridState = newGridState;
        drawGrid(canvas, context); // clear

        function gPrintWithContext(context) {
          return function(e, i) {
            gPrint(context, e, i);
          };
        }
        currentGridState.forEach(gPrintWithContext(context));
      }, 500);
    }, false);

    stopButton.addEventListener('click', function() {
      clearInterval(interval);
    }, false);

    reseedButton.addEventListener('click', function() {
      clearInterval(interval); // just in case
      drawGrid(canvas, context); // clear
      currentGridState = Array.from(new Array(100), () => []);
      seedGlider(context);
    }, false);
  });
})();
