/* Copyright (c) 2020 Gordon Williams, David E Vannucci, Pur3 Ltd. See the file LICENSE for copying permission. */
/* Arduino Motor shield

* Pixl.js: `var motor = require("arduino-motorshield").connect()`
* ST Nucleo: `var motor = require("arduino-motorshield").connect(Nucleo)`

 */
 exports.connect = function(arduino) {
   if (!arduino) arduino=global;
   return {
     SER: arduino.D8,
     CLK: arduino.D4,
     LATCH: arduino.D12,
     EN: arduino.D7,
     PWM0A: arduino.D6,  // L293D IC2 3-4EN
     PWM0B: arduino.D5,  // L293D IC2 1-2EN
     PWM1A: arduino.D9,  // servo 2
     PWM1B: arduino.D10, // servo 1
     PWM2A: arduino.D11, // L293D IC1 1-2EN
     PWM2B: arduino.D3,  // L293D IC1 3-4EN
     // Set the Speed Pins
     on: function() {
       digitalWrite([this.PWM0A, this.PWM0B, this.PWM2A, this.PWM2B], 15);
     },
     // Clear the Speed Pins
     off: function() {
       digitalWrite([this.PWM0A, this.PWM0B, this.PWM2A, this.PWM2B], 0);
     },
     // reset to power on state
     reset: function(){
       this.off();
       this.set(0b00000000);
     },
     // PWM the Speed Pins
     speed: function(percent) {
       analogWrite(this.PWM2A, percent / 100, {freq: 100, soft: true}); // Turn output on, % of the time, at 100 Hz
       analogWrite(this.PWM2B, percent / 100, {freq: 100, soft: true}); // Turn output on, % of the time, at 100 Hz
       analogWrite(this.PWM0A, percent / 100, {freq: 100, soft: true}); // Turn output on, % of the time, at 100 Hz
       analogWrite(this.PWM0B, percent / 100, {freq: 100, soft: true}); // Turn output on, % of the time, at 100 Hz
     },
     // Set the Direction Pins
     set: function(d) {
       this.EN.write(0);
       this.LATCH.write(0);
       shiftOut(this.SER, {clk: this.CLK, clkPol: 1, repeat: 8}, d);
       this.LATCH.write(1);
       this.LATCH.write(0);
     }
   };
}
