/*
 A0-A5 map directly
 D0 B7
 D1 B6
 D2 B1
 D3 B3
 D4 B4
 D5 B5
 D6 A6
 D7 A7
 D8 A8
 D9 B10
 D10 A10
 D11 B15
 D12 B14
 D13 B13
 SCL B8
 SDA B9
*/

/* Grove Button
------------------
Calls the callback when the button is pressed or released.

Can be plugged in anywhere

```
new GroveButton([B8,B9], print);
```
*/
function GroveButton(pins, callback) {
  this.p = pins[0];
  this.w = setWatch(callback, this.p, {repeat:true, debounce:50});
}
/** Call this to stop callbacks */
GroveButton.prototype.disconnect = function() { clearWatch(w); };

/* Grove Buzzer
------------------
Returns an object with the following methods:

Can be plugged in anywhere

```
var b = new GroveBuzzer([B8,B9]);
b.beep(100);
```
*/
function GroveBuzzer(pins) {
  this.p = pins[0];
}
/** Beep for the time specified in ms, or 500ms if nothing supplied */
GroveBuzzer.prototype.beep = function(delay, callback) { 
  if (isNaN(delay) || delay<=0) delay = 500;
  digitalWrite(this.p,1);
  var p = this.p;
  setTimeout(function() {
    digitalWrite(p,0);
    if (callback) callback();
  }, delay);
};
/** Play at the specified frequency for the time specified in ms, or 500ms if nothing supplied */
GroveBuzzer.prototype.freq = function(freq, delay) { 
  if (isNaN(delay) || delay<=0) delay = 500;
  analogWrite(this.p,0.1,{freq:freq, soft:true});
  var p = this.p;
  setTimeout(function() {
    digitalWrite(p,0);
    if (callback) callback();
  }, delay);
};

/* Grove Touch
------------------
Calls the callback when the area is pressed or released.

Can be plugged in anywhere

```
new GroveTouch([B8,B9], print);
```
*/
var GroveTouch = GroveButton;


/* Grove Rotation
------------------
Allows you to read the rotation of the knob

Must be plugged into an analog socket

```
var r = new GroveRotation([A0,A1]);
setInterval(function() {
  console.log(r.read());
}, 500);
```
*/
function GroveRotation(pins) {
  this.p = pins[0];
}
/** Returns a number between 0 and 1 depending on rotation */
GroveRotation.prototype.read = function() { return analogRead(this.p); };

/* Grove Light Sensor
------------------
Read the amount of light falling on the sensor

Must be plugged into an analog socket

```
var r = new GroveLightSensor([A0,A1]);
setInterval(function() {
  console.log(r.read());
}, 500);
```
*/
function GroveLightSensor(pins) {
  this.p = pins[0];
}
/** Returns a number between 0 (dark) and 1 (bright) */
GroveLightSensor.prototype.read = function() { return analogRead(this.p); };

/* Grove LED (or LED Socket)
------------------
Turn an LED light on and off

```
var l = new GroveLED([A0,A1]);
l.on();
```
*/
function GroveLED(pins) {
  this.p = pins[0];
}
/** Turn LED on */
GroveLED.prototype.on = function() { this.p.set(); };
/** Turn LED off */
GroveLED.prototype.off = function() { this.p.reset(); };
/** Write to the LED, any number between 0 and 1 */
GroveLED.prototype.write = function(v) { 
  if (v<=0) this.p.reset();
  if (v>=1) this.p.set();
  analogWrite(this.p, v, { soft:true });
};
/** Flash for the time specified in ms, or 500ms if nothing supplied */
GroveLED.prototype.flash = function(delay, callback) { 
  if (isNaN(delay) || delay<=0) delay = 500;
  digitalWrite(this.p,1);
  var p = this.p;
  setTimeout(function() {
    digitalWrite(p,0);
    if (callback) callback();
  }, delay);
};

/* Grove Temperature Sensor
------------------

```
var t = new GroveTemperature([A0,A1]);
console.log(t.get());
```
*/
function GroveTemperature(pins) {
  this.B=3975; // B value of the thermistor
  this.p = pins[0];
}
// Get the temperature in degrees C
GroveTemperature.prototype.get = function() {
  var a = analogRead(this.p)*3.3/5;
  // get the resistance of the sensor;
  var resistance=(1-a)*10000/a; 
  // convert to temperature via datasheet 
  var temperature=1/(Math.log(resistance/10000)/this.B+1/298.15)-273.15;
  return temperature;
};

/* Grove Relay
------------------
A relay to help you turn other circuits on and off

```
var l = new GroveRelay([A0,A1]);
l.off();
l.pulse(1000, function() {
  console.log("Done!");
});
```
*/
function GroveRelay(pins) {
  this.p = pins[0];
}
/** Turn relay on */
GroveRelay.prototype.on = function() { this.p.set(); };
/** Turn relay off */
GroveRelay.prototype.off = function() { this.p.reset(); };
/** Pulse the relay for the time specified in ms, or 500ms if nothing supplied */
GroveRelay.prototype.pulse = function(delay, callback) { 
  if (isNaN(delay) || delay<=0) delay = 500;
  digitalWrite(this.p,1);
  var p = this.p;
  setTimeout(function() {
    digitalWrite(p,0);
    if (callback) callback();
  }, delay);
};

var LCD = {
  // commands
  CLEARDISPLAY : 0x01,
  RETURNHOME : 0x02,
  ENTRYMODESET : 0x04,
  DISPLAYCONTROL : 0x08,
  CURSORSHIFT : 0x10,
  FUNCTIONSET : 0x20,
  SETCGRAMADDR : 0x40,
  SETDDRAMADDR : 0x80,

// flags for display entry mode
  ENTRYRIGHT : 0x00,
  ENTRYLEFT : 0x02,
  ENTRYSHIFTINCREMENT : 0x01,
  ENTRYSHIFTDECREMENT : 0x00,

// flags for display on/off control
  DISPLAYON : 0x04,
  DISPLAYOFF : 0x00,
  CURSORON : 0x02,
  CURSOROFF : 0x00,
  BLINKON : 0x01,
  BLINKOFF : 0x00,

// flags for display/cursor shift
  DISPLAYMOVE : 0x08,
  CURSORMOVE : 0x00,
  MOVERIGHT : 0x04,
  MOVELEFT : 0x00,

// flags for function set
  _8BITMODE : 0x10,
  _4BITMODE : 0x00,
  _2LINE : 0x08,
  _1LINE : 0x00,
  _5x10DOTS : 0x04,
  _5x8DOTS : 0x00
};

/* Grove LCD RGB
------------------
A Text LCD screen with a RGB backlight

```
var g = new GroveLCDRGB([B8,B9]);
g.setColor(64,128,255);
g.clear();
g.write("Hello");
g.setCursor(5,1);
g.write("World");
```
*/
function GroveLCDRGB(pins) {
  this.i2c = I2C1;
  this.i2c.setup({scl:pins[0], sda:pins[1]});
  // Init LCD
  var lcdType = LCD._2LINE;
  this.cmd(LCD.FUNCTIONSET | lcdType);
  this.mode = LCD.DISPLAYON | LCD.CURSOROFF | LCD.BLINKOFF;
  this.cmd(LCD.DISPLAYCONTROL | this.mode);
  this.clear();
  // Initialize to default text direction (for romance languages)
  this.cmd(LCD.ENTRYMODESET | LCD.ENTRYLEFT | LCD.ENTRYSHIFTDECREMENT);
  // Init backlight controller
  this.setReg(0,0);
  this.setReg(1,0);
  this.setReg(8,0xAA);
  // white
  this.setColor(255,255,255);
}
/** Access the LCD PWM driver */
GroveLCDRGB.prototype.setReg = function(a,d) { this.i2c.writeTo(0x62, [a,d]); };
/** Send a command to the LCD  */
GroveLCDRGB.prototype.cmd = function(c) { this.i2c.writeTo(0x3E, [0x80,c]); };
/** Send characters to the LCD  */
GroveLCDRGB.prototype.write = function(s) { 
  s = ""+s;
  for (var i in s)
    this.i2c.writeTo(0x3E, [0x40,s.charCodeAt(i)]); 
};
/** Set the LCD backlight color */
GroveLCDRGB.prototype.setColor = function(r,g,b) { 
  this.setReg(4,r);
  this.setReg(3,g);
  this.setReg(2,b);
};
// Clear the display
GroveLCDRGB.prototype.clear = function() { this.cmd(LCD.CLEARDISPLAY); };
// Return to home position
GroveLCDRGB.prototype.home = function() { this.cmd(LCD.CLEARDISPLAY); };
// Set cursor position (0-based)
GroveLCDRGB.prototype.setCursor = function(col, row) { this.cmd(row === 0 ? col|0x80 : col|0xc0); };


exports.GroveButton = GroveButton;
exports.GroveBuzzer = GroveBuzzer;
exports.GroveTouch = GroveTouch;
exports.GroveRotation = GroveRotation;
exports.GroveLightSensor = GroveLightSensor;
exports.GroveLED = GroveLED;
exports.GroveTemperature = GroveTemperature;
exports.GroveRelay = GroveRelay;
exports.GroveLCDRGB = GroveLCDRGB;
