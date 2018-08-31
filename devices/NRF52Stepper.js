/* Copyright (c) 2018, Uri Shaked. See the file LICENSE for copying permission. */

// Accurate control of Stepper Motors using nRF52 PPI Hardware

const ll = require('NRF52LL');

const cpuSpeed = 16000000.0; // Hz

class NRF52Stepper {
  constructor(pin) {
    this.pin = pin;
    this.stepTask = null;
    this.stepTimer = null;
  }

  start(freq, stepCount) {
    const ticksPerStep = cpuSpeed / freq / 2;
    this.stepTask = ll.gpiote(4, {
      type: 'task',
      pin: this.pin,
      lo2hi: 1,
      hi2lo: 1
    });
    this.stepTimer = ll.timer(3, {
      type: 'timer',
      bits: 32,
      prescaler: 0,
      cc: [ticksPerStep],
      cc0clear: 1
    });
    this.counter = ll.timer(2, {
      type: 'counter',
      cc: [stepCount * 2],
      cc0clear: 1
    });

    // Set up PPI channels
    ll.ppiEnable(0, this.stepTimer.eCompare[0], this.stepTask.tOut);
    ll.ppiEnable(1, this.stepTimer.eCompare[0], this.counter.tCount);
    ll.ppiEnable(2, this.counter.eCompare[0], this.stepTimer.tStop);

    this.restart();
  }

  restart() {
    poke32(this.stepTimer.tClear, 1);
    poke32(this.counter.tClear, 1);
    this.resume();
  }
  
  pause() {
    poke32(this.stepTimer.tStop, 1);
  }

  resume() {
    poke32(this.stepTimer.tStart, 1);
  }

  setSpeed(freq) {
    const ticksPerStep = cpuSpeed / freq / 2;
    poke32(this.stepTimer.cc[0], ticksPerStep);
    poke32(this.stepTimer.tCapture[1], 1);
    const currentValue = peek32(this.stepTimer.cc[1]);
    if (currentValue >= ticksPerStep) {
      poke32(this.stepTimer.tClear, 1);
    }
  }

  stop() {
    ll.ppiDisable(0);
    ll.ppiDisable(1);
    ll.ppiDisable(2);
  }

  readCounter() {
    poke32(this.counter.tCapture[1], 1);
    return Math.floor(peek32(this.counter.cc[1]) / 2);
  }
}

module.exports = NRF52Stepper;
