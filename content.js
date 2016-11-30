var emoji = require("./emoji.js");
var utils = require("./utils.js");
var compass = require("./compass.js");

/* @flow */

function drawGridLines(context) {
  context.strokeStyle = "#5FB661";
  context.stroke();
}

function drawGrid(canvas, context) {
  var bw = 400;
  var bh = bw;
  var p = 10;

  for (var x = 0; x <= bw; x += 40) {
    context.moveTo(0.5 + x + p, p);
    context.lineTo(0.5 + x + p, bh + p);
  }

  for (var y = 0; y <= bh; y += 40) {
    context.moveTo(p, 0.5 + y + p);
    context.lineTo(bw + p, 0.5 + y + p);
  }

  context.fillStyle = "#89603e";
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawGridLines(context);
}

var currentGridState = Array.from(new Array(100), () => []);
var xOffset = 10;
var yOffset = 28;

function printTo(objFunc, ctxt) {
  function f(x, y) {
    ctxt.fillText(objFunc.call(), x + xOffset, y + yOffset);
  }
  return f;
}

function gPrint(context, e, i) {
  var [x, y] = compass.positionFromId(i);
  var squareSize = 39;

  // for debugging
  function printNums() {
    context.fillStyle = "grey";
    context.fillText(i, x + xOffset, y + yOffset);
  }

  // grey out previous
  context.fillStyle = "rgba(137,96,62,0.9)";
  context.fillRect(x, y, squareSize, squareSize);

  switch (e.length) {
  case 0:
    context.fillStyle = "#89603e";
    context.fillRect(x, y, squareSize, squareSize);
    drawGridLines(context);
    break;
  default:
    context.fillStyle = "#5FB661";
    context.fillRect(x, y, squareSize, squareSize);
    context.fillText(emoji.lucky(), x + xOffset, y + yOffset);
    break;
  }
}

function populateGrid(context) {
  for (var i = 1; i <= 100; i += 1) {
    var activeId = utils.getRandomIntInclusive(0, 99);
    currentGridState[activeId].push(compass.positionFromId(activeId));
    gPrint(context, currentGridState[activeId], activeId);
  }
}

function seedGlider(context) {
  currentGridState = Array.from(new Array(100), () => []);
  var centerId = utils.getRandomIntInclusive(0, 99);
  var neighborhood = compass.getNeighbors(centerId);
  // glider from centerId: N, E, SE, S, SW
  var gliderPositions = [0, 6, 4, 3, 5];
  gliderPositions.map(function(p) {
    currentGridState[neighborhood[p]] = [compass.positionFromId(neighborhood[p])];
    gPrint(context, currentGridState[neighborhood[p]], neighborhood[p]);
  });
}

function isLive(grid, a) {
  var sub = grid[a.mod(99)];
  var l = sub.length;
  return l > 0 ? 1 : 0;
}

function calculateCellIn(grid, cell, i) {
  var neighborhood = compass.getNeighbors(i);
  var liveNeighbors = neighborhood.map(function(e) { return isLive(grid, e); });
  var numberOfLiveNeighbors = liveNeighbors.filter(utils.intAsBool).length.clamp(0, 4);

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
    cell.push(compass.positionFromId(i));
  } else {
    cell.length = 0;
  }
  return cell;
}

module.exports = (function() {
  document.addEventListener("DOMContentLoaded", function(event) {
    var runButton = document.getElementById("run");
    var stopButton = document.getElementById("stop");
    var reseedButton = document.getElementById("reseed");
    var gliderButton = document.getElementById("glider");

    var canvas = document.querySelector("canvas");
    var context = canvas.getContext("2d");
    context.font = "24px Arial";

    drawGrid(canvas, context);
    populateGrid(context);

    function gPrintWithContext(context) {
      return function(e, i) {
        gPrint(context, e, i);
      };
    }

    var interval = null;
    runButton.addEventListener('click', function() {
      interval = setInterval(function() {
        var lastGridState = Object.freeze(currentGridState.slice());
        var newGridState = Array.from(new Array(100), () => []);
        newGridState.map(function(e,i) {
          return newGridState[i] = calculateCellIn(lastGridState,e,i);
        });
        currentGridState = newGridState;
        drawGrid(canvas, context); // clear
        currentGridState.forEach(gPrintWithContext(context));
      }, 500);
    }, false);

    stopButton.addEventListener('click', function() {
      clearInterval(interval);
    }, false);

    gliderButton.addEventListener('click', function() {
      clearInterval(interval); // just in case
      drawGrid(canvas, context); // clear
      seedGlider(context);
    }, false);

    reseedButton.addEventListener('click', function() {
      clearInterval(interval); // just in case
      drawGrid(canvas, context); // clear
      populateGrid(context);
    }, false);
  });
})();
