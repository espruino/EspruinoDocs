/* Copyright (c) 2018 allObject / Pur3 Ltd. See the file LICENSE for copying permission. */
/*
A module that maps a particular x and y within a gridded x y area
to a key value and holds on to last .r(ow), .c(ol), and k(ey) index.
```
`
.-------------------.
| 1 | 2 | 3 | C | AC|
|---+---+---+---+---|
| 4 | 5 | 6 | / | * |
|---+---+---+---+---|
| 7 | 8 | 9 | - | + |
|---+---+---+---+---|
|   0   | . |   =   |
'-------------------'
`
var touchKeyPad = new (require("TouchKeyPad))(
  5,4,0,240,128,192,"123CA456/*789-+00.==");
  
console.log(touchKeyPad.xy(48,296)); // --> "0"
console.log("col",touchKeyPad.c); // --> col 1
console.log("row",touchKeyPad.r); // --> row 3
console.log("kdx",touchKeyPad.k); // --> kdx 16 // = 3*5 + 1 
```
 */
/** TouchKeyPad 'class' (constructor function) */
var TouchKeyPad = function(
    xMn  // x minimum boundary of grid
  , xMx  // x maximum boundary of grid
  , yMn  // y minimum boundary of grid
  , yMx  // y maximum boundary of grid 
  , cols // number of columns of grid
  , rows // number of rows    of grid
  ,vals  // values x-y-linearized per grid element / key - either a
         // string that will return one char by grid element, or an
         // array of any type of value or object, one per grid element.
  ,wAdj  // width adjusters for rows 1st grid element / key (for kbd)
  ,_) {  // ignore / internal (js way to get free var declaration)
  _ = _ || this;
  _.xMn = xMn;
  _.xMx = xMx;
  _.yMn = yMn;
  _.yMx = yMx;
  _.cols = cols;
  _.rows = rows;
  _.vals = vals;
  _.chrv = typeof vals === "string"; // val per grid element is...  
  _.wAdj = wAdj || []; // ...a char when vals a string vs. array
  while (_.wAdj.length < cols) _.wAdj.push(0); // for simplicity
  _.dx = (_.xMx - _.xMn + 1) / _.cols; // delta x = col width
  _.dy = (_.yMx - _.yMn + 1) / _.rows; // delta y = row height
  _.r = _.c = _.k = 0; // last row, col, (linear key index)
}, p = TouchKeyPad.prototype;
/** key method - returns key value for x y, (x and y safe) */
p.key = function(x,y,_) { _ = _ || this;
  if (x<_.xMn || x>_.xMx || y<_.yMn || y>_.yMx) { 
    _.k = -1; return (!_.vals) ? -1 : undefined; }
  _.r = Math.floor((y - _.yMn) / _.dy);
  var c = Math.floor((x - _.xMn - _.wAdj[_.r]) / _.dx), k;
  _.c = (c<0) ? 0 : (c<_.cols) ? c : _.cols - 1;
  _.k = k = _.r * _.cols + _.c;
  return (!_.vals) ? k : _.chrv ? _.vals.charAt(k) : _.vals[k];
};
/* export 'class' (constructor) */
exports = TouchKeyPad;
