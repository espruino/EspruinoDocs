/* Copyright (c) 2024 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* Simple PID controller - http://www.espruino.com/PID */
/** Create a new PID object. 'options' can contain
{
  Pg : 1, // proportional gain
  Ig : 1, // integral gain
  Dg : 0, // differential gain
  Imin:-1,Imax:1 // range for clipping integral
}
*/
function PID(options) {
  Object.assign(this, {
  // gains
  Pg : 1,
  Ig : 1,
  Dg : 0,
  // min/max
  Imin : -1,
  Imax : 1,
  // actual PID values
  P : 0,
  I : 0,
  D : 0,
  err : 0, ///< Last error value
  out : undefined ///< Last output value
  }, options||{});
}

/** Call this to reset state to default (keeping gains intact) */
PID.prototype.reset = function() {
  this.P = this.I = this.D = this.err = 0;
  this.out = undefined;
};

/** Call this with an error amount, ideally -1..1. An output in the range -1..1 is returned.
Ideally call this function with a fixed time period. */
PID.prototype.step = function(err) {
  this.P = this.err * this.Pg;
  this.D = (err-this.err) * this.Dg;
  this.err = err;
  this.I = E.clip(this.I + err * this.Ig, this.Imin, this.Imax);
  this.out = E.clip(this.P + this.I + this.D, -1, 1);
  return this.out;
};


