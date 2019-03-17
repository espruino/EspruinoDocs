/* Copyright (c) 2014 Your Name. See the file LICENSE for copying permission. */
/*
Quick description of my module...
*/

var C = {
  MY : 0x001,          // description
  PRIVATE : 0x001,     // description
  CONSTANTS : 0x00423  // description
};

function MOD123(pin1,pin2) {
  this.pin1 = pin1;
  this.pin2 = pin2;
}

/** 'public' constants here */
MOD123.prototype.C = {
  MY : 0x013,         // description
  PUBLIC : 0x0541,    // description
  CONSTANTS : 0x023   // description
};

/** Put most of my comments outside the functions... */
MOD123.prototype.foo = function() {
  // you can use C.PRIVATE
  // or this.C.PUBLIC
};

/** Put most of my comments outside the functions... */
MOD123.prototype.bar = function() {
};

/** This is 'exported' so it can be used with `require('MOD123.js').connect(pin1,pin2)` */
exports.connect = function (pin1, pin2) {
  return new MOD123(pin1, pin2);
};
