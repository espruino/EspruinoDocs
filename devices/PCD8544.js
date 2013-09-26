/* Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* 
Module for the PCD8544 controller in the Nokia 5110 LCD.

Just:
```
var g = require("PCD8544").connect(hardware);
g.clear();
g.drawString("Hello",0,0);
g.drawLine(0,10,84,10);
g.flip();
```  

 */
exports.connect = function(hardware) {
  var LCD = Graphics.createArrayBuffer(84,48,1,{vertical_byte:true});
  LCD.DC = B6;                       
  LCD.CE = B7;                  
  LCD.RST = B8;            
  SPI1.setup({ baud: 200000, sck:B3, mosi:B5 });
  digitalPulse(LCD.RST, 0, 10); // pulse reset low
  setTimeout(function() {
    digitalWrite(LCD.DC,0); // cmd
    SPI1.send(
      [0x21, // fnset extended
      0x80 | 0x40, // setvop (experiment with 2nd val to get the right contrast)
      0x14, // setbias 4
      0x04 | 0x02, // temp control
      0x20, // fnset normal
      0x08 | 0x04], LCD.CE); // dispctl normal
    }, 100);

  LCD.flip = function () {       
   for (var i=0;i<6;i++) {  
    digitalWrite(this.DC,0); // cmd
    SPI1.send(0x40|i, this.CE); // Y addr
    SPI1.send(0x80, this.CE); // X addr          
    digitalWrite(this.DC,1); // data
    SPI1.send(new Uint8Array(this.buffer,i*84,84+2), this.CE);
   }
   // Why +2 in SPI.send? Maybe it needs some time to sort itself out
  }  
  return LCD; 
}
