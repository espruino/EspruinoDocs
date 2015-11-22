/* Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
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

/*Text LCD screen with an RGB backlight
--------------------------------

```
var grove = require("GrovePico");
var g = new (require("GroveLCDRGB"))(grove.I2C2);
g.setColor(64,128,255);
g.clear();
g.write("Hello");
g.setCursor(5,1);
g.write("World");
```
*/
function GroveLCDRGB(pins) {
  // find the I2C device 
  this.i2c = I2C.find(pins[0]);
  if (!this.i2c) throw "Pins not capable of I2C";
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
exports = GroveLCDRGB;
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


