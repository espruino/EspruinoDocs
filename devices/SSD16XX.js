/* Created by Brenden Adamczak 
   Inspirted from Michael Pralow - SSD1606 driver
   With help from yngv126399 from the forum and of course Gordon 
*/

/**
 * Represents an SSD16xx Display Driver with Controller.
 * Currently its been tested with module GDEH0154D67 with SSD1681.
 */


/**
 * Represents an SSD16xx Display Driver with Controller.
 * Informations:
 * <ul>
 * <li>This controller is designed to work with many different controllers in the SSD16__ series.</li>
 * <li>Works only with SPI 4-wire mode with using a D/C (data/command) pin.</li>
 * <li>If you provide the BS1 pin the module will handle the correct SPI mode setting.</li>
 * <li>For some future-proof you can set up the clearScreenTimeOut and hardwareResetTimeOut.</li>
 * </ul>
 * @constructor
 * @param config - configuration with displayParams, SPI and additional pins.
 */
function SSD16xx(config){
  this.display = config.display;
  
  this.spi        = config.spi;
  this.bsPin      = config.bsPin;
  this.csPin      = config.csPin;
  this.dcPin      = config.dcPin;
  this.busyPin    = config.busyPin;
  this.resetPin   = config.resetPin;
  this.powerPin   = config.powerPin;
  
  this.partial    = false;
  this.partialTran= false;
  this.unInit     = true;
  
  this.g          = {bw: this.grfxBlackWhite(), 
                     flip:this.flip.bind(this), 
                     clear:this.clear.bind(this),
                     setRotation:this.setRotation.bind(this)};
  if(this.display.coloredDisplay){
    this.g.cw = this.grfxColorWhite();
  }
  digitalWrite(this.csPin,    true);
  digitalWrite(this.dcPin,    false);
  digitalWrite(this.resetPin, true);
  
  this.hwResetTimeOut = 100;
  if (config.clearScreenTimeOut) {
    this.hwResetTimeOut = config.hardwareResetTimeOut;
  }
}

/**
 * Power on the display, using the provided powerPin.
 */
SSD16xx.prototype.on = function() {
  if(this.powerPin) {
    digitalWrite(this.powerPin, 1);
  }
};

/**
 * Power off the display, using the provided powerPin.
 */
SSD16xx.prototype.off = function() {
  if(this.powerPin) {
    digitalWrite(this.powerPin, 0);
  }
};

/**
 * Enters deep sleep and needs a hwReset to enable it again
 */
SSD16xx.prototype.sleep = function() {
  this.scd(0x10, 0x0);
  this.unInit     = true;
};

/**
 * Use resetPin to make a hardware reset.
 * @param {Function} callback - callback function
 */
SSD16xx.prototype.hwReset = function() {
  return new Promise((resolve)=>{
    digitalWrite(this.resetPin, 0);
    digitalWrite(this.resetPin, 1);
    setInterval(function() {
      resolve();
    }, this.hwResetTimeOut);
  });
};

/**
 * Send command to the controller.
 * @param command - the command int
 */
SSD16xx.prototype.sc = function(command) {
  digitalWrite(this.dcPin, 0);
  this.spi.write(command, this.csPin);
};

/**
 * Send data to the controller.
 * @param data - the data
 */
SSD16xx.prototype.sd = function(data) {
  digitalWrite(this.dcPin, 1);
  this.spi.write(data, this.csPin);
  digitalWrite(this.dcPin, 0);
};

/**
 * Send command and data to the controller.
 * @param command - the command
 * @param data - the data
 */
SSD16xx.prototype.scd = function(command, data) {
  this.sc(command);
  this.sd(data);
};

/**
 * Does hardware reset and then does a software reset.
 * @param {Function} callback - callback function
 */
SSD16xx.prototype.fullReset = function() {
  return this.hwReset().then(()=>{
    return new Promise((resolve)=>{
      this.sc(0x12);
      this.partialTran=false;
      this.partial    = false;
      this.unInit     = true;
      setTimeout(resolve,this.hwResetTimeOut);
    });
  });
};


/**
 * Send a cmd and optional data.  Then waits for the device to be ready
 * @param {Function} callback - callback function
 */
SSD16xx.prototype.waitCmd = function(command, data){
  return new Promise((resolve)=>{
    console.log("sending a busy command!");
    this.sc(command);
    if(data){
      this.sd(data);
    }
    if(this.busyPin.read()){
      setWatch(resolve, this.busyPin, { repeat:false, edge:'falling' });
    }
    else{
      resolve();
    }
  });
};


/**
 * Sends the refresh dispaly command and then waits
 */
SSD16xx.prototype.refreshDisplay = function(command){
  return this.waitCmd(0x20);
};


/**
 * Initialize display.
 * If set it uses the provided bs1Pin to configure the SPI mode between to use 4 lines.
 * Initializing sequence:
 * <ol>
 * <li>Exit deep sleep mode</li>
 * <li>Set region of the display to full and increment in positive both in Y and X</li>
 * <li>[optional] LUT init</li>
 * </ol>
 * @param {Object} options - provided options, useBs1Pin and clearScreenColor
 * @param {Function} callback - callback function
 */
SSD16xx.prototype.init = function() {
  return new Promise((resolve)=>{
    if(this.bsPin) {
      digitalWrite(this.bsPin, 0);
    }
    this.scd(0x10, 0x00); //get out of sleep
    this.scd(0x01,[(this.display.displaySizeY-1)%256,(this.display.displaySizeY-1)/256,0]);
    this.scd(0x11, 0x03); // point x,y increase
    this.setPartialRegion(0,0,this.display.displaySizeX, this.display.displaySizeY );
    this.setFullRefresh();
    this.clear();
    console.log("got here");
    this.unInit = false;
    this.flip().then(()=>{
      resolve();
    });
  });
};

/**
 * Sets a partial region of the display.
 * @param {Function} x,y w=width and h=height
 */
SSD16xx.prototype.setPartialRegion = function(x,y,w,h)
{
   this.scd(0x44, [(x/8), ((x + w - 1)/8)] );
   this.scd(0x45, [y%256, y / 256, (y+h-1) % 256, (y+h-1) / 256]);
   this.scd(0x4E,[x/8]);
   this.scd(0x4F,[y%256, y/256]);
};

/**
 * Sets display to do full refreshes
 */
SSD16xx.prototype.setFullRefresh = function(){
  if(this.display.lutRegisterData){
    this.scd(0x32,this.display.lutRegisterData);
  }
  this.scd(0x22, 0xF7);
  this.partialTran = true;
  this.partial     = false;
};

/**
 * SetFastRefresh - is used make the device refresh the display in only the changed pixels.  
 * This will increase the displays refresh rate, but might cause burn into the display.
 * So its recommended to do a (setFullRefresh) to fully reset the display pixels.  But if you do this.
 * You'll have to use this SetFastRefresh to make the display only refresh partiaily.  
 */
SSD16xx.prototype.setFastRefresh = function() {
  const WF_PARTIAL = E.toUint8Array(atob('AEAAAAAAAAAAAAAAgIAAAAAAAAAAAAAAQEAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwAAAAAAAQEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIiIiIiIiAAAA'));
  return new Promise((resolve)=>{
    this.waitCmd(0x32, WF_PARTIAL).then(()=>{
      this.scd(0x3F, 0x02);
      this.scd(0x03, 0x17);
      this.scd(0x04,[0x41,0xB0,0x32]); 
      this.scd(0x2C, 0x28);
      this.scd(0x37, [0,0,0,0,0,0x40,0,0,0,0]); 

      this.waitCmd(0x3C, 0x80).then(()=>{
        this.partial = true;
        this.scd(0x22, 0xcf); // finalize
        this.refreshDisplay().then(()=>{
            resolve();
        });
      });
    });
  });
};


/**
 * flip - Sets up to wrights the full buffer to the display and then waits for a refresh. 
 */
SSD16xx.prototype.flip = function() {
    if(this.unInit == true){
      return this.init().then(()=>{
        return this.flip();
      });
    }
    this.scd(0x4E, 0);
    this.scd(0x4F, [0,0]);
    if(this.partialTran == true){
      this.partialTran = false;
      this.scd(0x26, this.g.bw.buffer);
      this.scd(0x24, this.g.bw.buffer);
    }
    else{
      this.scd(0x24, this.g.bw.buffer);
    }


    if(this.display.coloredDisplay){
        this.scd(0x4E, 0);
        this.scd(0x4F, [0,0]);
        this.scd(0x26, this.g.cw.buffer);
    }

    return this.refreshDisplay();
};



/**
 * Clear the buffer based on a specific color. 
 * @param {clearColor} - The color will be in byte size.  So properly duplicate bit colors to a byte.  
 */
SSD16xx.prototype.clear = function(clearColor){
  this.g.bw.clear(clearColor);
  if(this.display.coloredDisplay){
    this.g.cw.clear(clearColor);
  }
};

/**
 * Rotates the buffer
 * @param {rotation} - Rotation in 0-3 with each being a 90 degree rotation.    
 */
SSD16xx.prototype.setRotation = function(rotation){
  this.g.bw.setRotation(rotation);
  if(this.display.coloredDisplay){
    this.g.cw.setRotation(rotation);
  }
};



/**
 * Black and white display buffer.  
 * Creates the Graphics object with Graphics.createArrayBuffer(...).
 * Sets the display x size, y size, bits per pixel and msb:true.
 * Provides a clear function to fill in-memory buffer with one color for each pixel.
 */
SSD16xx.prototype.grfxBlackWhite  = function(){
  var g = Graphics.createArrayBuffer(
            this.display.displaySizeX,
            this.display.displaySizeY,
            this.display.bpp,
            {msb: true}
          );
  g.clear = function(clearColor){
    new Uint8Array(this.buffer).fill(clearColor);
  };
  return g;
};

/**
 * Red or yellow display buffer for screen that support it.  a
 * Creates the Graphics object with Graphics.createArrayBuffer(...).
 * Sets the display x size, y size, bits per pixel and msb:true.
 * Provides a clear function to fill in-memory buffer with one color for each pixel.
 */
SSD16xx.prototype.grfxColorWhite  = function(){
  var g = Graphics.createArrayBuffer(
            this.display.displaySizeX,
            this.display.displaySizeY,
            this.display.bpp,
            {msb: true}
          );
  g.clear = function(clearColor){
    new Uint8Array(this.buffer).fill(clearColor);
  };
  return g;
};


/* Export the module.
 */
exports.connect = function (options) {
  return new SSD16xx(options);
};
