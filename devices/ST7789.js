/* Copyright (c) 2020 Akos Lukacs, based on code by Gordon Williams and https://github.com/Bodmer/TFT_eSPI. See the file LICENSE for copying permission. */
/*
Module for the ST7789 135x240 LCD controller

Just:
```
// ST7789 demo code on TTGO T-Display
D4.set(); // LCD backlight on
var spi = new SPI();
spi.setup({mosi:D19, sck:D18});
var g = require("ST7789").connect(spi, D16, D5, D23, function() {
    g.clear();
    g.setRotation(1);
    g.drawString("Hello",0,0);
    g.setFontVector(20);
    g.setColor(0,0.5,1);
    g.drawString("Espruino",0,10);
  });
```

*/
const LCD_WIDTH = 135;
const LCD_HEIGHT = 240;
const COLSTART = 52;
const ROWSTART = 40;


function init(spi, dc, ce, rst, callback) {
    function cmd(c, d) {
        dc.reset();
        spi.write(c, ce);
        if (d !== undefined) {
            dc.set();
            spi.write(d, ce);
        }
    }

    if (rst) {
        digitalPulse(rst, 0, 10);
    } else {
        cmd(0x01); //Software reset
    }

    const ST7789_INIT_CODE = [
        // CMD, D0,D1,D2...
        [0x11, 0],     //SLPOUT (11h):
        // This is an unrotated screen
        [0x36, 0],     // MADCTL
        // These 2 rotate the screen by 180 degrees
        //0x36,0xC0],     // MADCTL
        //0x37,[0,80]],   // VSCSAD (37h): Vertical Scroll Start Address of RAM

        [0x3A, 0x55],  // COLMOD - interface pixel format - 16bpp
        [0xB2, [0xC, 0xC, 0, 0x33, 0x33]], // PORCTRL (B2h): Porch Setting
        [0xB7, 0],     // GCTRL (B7h): Gate Control
        [0xBB, 0x3E],  // VCOMS (BBh): VCOM Setting 
        [0xC2, 1],     // VDVVRHEN (C2h): VDV and VRH Command Enable
        [0xC3, 0x19],  // VRHS (C3h): VRH Set 
        [0xC4, 0x20],  // VDVS (C4h): VDV Set
        [0xC5, 0xF],   // VCMOFSET (C5h): VCOM Offset Set .
        [0xD0, [0xA4, 0xA1]],   // PWCTRL1 (D0h): Power Control 1 
        [0xe0, [0x70, 0x15, 0x20, 0x15, 0x10, 0x09, 0x48, 0x33, 0x53, 0x0B, 0x19, 0x15, 0x2a, 0x2f]],   // PVGAMCTRL (E0h): Positive Voltage Gamma Control
        [0xe1, [0x70, 0x15, 0x20, 0x15, 0x10, 0x09, 0x48, 0x33, 0x53, 0x0B, 0x19, 0x15, 0x2a, 0x2f]],   // NVGAMCTRL (E1h): Negative Voltage Gamma Contro
        [0x29, 0], // DISPON (29h): Display On 
        [0x21, 0], // INVON (21h): Display Inversion On
        // End
        [0, 0]// 255/*DATA_LEN = 255 => END*/
    ];

    setTimeout(function () {
        cmd(0x11); //Exit Sleep
        setTimeout(function () {
            ST7789_INIT_CODE.forEach(function (e) {
                cmd(e[0], e[1])
            });
            if (callback) callback();
        }, 20);
    }, 120);
}


exports.connect = function (spi, dc, ce, rst, callback) {
    var g = Graphics.createCallback(LCD_WIDTH, LCD_HEIGHT, 16, {
        setPixel: function (x, y, c) {
            ce.reset();
            spi.write(0x2A, dc);
            spi.write((COLSTART + x) >> 8, COLSTART + x, (COLSTART + x) >> 8, COLSTART + x);
            spi.write(0x2B, dc);
            spi.write((ROWSTART + y) >> 8, ROWSTART + y, (ROWSTART + y) >> 8, (ROWSTART + y));
            spi.write(0x2C, dc);
            spi.write(c >> 8, c);
            ce.set();
        },
        fillRect: function (x1, y1, x2, y2, c) {
            ce.reset();
            spi.write(0x2A, dc);
            spi.write((COLSTART + x1) >> 8, COLSTART + x1, (COLSTART + x2) >> 8, COLSTART + x2);
            spi.write(0x2B, dc);
            spi.write((ROWSTART + y1) >> 8, ROWSTART + y1, (ROWSTART + y2) >> 8, (ROWSTART + y2));
            spi.write(0x2C, dc);
            spi.write({ data: String.fromCharCode(c >> 8, c), count: (x2 - x1 + 1) * (y2 - y1 + 1) });
            ce.set();
        }
    });
    init(spi, dc, ce, rst, callback);
    return g;
};


// // this produces skewed output, further investigation needed...
// exports.connectPaletted = function (palette, spi, dc, ce, rst, callback) {
//     var bits;
//     if (palette.length > 16) bits = 8;
//     else if (palette.length > 4) bits = 4;
//     else if (palette.length > 2) bits = 2;
//     else bits = 1;
//     var g = Graphics.createArrayBuffer(LCD_WIDTH, LCD_HEIGHT, bits, { msb: true });
//     g.flip = function () {
//         ce.reset();
//         spi.write(0x2A, dc);
//         spi.write(0, COLSTART, (COLSTART+LCD_WIDTH)>>8, COLSTART+LCD_WIDTH);
//         spi.write(0x2B, dc);
//         spi.write(0, ROWSTART, (ROWSTART+LCD_HEIGHT)>>8, ROWSTART+LCD_HEIGHT);
//         spi.write(0x2C, dc);
//         var lines = 16; // size of buffer to use for un-paletting
//         var a = new Uint16Array(LCD_WIDTH * lines);
//         for (var y = 0; y < LCD_HEIGHT; y += lines) {
//             E.mapInPlace(new Uint8Array(g.buffer, y * LCD_WIDTH * bits / 8, a.length), a, palette, bits);
//             spi.write(a.buffer);
//         }
//         ce.set();
//     };
//     init(spi, dc, ce, rst, callback);
//     return g;
// };
