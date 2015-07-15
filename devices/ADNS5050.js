/* Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* 
Module for the ADNS5050 Optical mouse sensor

```
var s = new SPI();
s.setup({mosi:B5,miso:B4,sck:B3,mode:3});
var sensor = new ADNS5050(s,A10);
sensor.drawImage(sensor.getImage());
```

 */

function ADNS5050(spi, ncs) {
  this.spi = spi;
  this.ncs = ncs;
}

/// Get first line of 19 pixels as a Uint8Array
ADNS5050.prototype.getLine = function() {
  this.spi.send([0x8B,0],this.ncs);
  var z = this.spi.send.bind(this.spi,[0xB,0],this.ncs);
  var i = new Uint8Array(19);
  var j=0,d;
  while(j<19)if((d=z()[1])&128)i[j++]=d<<1;
  return i;
};

/// Get entire 19x19 image as a Uint8Array. Takes around 0.2 sec 
ADNS5050.prototype.getImage = function() {
  this.spi.send([0x8B,0],this.ncs);
  var z = this.spi.send.bind(this.spi,[0xB,0],this.ncs);
  var i = new Uint8Array(361);
  var j=0,d;
  while(j<361)if((d=z()[1])&128)i[j++]=d<<1;
  return i;
};

/// Returns movement as [x,y] (or undefined if no update)
ADNS5050.prototype.getMovement = function() {
  var d = this.spi.send([2,0,3,0,4,0],this.ncs);
  if (d[1]&128) {
    return new Int8Array([d[3],d[5]]);
  }
  // else return undefined
};

/// Returns movement as [x,y] (or undefined if no update)
ADNS5050.prototype.getMovement = function() {
  var d = this.spi.send([2,0,3,0,4,0],this.ncs);
  if (d[1]&128) {
    return new Int8Array([d[3],d[5]]);
  }
  // else return undefined
};

/** Return surface quality (number of features) between 0 and 127. 50 is fine, 0 is bad.
 When looking at properly lit paper this is effectively how good the focus is */
ADNS5050.prototype.getSQual = function() {
  return this.spi.send([5,0],this.ncs)[1];
};

/** Return the shutter time in clock cycles between 0 and 65535. 
 Higher values mean longer shutter times = less illumination.*/
ADNS5050.prototype.getShutter = function() {
  var d = this.spi.send([6,0,7,0],this.ncs);
  return (d[1]<<8) | d[3];
};

// Draw the image from getImage to the console as ASCII art
ADNS5050.prototype.drawImage = function(img) {
  var ch = " .,:-+x#";
  for (var y=0;y<19;y++) {
    var l = "";
    for (var x=0;x<19;x++) {
      var d = img[x+y*19]>>5;
      if (d>=ch.length) d=ch.length-1;
      l+=ch[d];
    }
    console.log(l);
  }
};

// Create an instance of ADNS5050 
exports.connect = function(/*=SPI*/spi, /*=PIN*/cs) {
  return new ADNS5050(spi, cs);
};
