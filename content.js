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
var offsets = {
  N: -1,
  S: 1,
  E: 10,
  W: -10
};

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
  var [c, d] = positionFromId((id + offsets['N']).mod(99));
  nFunc.apply(null, [c, d]);
}

function applyToSouth(id, sFunc) {
  var [a, b] = positionFromId((id + offsets['S']).mod(99));
  sFunc.apply(null, [a, b]);
}

function applyToEast(id, eFunc) {
  var [e, f] = positionFromId((id + offsets['E']).mod(99));
  eFunc.apply(null, [e, f]);
}

function applyToWest(id, wFunc) {
  var [g, h] = positionFromId((id + offsets['W']).mod(99));
  wFunc.apply(null, [g, h]);
}

function getNeighbors(id) {
  var n = id - 1,
      ne = id - 1 + 10,
      nw = id - 1 - 10,
      s = id + 1,
      se = id + 1 + 10,
      sw = id + 1 - 10,
      e = id + 10,
      w = id - 10;
  return [n, ne, nw, s, se, sw, e, w];
}

var currentGridState = Array.from(new Array(100), () => []);

function gPrint(context, e, i) {
  var [x, y] = positionFromId(i);
  switch (e.length) {
  case 0:
    context.fillStyle = "rgba(137,96,62,0.9)";
    context.fillRect(x - 4, y - 4, 38, 38);
    context.fillStyle = "rgba(255, 255, 255, 1.0)";
    break;
  case 1:
    context.fillText(emoji['tiger'], x + 3, y + 24);
    break;
  default:
    context.fillStyle = "#5FB661";
    context.fillRect(x - 4, y - 4, 40, 40);

    printToCardinals(i, context);
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

function lifeStep(grid) {
  function calculateCell(cell, i) {
    function isLive(grid, a) {
      return grid[a.mod(99)].length > 0;
    }

    var neighborhood = getNeighbors(i).map(function(e) {
      return isLive(grid, e);
    });
    var numberOfLiveNeighbors = neighborhood.filter(utils.identity).length.clamp(0, 4);

    var nextState;
    if (isLive(grid, i)) {
      // rules from http://disruptive-communications.com/conwaylifejavascript/
      var nextLivingState = ['dead', 'dead', 'live', 'live', 'dead'];
      //If a live cell has less than two live neighbours, it dies
      //If a live cell has more than three live neighbours, it dies
      //If a live cell has two or three live neighbours, it continues living
      nextState = nextLivingState[numberOfLiveNeighbors];
    } else {
      var nextDeadState = ['dead', 'dead', 'dead', 'live', 'dead'];
      //If a dead cell has exactly three live neighbours, it comes to life
      nextState = nextDeadState[numberOfLiveNeighbors];
    }

    if (nextState === 'live') {
      cell.push(positionFromId(i));
    } else {
      cell.length = 0;
    }
    return cell;
  }

  return grid.map(calculateCell);
}

module.exports = (function() {
  document.addEventListener("DOMContentLoaded", function(event) {
    var canvas = document.querySelector("canvas");
    var context = canvas.getContext("2d");
    context.font = "24px Arial";

    drawGrid(canvas, context);
    populateGrid(context);

    canvas.addEventListener('click', function() {
      var newGridState = lifeStep(currentGridState);
      currentGridState = newGridState;
      drawGrid(canvas, context); // clear

      function gPrintWithContext(context) {
        return function(e, i) {
          gPrint(context, e, i);
        };
      }
      currentGridState.forEach(gPrintWithContext(context));
    }, false);
  });
})();
