/* Created by Brenden Adamczak 
   Inspirted from Michael Pralow - SSD1606 driver
   With help from yngv126399 from the forum and of course Gordon 
*/

/**
 * Represents an SSD16xx Display Driver with Controller.
 * Currently its been tested with module GDEH0154D67 with SSD1681.
 */


function SSD16xx(config){
  this.display = config.display;
  
  this.spi        = config.spi;
  this.bsPin      = config.bsPin; //Used to force this into 8 bit spi mode
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
                     clear:this.clear.bind(this)};
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


SSD16xx.prototype.on = function() {
  if(this.powerPin) {
    digitalWrite(this.powerPin, 1);
  }
};


SSD16xx.prototype.off = function() {
  if(this.powerPin) {
    digitalWrite(this.powerPin, 0);
  }
};

SSD16xx.prototype.sleep = function() {
  this.scd(0x10, 0x0);
  this.unInit     = true;
};

SSD16xx.prototype.hwReset = function() {
  return new Promise((resolve)=>{
    digitalWrite(this.resetPin, 0);
    digitalWrite(this.resetPin, 1);
    setInterval(function() {
      resolve();
    }, this.hwResetTimeOut);
  });
};

SSD16xx.prototype.sc = function(command) {
  digitalWrite(this.dcPin, 0);
  this.spi.write(command, this.csPin);
};


SSD16xx.prototype.sd = function(data) {
  digitalWrite(this.dcPin, 1);
  this.spi.write(data, this.csPin);
  digitalWrite(this.dcPin, 0);
};

SSD16xx.prototype.scd = function(command, data) {
  this.sc(command);
  this.sd(data);
};

SSD16xx.prototype.fullReset = function() {
  return new Promise((resolve)=>{
    digitalWrite(this.resetPin, 0);
    digitalWrite(this.resetPin, 1);
    setTimeout(()=>{
      this.sc(0x12);
      this.partialTran=false;
      this.partial    = false;
      this.unInit     = true;
      setTimeout(resolve,this.hwResetTimeOut);
    },this.hwResetTimeOut);
  });
};


//when the busy pin is high no command will work
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



SSD16xx.prototype.refreshDisplay = function(command){
  return this.waitCmd(0x20);
};


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

SSD16xx.prototype.setPartialRegion = function(x,y,w,h)
{
   this.scd(0x44, [(x/8), ((x + w - 1)/8)] );
   this.scd(0x45, [y%256, y / 256, (y+h-1) % 256, (y+h-1) / 256]);
   this.scd(0x4E,[x/8]);
   this.scd(0x4F,[y%256, y/256]);
};

SSD16xx.prototype.setFullRefresh = function(){
  if(this.display.lutRegisterData){
    this.scd(0x32,this.display.lutRegisterData);
  }
  this.scd(0x22, 0xF7);
  this.partialTran = true;
  this.partial     = false;
}

SSD16xx.prototype.setFastRefresh = function() {
  const WF_PARTIAL = new Uint8Array([ 0x0,0x40,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x80,0x80,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x40,0x40,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0, 0x0,0x80,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0, 0xF,0x0,0x0,0x0,0x0,0x0,0x1,0x1,0x1,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0, 0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0, 0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x22,0x22,0x22,0x22,0x22,0x22,0x0,0x0,0x0
    ]);
  
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




SSD16xx.prototype.clear = function(clearColor){
  this.g.bw.clear(clearColor);
  if(this.display.coloredDisplay){
    this.g.cw.clear(clearColor);
  }
  
};



/**
 * Creates the Graphics object with Graphics.createArrayBuffer(...).
 * Sets the display x size, y size, bits per pixel and msb:true.
 * Provides a clear function to fill in-memory buffer with one color for each pixel.
 * Provides a flip function to flush in-memory buffer to display buffer.
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



exports.connect = function (options) {
  return SSD16xx(options);
};
