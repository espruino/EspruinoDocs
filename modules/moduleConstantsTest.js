//moduleConstantsTest.js
//Sun 2018.09.23

//http://www.espruino.com/Writing+Modules



var C = {
  U : "up",
  D : "down",
  L : "left",
  R : "right",
  N : "north",
  E : "east",
  S : "south",
  W : "west",
  T : "top",
  M : "middle",
  B : "bottom"
};
  
exports = C;





var GROUPS = {
  
  COMPASS   : [{N:C.N}, {E:C.E}, {S:C.S}, {W:C.W}],
//  COMPASS   : [ C.N, C.E, C.S, C.W ],  
  DIRECTION : [ C.U, C.D, C.L, C.R ],
  VERTICAL  : [ C.T, C.M, C.B ]
  
};

exports = GROUPS;







//[eof]