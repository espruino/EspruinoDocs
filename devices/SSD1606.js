/* Copyright (c) 2016 Michael Pralow http://programmicha.de/. See the file LICENSE for copying permission. */
/**
 * Represents an SSD1606 Display Driver with Controller.
 * Right now it works out of the box with the GDE021A1 e-paper display.
 */
/**
 * GDE021A1 display data.
 * This display data is based on specification version 'A/0(For SLC 505a FH E21002-DL Ver02 TFT' from 22.10.2012.
 * RAM x address end at 11h(17)->72, because otherwise it would default to 1Fh(31)->128,
 * which is too large for this display.
 * RAM y address end at ABh(171)->172, because otherwise it default to B3h(179)->180
 * which is too large for this display.
 * LUT Register data is the needed waveform for this display.
 * Max screenbytes are 172*72 / 4 = 3096 bytes (4 Pixels per byte).
 */
var C  = {
  GDE021A1: {
    bpp               : 2,
    displaySizeX      : 72,
    displaySizeY      : 172,
    lutRegisterData   : new Uint8Array([
      0x00,0x00,0x00,0x55,0x00,0x00,0x55,0x55,0x00,0x55,0x55,0x55,0xAA,0xAA,0xAA,0xAA,
      0x15,0x15,0x15,0x15,0x05,0x05,0x05,0x05,0x01,0x01,0x01,0x01,0x00,0x00,0x00,0x00,
      0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
      0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
      0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
      0x22,0xFB,0x22,0x1B,0x00,0x00,0x00,0x00,0x00,0x00
    ]),
    maxScreenBytes    : 3096,
    ramXStartAddress  : 0x00,
    ramXEndAddress    : 0x11,
    ramYStartAddress  : 0x00,
    ramYEndAddress    : 0xAB
  }
};
/**
 * Represents an SSD1606 Display Driver with Controller.
 * All functions are based on spefication version 1.1 from 10/2011.
 * Informations:
 * <ul>
 * <li>The display controller provides up to 180/128/4=5580 bytes of display buffer RAM.</li>
 * <li>Works only with SPI 4-wire mode with using a D/C (data/command) pin.</li>
 * <li>If you provide the BS1 pin the module will handle the correct SPI mode setting.</li>
 * <li>For some future-proof you can set up the clearScreenTimeOut and hardwareResetTimeOut.</li>
 * </ul>
 * @constructor
 * @param {config} - configuration with displayType, SPI and additional pins.
 */
function SSD1606(config) {
  if (config.displayType === 'GDE021A1') {
      this.display = C.GDE021A1;
  } else {
      if(config.display) {
        this.display = config.display;
      } else {
        return new Error('Unknown display type "' + config.displayType + '"" and no display configuration provided!');
      }
  }
  this.spi        = config.spi;
  this.bs1Pin     = config.bs1Pin;
  this.cs1Pin     = config.cs1Pin;
  this.dcPin      = config.dcPin;
  this.busyPin    = config.busyPin;
  this.resetPin   = config.resetPin;
  this.powerPin   = config.powerPin;
  this.g          = this.grfx();
  if (config.clearScreenTimeOut) {
    this.csbTimeOut = config.clearScreenTimeOut;
  } else {
    this.csbTimeOut = 100;
  }
  if (config.clearScreenTimeOut) {
    this.hwResetTimeOut = config.hardwareResetTimeOut;
  } else {
    this.hwResetTimeOut = 100;
  }
}
/**
 * Power on the display, using the provided powerPin.
 */
SSD1606.prototype.on = function() {
  if(this.powerPin) {
    digitalWrite(this.powerPin, HIGH);
  }
};
/**
 * Power off the display, using the provided powerPin.
 */
SSD1606.prototype.off = function() {
  if(this.powerPin) {
    digitalWrite(this.powerPin, LOW);
  }
};
/**
 * Use resetPin to make a hardware reset.
 * @param {callback} callback - callback function
 */
SSD1606.prototype.hwReset = function(callback) {
  digitalWrite(this.resetPin, LOW);
  digitalWrite(this.resetPin, HIGH);
  return setTimeout(callback, this.hwResetTimeOut); // is that even needed?
};
/**
 * Initialize display.
 * If set it uses the provided bs1Pin to configure the SPI mode between to use 4 lines.
 * Initializing sequence:
 * <ol>
 * <li>Exit deep sleep mode</li>
 * <li>Set data entry mode -  0000 0011 means AM=0 means 'x-mode' and ID=11 means 'x:increment and y:increment'</li>
 * <li>Set RAM X start and end addresses</li>
 * <li>Set RAM Y start and end addresses</li>
 * <li>Set RAM X counter</li>
 * <li>Set RAM Y counter</li>
 * <li>Set booster feedback selection</li>
 * <li>Set display update sequence option - enable sequence: clk -> CP</li>
 * <li>Write LUT register</li>
 * <li>Write VCOM register</li>
 * <li>Set border waveform control</li>
 * <li>Set display update sequence option - enable sequence: clk -> CP -> LUT -> initial display -> pattern display</li>
 * </ol>
 * @param {options} options - provided options, useBs1Pin and clearScreenColor
 * @param {callback} callback - callback function
 */
SSD1606.prototype.init = function(callback, options) {
  if(this.bs1Pin) {
    digitalWrite(this.bs1Pin, LOW);
  }
  this.scd(0x10, 0x00);
  this.scd(0x11, 0x03); // 0x03 für alten Wert
  this.scd(0x44,[this.display.ramXStartAddress, this.display.ramXEndAddress]);
  this.scd(0x45,[this.display.ramYStartAddress, this.display.ramYEndAddress]);
  this.scd(0x4E, 0x00);
  this.scd(0x4F, 0x00);
  this.scd(0xF0, 0x1F);
  this.scd(0x22, 0xC0);
  this.scd(0x32, this.display.lutRegisterData);
  this.scd(0x2C, 0xA0);
  this.scd(0x3C, 0x63);
  this.scd(0x22, 0xC4);
  if(options && options.clearScreenColor){
    return this.csb(callback, options.clearScreenColor);
  } else {
    return callback();
  }
};
/**
 * Send a command to the display, uses the cs1Pin (chip select).
 * Uses the dcPin if spimode is set to 4-lines, otherwise add a bit to the
 * left to signal a command.
 * Possible commands:
 * <ol>
 * <li>0x01 - Driver output control</li>
 * <li>0x02 - Reserve</li>
 * <li>0x03 - Gate driving voltage control</li>
 * <li>0x04 - Source driving voltage control</li>
 * <li>0x05 - Reserve</li>
 * <li>0x06 - Reserve</li>
 * <li>0x07 - Display control</li>
 * <li>0x08 - Reserve</li>
 * <li>0x09 - Reserve</li>
 * <li>0x0A - Reserve</li>
 * <li>0x0B - Gate and source non overlap period control</li>
 * <li>0x0C - Reserve</li>
 * <li>0x0D - Reserve</li>
 * <li>0x0E - Reserve</li>
 * <li>0x0F - Gate scan start position</li>
 * <li>0x10 - Deep sleep mode</li>
 * <li>0x11 - Data entry mode setting</li>
 * <li>0x12 - Software reset</li>
 * <li>0x13 - Reserve</li>
 * <li>0x14 - Reserve</li>
 * <li>0x15 - Reserve</li>
 * <li>0x16 - Reserve</li>
 * <li>0x17 - Reserve</li>
 * <li>0x18 - Reserve</li>
 * <li>0x19 - Reserve</li>
 * <li>0x1A - Write to temperature register</li>
 * <li>0x1B - Read to temperature register</li>
 * <li>0x1C - Write command to temperature sensor</li>
 * <li>0x1D - Load temperature register with temperature sensor reading</li>
 * <li>0x1E - Reserve</li>
 * <li>0x1F - Reserve</li>
 * <li>0x20 - Master acvitvation</li>
 * <li>0x21 - Display update 1</li>
 * <li>0x22 - Display update 2</li>
 * <li>0x23 - Reserve</li>
 * <li>0x24 - Write RAM</li>
 * <li>0x25 - Read RAM</li>
 * <li>0x26 - Reserve</li>
 * <li>0x27 - Reserve</li>
 * <li>0x28 - VCOM sense</li>
 * <li>0x29 - VCOM sense duration</li>
 * <li>0x2A - Program VCOM OTP</li>
 * <li>0x2B - Reserve</li>
 * <li>0x2C - Write VCOM register</li>
 * <li>0x2D - Read OTP Register</li>
 * <li>0x2E - Reserve</li>
 * <li>0x2F - Reserve</li>
 * <li>0x30 - Program WS OTP</li>
 * <li>0x31 - Reserve</li>
 * <li>0x32 - Write LUT register</li>
 * <li>0x33 - Read LUT register</li>
 * <li>0x34 - Reserve</li>
 * <li>0x35 - Reserve</li>
 * <li>0x36 - Program OTP selection</li>
 * <li>0x37 - OTP selection control</li>
 * <li>0x38 - Reserve</li>
 * <li>0x39 - Reserve</li>
 * <li>0x3A - Set dummy line period</li>
 * <li>0x3B - Set gate line width</li>
 * <li>0x3C - Border waveform control</li>
 * <li>0x3D - Reserve</li>
 * <li>0x3E - Reserve</li>
 * <li>0x3F - Reserve</li>
 * <li>0x40 - Reserve</li>
 * <li>0x41 - Reserve</li>
 * <li>0x42 - Reserve</li>
 * <li>0x43 - Reserve</li>
 * <li>0x44 - Set RAM X address position</li>
 * <li>0x45 - Set RAM Y address position</li>
 * <li>0x46 - Reserve</li>
 * <li>0x47 - Reserve</li>
 * <li>0x48 - Reserve</li>
 * <li>0x49 - Reserve</li>
 * <li>0x4A - Reserve</li>
 * <li>0x4B - Reserve</li>
 * <li>0x4C - Reserve</li>
 * <li>0x4D - Reserve</li>
 * <li>0x4E - Set RAM X address counter</li>
 * <li>0x4F - Set RAM Y address counter</li>
 * <li>0xF0 - Booster feedback selection</li>
 * <li>0xFF - no operation NOP</li>
 * </ol>
 * @param {command} - a command
 * @see SSD1606.C.cmd
 */
SSD1606.prototype.sc = function(command) {
  digitalWrite(this.dcPin, LOW);
  this.spi.write(command, this.cs1Pin);
};
/**
 * Prepare send data, prepares the controller to receive data.
 */
SSD1606.prototype.psd = function() {
  digitalWrite(this.dcPin, HIGH);
};
/**
 * Send data to the controller.
 * @param {data} - the data
 */
SSD1606.prototype.sd = function(data) {
  this.spi.write(data, this.cs1Pin);
};
/**
 * Send command and data to the controller.
 * @param {command} - the command
 * @param {data} - the data
 */
SSD1606.prototype.scd = function(command, data) {
  this.sc(command);
  this.psd();
  this.sd(data);
};
/**
 * Checks the busyPin and runs the callback, wenn the busyPin is LOW.
 * @param {callback} - the callback function
 */
SSD1606.prototype.cbp = function(callback) {
  return setWatch(callback, this.busyPin, { repeat:false, edge:'falling' });
};
/**
 * Clears the display screenbuffer with desired color.
 * Possible color values:
 * <ul>
 * <li>0b00000000 = all black, or decimal 0, or hexadecimal 0x00</li>
 * <li>0b01010101 = dark gray, or decimal 85, or hexadecimal 0x55</li>
 * <li>0b10101010 = light gray, or decimal 170, or hexadecimal 0xAA</li>
 * <li>0b11111111 = light gray, or decimal 255, or hexadecimal 0xFF</li>
 * </ul>
 * Right now it sends each 4-pixel byte individually, but does not need an
 * internal buffer array.
 * The display driver handles the X and Y RAM counters itself, so it is save to
 * just write the bytes.
 * To leave the write RAM mode a 'NOP' command is sent.
 * According to specification a check of the BusyPin is needed, but this does not work here.
 * It seems the display driver encapsulates this behaviour.
 * @param {byte} - the color to set
 * @param {callback} - the callback function, will be called, when finished
 */
SSD1606.prototype.csb = function(callback, clearScreenColor) {
  this.scd(0x44, 0x00);
  this.scd(0x45, 0x00);
  this.sc(0x24);
  this.psd();
  for (i = 0; i < this.display.maxScreenBytes; i++) {
    this.sd(clearScreenColor);
  }
  this.sc(0xFF);
  return setTimeout(callback, this.csbTimeOut);
};
/**
 * Refresh the screen, need to be called by application every time the screen changed.
 * Refresh sequence:
 * <ol>
 * <li>Master activation</li>
 * <li>Display update 2 - part of <em>closebump</em> in specification</li>
 * <li>Master activation  - part of <em>closebump</em> in specification</li>
 * <li>check BusyPin before the display can receive further commands or data. Part of <em>closebump</em> in specification</li>
 * </ol>
 * @param {callback} - callback is called, when busy pin is ready.
 */
SSD1606.prototype.refreshScreen = function(callback) {
  this.sc(0x20);
  this.scd(0x22, 0x03);
  this.sc(0x20);
  return this.cbp(callback);
};
/**
 * Sets the X and Y RAM counter.
 * @param {int} - X RAM counter
 * @param {int} - Y RAM counter
 */
SSD1606.prototype.sxyc = function(xCount, yCount) {
  this.scd(0x4E, xCount);
  this.scd(0x4F, yCount);
};
/**
 * Creates the Graphics object with Graphics.createArrayBuffer(...).
 * Sets the display x size, y size, bits per pixel and msb:true.
 * Provides a clear function to fill in-memory buffer with one color for each pixel.
 * Provides a flip function to flush in-memory buffer to display buffer.
 */
SSD1606.prototype.grfx = function(){
  var _display = this;
  var g = Graphics.createArrayBuffer(
            this.display.displaySizeX,
            this.display.displaySizeY,
            this.display.bpp,
            {msb: true}
          );
  g.clear = function(clearColor){
    new Uint8Array(this.buffer).fill(clearColor);
  };
  g.flip = function(){
    _display.sxyc(0, 0);
    _display.scd(0x24, this.buffer);
    _display.sc(0xFF);
  };
  return g;
};
/**
 * Export the module.
 */
exports.connect = function (options) {
  return new SSD1606(options);
};
