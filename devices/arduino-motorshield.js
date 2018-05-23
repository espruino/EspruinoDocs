/* Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* Arduino Motor shield

* Pixl.js: `var motor = require("arduino-motorshield").connect()`
* ST Nucleo: `var motor = require("arduino-motorshield").connect(Nucleo)`

 */
 exports.connect = function(arduino) {
   if (!arduino) arduino=global;
   return {
    SER:arduino.D8,
    CLK:arduino.D4,
    LATCH:arduino.D12,
    EN:arduino.D7,
    PWM0A:arduino.D6,  // L293D 1
    PWM0B:arduino.D5,  // L293D 1
    PWM1A:arduino.D9,  // servo
    PWM1B:arduino.D10, // servo
    PWM2A:arduino.D12, // L293D 2
    PWM2B:arduino.D3,  // L293D 2
    on:function() {
     digitalWrite([this.PWM0A,this.PWM0B,this.PWM2A,this.PWM2B],15);
    },
    off:function() {
     digitalWrite([this.PWM0A,this.PWM0B,this.PWM2A,this.PWM2B],0);
    },
    set:function(d) {
      this.EN.write(0);
      this.LATCH.write(0);
      shiftOut(this.SER, { clk:this.CLK, clkPol:1, repeat:8 }, d);
      this.LATCH.write(1);
    }
  };
}
