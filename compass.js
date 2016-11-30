var offsets = {
  N: -1,
  S: 1,
  E: 10,
  W: -10
};

function getNeighbors(id) {
  var n = id + offsets['N'],
      ne = n + offsets['E'],
      nw = n + offsets['W'],
      s = id + offsets['S'],
      se = s + offsets['E'],
      sw = s + offsets['W'],
      e = id + offsets['E'],
      w = id + offsets['W'];
  return [n, ne, nw, s, se, sw, e, w];
}

function applyToNorth(id, nFunc) {
  var [c, d] = positionFromId((id + offsets['N']).mod(99));
  nFunc.apply(null, [c, d]);
}

function applyToNorthEast(id, nFunc) {
  var [c, d] = positionFromId((id + offsets['N'] + offsets['E']).mod(99));
  nFunc.apply(null, [c, d]);
}

function applyToNorthWest(id, nFunc) {
  var [c, d] = positionFromId((id + offsets['N'] + offsets['W']).mod(99));
  nFunc.apply(null, [c, d]);
}

function applyToSouth(id, sFunc) {
  var [a, b] = positionFromId((id + offsets['S']).mod(99));
  sFunc.apply(null, [a, b]);
}

function applyToSouthEast(id, sFunc) {
  var [a, b] = positionFromId((id + offsets['S'] + offsets['E']).mod(99));
  sFunc.apply(null, [a, b]);
}

function applyToSouthWest(id, sFunc) {
  var [a, b] = positionFromId((id + offsets['S'] + offsets['W']).mod(99));
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

module.exports = {
  offsets, getNeighbors,
  applyToNorth, applyToNorthEast, applyToNorthWest,
  applyToSouth, applyToSouthEast, applyToSouthWest,
  applyToEast, applyToWest
};
