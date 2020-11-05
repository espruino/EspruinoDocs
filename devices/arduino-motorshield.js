/*
 MIT License

 Copyright (c) 2020 David E Vannucci

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */
/* Arduino Motor shield

* Pixl.js: `var motor = require("arduino-motorshield").connect()`
* ST Nucleo: `var motor = require("arduino-motorshield").connect(Nucleo)`

 */
 exports.connect = function(arduino) {
   if (!arduino) arduino=global;
   return {
     // Very Important:
     // The Pixl.js is a 3V device, the 5V pin supplies 5V to the shield to work,
     // if you are powering the Pixl via USB pin Vin neds to be connected to 5v,
     // else 5V pin MUST have 5V.
     // WARNING:
     // Never set M1A and M1B at the same time, this will cause a short circuit.
     // Resources:
     // This code is for the Banggood L293D motor shield, circuit diagram https://www.banggood.com/Motor-Driver-Shield-L293D-Duemilanove-Mega-U-NO-p-72855.html (http://myosuploads3.banggood.com/products/20181127/20181127002111L293D.rar)
     // Please confirm the pins used in your shield match these.
     // about the L293D motor shield https://lastminuteengineers.com/l293d-motor-driver-shield-arduino-tutorial/
     // about the L293D IC https://maker.pro/custom/projects/all-you-need-to-know-about-l293d
     // about the L293D IC https://lastminuteengineers.com/l293d-dc-motor-arduino-tutorial/
     // about driving a single L293D https://www.espruino.com/L293D
     // Adafruit tutorial and sample code https://playground.arduino.cc/Main/AdafruitMotorShield/
     // AFMotor code https://github.com/adafruit/Adafruit-Motor-Shield-library/blob/master/AFMotor.cpp

     // Define the pins:
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
       // WARNING never set M1A and M1B at the same time, this will cause a short circuit.
       // https://protostack.com.au/2010/05/introduction-to-74hc595-shift-register-controlling-16-leds/
       // The 74HC595 shift register has an 8 bit storage register
       // and an 8 bit shift register. Data is written to the shift register serially,
       // then latched onto the storage register.
       // The storage register then controls 8 output lines.
       // When you power on the circuit, the output lines are set to some arbitrary value.
       // You can use to EN pins to reset the storage registers.
       this.EN.write(1);
       this.EN.write(0);
       // Pin LATCH is held low whilst data is being written to the shift register.
       this.LATCH.write(0);
       // Pin SER is the Data pin.
       // When CLK goes from Low to High the value of DS is stored into the shift register
       // and the existing values of the register are shifted to make room for the new bit.
       // WARNING never set M1A and M1B at the same time, this will cause a short circuit.
       shiftOut(this.SER, {clk: this.CLK, clkPol: 1, repeat: 8}, d);
       // When LATCH goes High the values of the shift register are latched to the storage register
       // which are then output to pins QA-QH, which goes to M1A/B etc.
       // pin QA to M3A, set(0b10000000)
       // pin QB to M2A, set(0b01000000)
       // pin QC to M1A, set(0b00100000)
       // pin QD to M1B, set(0b00010000)
       // pin QE to M2B, set(0b00001000)
       // pin QF to M4A, set(0b00000100)
       // pin QG to M3B, set(0b00000010)
       // pin QH to M4B, set(0b00000001)
       this.LATCH.write(1);
       // Toggle the LATCH low
       this.LATCH.write(0);
     }
   };
}
