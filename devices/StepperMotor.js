/* Copyright (c) 2017 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */

/** Create a new stepper instance */
function StepperMotor(obj) {
  this.pins = obj.pins;
  this.pattern = obj.pattern || [0b0001,0b0010,0b0100,0b1000];
  this.offpattern = obj.offpattern || 0;
  this.pos = 0;
  this.stepsPerSec = obj.stepsPerSec || 100;
}


/** Set the current position to be home (0) */
StepperMotor.prototype.setHome = function() {
  this.pos = 0;
};

/** Get the current position */
StepperMotor.prototype.getPosition = function() {
  return this.pos;
};

/** Stop movement, and if `turnOff` is true turn off the coils */
StepperMotor.prototype.stop = function(turnOff) {
  if (this.interval) {
    clearInterval(this.interval);
    this.interval = undefined;
  }
  if (turnOff && this.offpattern)
    digitalWrite(this.pins, this.offpattern);
};

/** Move to a specific position in the time given. If no time
is given, it will be calculated based on this.stepsPerSec.
`callback` will be called when the movement is complete,
and if `turnOff` is true the coils will be turned off */
StepperMotor.prototype.moveTo = function(pos, milliseconds, callback, turnOff) {
  pos = 0|pos; // to int
  if (milliseconds===undefined)
    milliseconds = Math.abs(pos-this.pos)*1000/this.stepsPerSec;
  this.stop(turnOff);
  if (pos != this.pos) {
    var stepper = this;
    var step = function() {
      // remove interval if needed
      if (stepper.pos == pos) {
        stepper.stop(turnOff);
        if (callback)
          callback();
      } else {
        // move onwards
        stepper.pos += (pos < stepper.pos) ? -1 : 1;
        // now do step
        digitalWrite(stepper.pins, stepper.pattern[ stepper.pos & (stepper.pattern.length-1) ]);
      }
    };
    this.interval = setInterval(step, milliseconds / Math.abs(pos-this.pos));
    step();
  } else {
    if (callback)
      setTimeout(callback, milliseconds);
  }
};

exports = StepperMotor;
