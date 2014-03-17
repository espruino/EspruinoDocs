function ILI9341(){
  var dc = C6,ce = C7,rst = C8;
  var spi = SPI2, sck = B13, miso = B14, mosi = B15;
  var w = 240,h = 320,me = this;
  var color = 0xffff, bgColor = 0x0000, font;
  function writeCMD(d){
    dc.write(0);
    ce.write(0);
    spi.send(d);
    dc.write(1);
  }
  function writeCD(c,d){
    writeCMD(c);
    spi.send(d);
    ce.write(1);
  }
  function calc16(d){
    return [d >> 8,d & 255];
  }
  function calc32(d,e){
    return [d >> 8,d & 255,e >> 8,e & 255];
  }
  function writeCD16(c,d){
    var d1,d2;
    d1 = d >> 8;
    d2 = d & 255;
    writeCD(c,calc16(d));
  }
  function window(x1,y1,x2,y2){
    writeCD(0x2A,calc32(x1,x2));
    writeCD(0x2B,calc32(y1,y2));
  }
  function windowMax(){
    window(0,0,w - 1,h -1);
  }
  function setPins(pins){
    if(pins){
      spi = pins.spi;sck = pins.sck;miso = pins.miso;mosi = pins.mosi;
      dc = pins.dc;ce = pins.ce;rst = pins.rst;
    }
    spi.setup({baud:320000,sck:sck,miso:miso,mosi:mosi});
  }
  function initGraphics(){
    var g;
    g = Graphics.createCallback(w,h,16,{setPixel:setPixel,fillRect:fillRect});
    me.graphics = g;
  }
  function init(callback){
    setPins();
    ce.write(1);
    dc.write(1);
    rst.write(0);
    setTimeout(function(){
      rst.write(1);
      setTimeout(function(){
        writeCMD(0x01);
        setTimeout(function(){
          writeCMD(0x28);ce.write(1);
          writeCD(0xCF,[0x00,0x83,0x30]);
          writeCD(0xED,[0x64,0x03,0x12,0x81]);
          writeCD(0xE8,[0x85,0x01,0x79]);
          writeCD(0xCB,[0x39,0x2C,0x00,0x34,0x02]);
          writeCD(0xF7,0x20);
          writeCD(0xEA,[0x00,0x00]);
          writeCD(0xC0,0x26);
          writeCD(0xC1,0x11);
          writeCD(0xC5,[0x35,0x3E]);
          writeCD(0xC7,0xBE);
          writeCD(0x36,0x48);
          writeCD(0x3A,0x55);
          writeCD(0xB1,[0x00,0x1B]);
          writeCD(0xF2,0x08);
          writeCD(0x26,0x01);
          writeCD(0xE0,[0x1F,0x1A,0x18,0x0A,0x0F,0x06,0x45,0x87,0x32,0x0A,0x07,0x02,0x07,0x05,0x00]);
          writeCD(0xE1,[0x00,0x25,0x27,0x05,0x10,0x09,0x3A,0x78,0x4D,0x05,0x18,0x0D,0x38,0x3A,0x1F]);
          windowMax();
          writeCD(0xB7,0x07);
          writeCD(0xB6,[0x0A,0x82,0x27,0x00]);
          writeCMD(0x11);ce.write(1);
          setTimeout(function(){
            writeCMD(0x29);ce.write(1);
            setTimeout(function(){
              initGraphics();
              callback(me.graphics);
            },100);
          },100);
        },5);
      },5);
    },1);
  }
  function setPixel(x,y,c){
    window(x,y,x + 1,y + 1);
    writeCD(0x2C,calc16(c));
  }
  function fillRect(x1,y1,x2,y2,c){
    var cnt = (x2 - x1 + 1) * (y2 - y1 + 1);
    window(x1,y1,x2,y2);
    writeCMD(0x2C);
    for(var i = 0; i < cnt; i++){
      spi.send(calc16(c));
    }
    ce.write(1);
  }
  function setColor(foreground,background){
    me.graphics.setBgColor(background);
    me.graphics.setColor(foreground);
    color = foreground;
    bgColor = background;
  }
  function loadFont(file){
    var f2,fs = require("fs");
    f2 = fs.readFile(file);
    font = new Uint8Array(f2.length);
    font.set(f2);
  }
  function drawString(text,x,y,m){
    var pos = {x:x,y:y};
    for(var i = 0; i < text.length; i++){
      drawChar(text[i],pos,m);
    }
  }
  function drawChar(c,p,m){
    var ofs,hor,vert,bpl,z,b,i,j,im,jm;
    m = m?m:1;
    ofs = ((c.charCodeAt(0) - 32) * font[0]) + 4;
    hor = (font[1] < (font[ofs] + 1))?font[1]:font[ofs];
    vert = font[2];
    bpl = font[3];
    window(p.x,p.y,p.x + (hor * m) -1,p.y + (vert * m) - 1);
    writeCMD(0x2C);
    for(j = 0; j < vert; j++){
      for(jm = 0; jm < m; jm++){
        for(i = 0; i < hor; i++){
          z = font[ofs + bpl * i + ((j & 0xF8) >> 3)+1];
          b = 1 << (j & 0x07);
          for(im = 0; im < m; im++){
            if (( z & b ) === 0x00) {
              spi.send(calc16(bgColor));
            } 
            else{
              spi.send(calc16(color));
            }
          }
        }
      }
    }
    ce.write(1);
    p.x += hor * m;
  }
  function drawCircle(x0,y0,r,f){
    function line(x,y,h){
      window(x, y - h, x, y + h);
      writeCMD(0x2c);
      for( i = 0; i < 2 * h; i++){
        spi.send(calc16(color));
      }
      ce.write(1);
    }
    var x = -r, y = 0, err = 2-2 * r,e2,i;
    while(x <=0){
      if(f){
        line(x0 - x, y0, y);
        line(x0 + x, y0, y);
      }
      else{
        setPixel(x0-x, y0+y, color);
        setPixel(x0+x, y0+y, color);
        setPixel(x0+x, y0-y, color);
        setPixel(x0-x, y0-y, color);
      }
      e2 = err;
      if (e2 <= y) {
        err += ++y*2+1;
        if (-x == y && e2 <= x) e2 = 0;
      }
      if (e2 > x) err += ++x*2+1;
    }
  }
  function setOrientation(o){
    switch(o){
      case 0: w = 240; h = 320; writeCD(0x36,0x48); break;
      case 1: w = 320; h = 240; writeCD(0x36,0x28); break;
      case 2: w = 240; h = 320; writeCD(0x36,0x88); break;
      case 3: w = 320; h = 240; writeCD(0x36,0xE8); break;
    }
    windowMax();
    initGraphics();
    return me.graphics;
  }
  me.init = init; me.setOrientation = setOrientation; me.setPins = setPins;
  me.setColor = setColor;me.drawCircle = drawCircle; 
  me.loadFont = loadFont;me.drawString = drawString;
}
exports.connect = function(){ return new ILI9341(); }
/*var d,g;
function ILIDemo(graphics){         //Init returns Graphics object, other option is to use d.graphics
  g = graphics;
  g.setColor(0,1,0);
  g.fillRect(0,0,50,50);            //calls for setPixel and fillRect are redirected to functions in ILI9341
  g.setColor(1,0,0);
  g.fillRect(70,70,120,120);
  g.setFontVector(12);
  g.drawString("Espruino",10,10);   // up to here everything is same code that can be used for PCD8544 for example
  d.setColor(0x07E0,0xF800);        // new setColor on level of ILI9341, there is no easy way to read foreground and baclground color
  d.loadFont("Font12.txt");         // loads a font from SD card and holds it internally in ILI9341
  d.drawString("Espruino",0,40);    // new function drawString using loaded font
  d.drawString("Espruino",0,80,2);  // new drawString with magnifier, easy to read on small display with a lot of pixels
  d.setColor(0x7FF,0xC798);
  d.drawString("Espruino",0,120,3);
  d.drawCircle(100,200,30);         // new function to draw circle
  d.drawCircle(100,200,20,true);    // drawCircle with fill parameter, true = fill
  for(var i = 0; i < 4; i++){
    g = d.setOrientation(i);        // new function to set orientation of display, parameter from 0 to 3, returns Graphics object
    g.setFontVector(12);            // need to be set again, since we have a new Graphics object
    g.drawString("Mode " + i,0,0);  // works fine with standard call to Graphics object
    d.drawString("XYZ",100,0,2);    // and with call to function in ILI9341
  }
}
d = require("ILI9341").connect();   // creates an ILI99341 object, default is SPI2, sck=B13, miso = B14, mosi = B15, dc = C6, ce = C7, rst = C8
d.init(ILIDemo);                    // initialize, you can set other pins by calling d.setPins({spi:..,sck:..,miso:..,mosi:..,dc:..,ce:..,rst:..});
*/