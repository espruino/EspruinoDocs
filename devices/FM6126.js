/* Copyright (c) 2026 JumJum, MaBecker, Gordon Williams. See the file LICENSE for copying permission. */

function panel(opts) {
  this.width = opts.width || 64;
  this.height = opts.height || 64;
  this.maxLed = ((this.width / 64) * 256);
  this.boardDur = opts.interval || 20;
  this.brightness = opts.brightness || 32;

  this.pins = {
    A: opts.A,
    B: opts.B,
    C: opts.C,
    D: opts.D,
    E: opts.E,

    R1: opts.R1,
    G1: opts.G1,
    B1: opts.B1,

    R2: opts.R2,
    G2: opts.G2,
    B2: opts.B2,

    LAT: opts.LAT,
    OE: opts.OE,
    CLK: opts.CLK
  };

  this.tmr = null;
  this.sfnc = null;
  this.dfnc = null;
  this.arr = [];
  this.g = null;
}

// --- Private helper functions (hidden from external access) ---
function initFM6126(self) {
  var p = self.pins;
  var maxLed = self.maxLed;
  var brightness = self.brightness;

  // register 11: controls the current / brightness
  var REG_11 = [
    (brightness & 1),
    (brightness >> 1) & 1,
    (brightness >> 2) & 1,
    (brightness >> 3) & 1,
    (brightness >> 4) & 1,
    (brightness >> 5) & 1,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0
  ];
  var REG_12 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0];

  digitalWrite([p.OE, p.LAT, p.CLK], 0b100);
  // register 11
  for (var l = 0; l < maxLed; l++) {
    var y1 = l % 16;
    digitalWrite([ p.R1, p.G1, p.B1, p.R2, p.G2, p.B2 ], REG_11[y1] ? 0b111111 : 0);
    digitalWrite( p.LAT, (l > maxLed - 12) ? 1 : 0);
    digitalWrite(p.CLK, 1);
    digitalWrite(p.CLK, 0);
  }
  digitalWrite(p.LAT, 0);
  digitalWrite(p.CLK, 0);
  // register 12
  for (var k = 0; k < maxLed; k++) {
    var y2 = k % 16;
    digitalWrite([p.R1, p.G1, p.B1, p.R2, p.G2, p.B2], REG_12[y2] ? 0b111111 : 0);
    digitalWrite( p.LAT, (k > maxLed - 13) ? 1 : 0);
    digitalWrite(p.CLK, 1);
    digitalWrite(p.CLK, 0);
  }
  digitalWrite(p.LAT, 0);
  digitalWrite(p.CLK, 0);
}

function initPins(self) {
  var p = self.pins;
  self.sfnc = shiftOut.bind(null,[p.R1, p.G1, p.B1, undefined, p.R2, p.G2, p.B2],{clk: p.CLK});
  self.dfnc = digitalWrite.bind(null,[p.OE, p.LAT, p.LAT, p.E, p.D, p.C, p.B, p.A, p.OE]);
}

function initGraphic(self) {
  self.g = Graphics.createArrayBuffer(self.width, self.height, 4, { interleavex: true});
  var ledBuf = self.g.buffer;
  self.arr = [];
  self.arr.push({callback: self.pins.OE.reset.bind(self.pins.OE)});
  var scanLines = self.height / 2;
  for (var i = 0; i < scanLines; i++) {
    self.arr.push( new Uint8Array(ledBuf, i * self.width, self.width ));
    self.arr.push({ callback: self.dfnc.bind( null, 65 | (i << 1) ) });
  }
  self.arr.push({ callback: self.pins.OE.set.bind(self.pins.OE ) });
  return self.g;
}


// --- public API (exposed on the instance) ---

panel.prototype.init = function() {
  initFM6126(this);
  initPins(this);
  initGraphic(this); // Initializes this.g internally
  return this;       // Return the instance for chaining instead of just the graphics object
};

panel.prototype.start = function() {
  if (this.tmr) {
    this.stop();
  }
  this.tmr = setInterval(function() {
    this.sfnc(this.arr);
  }.bind(this), this.boardDur);
  return this;       // Return the instance for chaining
};

panel.prototype.stop = function() {
  if (this.tmr !== null) {
    clearInterval(this.tmr);
    this.tmr = null;
  }
  return this;
};

panel.prototype.clear = function() {
  if (this.g) {
    this.g.setBgColor(0);
    this.g.clear();
  }
  return this;
};

panel.prototype.setBrightness = function(value) {
  this.brightness = value;
  this.stop();
  // run the expensive initialization asynchronously to prevent blocking
  setTimeout(function() {
    initFM6126(this);
    this.start();
  }.bind(this), 0);
  return this;
};

exports.connect = function(opts) {
  return new panel(opts);
};
