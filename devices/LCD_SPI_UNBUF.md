<!--- Copyright (c) 2020 Mark Becker, Pur3 Ltd. See the file LICENSE for copying permission. -->
LCD_SPI_UNBUF LCD Library
============================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/LCD_SPI_UNBUF. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Graphics,Graphics Driver,SPI LCD,LCD_SPI_UNBUF

This library allows you to connect a TFT LCD 16bit color display via [[SPI]] and use
it with the Espruino Graphics library in unbuffered mode. That means each `g.<call>`
 is immediately processed, so no need to implement and call `g.flip()`.

[Support for SPI LCDs](/Graphics#graphics-drivers) is normally provided in Espruino using a
JavaScript graphics driver that is called either:

* For each pixel (slow)
* When `g.flip()` is called (using a lot of memory for a buffer)

`LCD_SPI_UNBUF` is called for every pixel, but is written in compiled C code,
making it substantially faster. Due to its very specific nature, it is not
compiled into Espruino board firmwares, and [must be compiled into a custom firmware](/Building+Custom+Firmware)

### Sample module using LCD_SPI_UNBUF

Once you have a firmware with LCD_SPI_UNBUF:

Create a module based on this code and replace it with init commands suitable for your specific lcd board.
You may be able to consult [existing Graphics Drivers](/Graphics#graphics-drivers) for this.

```JS
// ST7789V-SLU.js
/* Copyright (c) 2020 MaBecker, based on 2020 Akos Lukacs. See the file LICENSE for copying permission. */
/*
Module for the ST7789V controller with a 240x240 display
*/

var WIDTH = 240,
    HEIGHT = 240,
    COLSTART = 0,
    ROWSTART = 0,
    INVERSE = 1;

function init(spi, dc, cs, rst, callback) {
    function cmd(c, d) {
        dc.reset();
        spi.write(c, cs);
        if (d !== undefined) {
            dc.set();
            spi.write(d, cs);
        }
    }
    if (rst) {
        digitalPulse(rst, 0, 10);
    } else {
        cmd(0x01); //Software reset
    }
    setTimeout(function() {
        //SLPOUT
        cmd(0x11);
        setTimeout(function() {
            //MADCTL: Set Memory access control (directions), 1 arg: row addr/col addr, bottom to top refresh
            cmd(0x36, 0x08);
            //COLMOD: Set color mode, 1 arg, no delay: 16-bit color
            cmd(0x3a, 0x05);
            //PORCTRL: Porch control
            cmd(0xb2, [0x0c, 0x0c, 0x00, 0x33, 0x33]);
            //GCTRL: Gate control
            cmd(0xb7, 0x00);
            // VCOMS: VCOMS setting
            cmd(0xbb, 0x3e);
            //LCMCTRL: CM control
            cmd(0xc0, 0xc0);
            //VDVVRHEN: VDV and VRH command enable
            cmd(0xc2, 0x01);
            // VRHS: VRH Set
            cmd(0xc3, 0x19);
            // VDVS: VDV Set
            cmd(0xc4, 0x20);
            //VCMOFSET: VCOM Offset Set .
            cmd(0xC5, 0xF);
            //PWCTRL1: Power Control 1
            cmd(0xD0, [0xA4, 0xA1]);
            // PVGAMCTRL: Positive Voltage Gamma Control
            cmd(0xe0, [0x70, 0x15, 0x20, 0x15, 0x10, 0x09, 0x48, 0x33, 0x53, 0x0B, 0x19, 0x15, 0x2a, 0x2f]);
            // NVGAMCTRL: Negative Voltage Gamma Contro
            cmd(0xe1, [0x70, 0x15, 0x20, 0x15, 0x10, 0x09, 0x48, 0x33, 0x53, 0x0B, 0x19, 0x15, 0x2a, 0x2f]);

            if (INVERSE) {
                //TFT_INVONN: Invert display, no args, no delay
                cmd(0x21);
            } else {
                //TFT_INVOFF: Don't invert display, no args, no delay
                cmd(0x20);
            }
            //TFT_NORON: Set Normal display on, no args, w/delay: 10 ms delay
            cmd(0x13);
            //TFT_DISPON: Set Main screen turn on, no args w/delay: 100 ms delay
            cmd(0x29);
            if (callback) callback();
        }, 50);
    }, 120);
}

exports.connect = function(spi, opt, callback) {
    try {
        HEIGHT = opt.height || HEIGHT;
        WIDTH = opt.width || WIDTH;
        COLSTART = opt.colstart || COLSTART;
        ROWSTART = opt.rowstart || ROWSTART;
        INVERSE = opt.inverse || INVERSE;
        var g = lcd_spi_unbuf.connect(spi, {
            dc: opt.dc,
            cs: opt.cs,
            height: opt.height,
            width: opt.width,
            colstart: opt.colstart,
            rowstart: opt.rowstart
        });
        LCD_HEIGHT = opt.height;
        LCD_WIDTH = opt.width;
        init(spi, opt.dc, opt.cs, opt.rst, callback);
        g.lcd_on = function(s) {
            if (s) {
                opt.dc.reset();
                spi.write(0x29, opt.cs);
            } else {
                opt.dc.reset();
                spi.write(0x28, opt.cs);
            }
        };
        g.lcd_inv = function(s) {
            if (s) {
                //Display Inversion On
                opt.dc.reset();
                spi.write(0x21, opt.cs);
            } else {
                //Display Inversion off
                opt.dc.reset();
                spi.write(0x20, opt.cs);
            }
        };
        return g;
    } catch (e) {
        console.log("catch:", e);
        return null;
    }
};
```

### Using the module

Once you have a module, you can use it using some code like the below:

```JS
// ST7789V demo
PIN_CS = <LCD_CS_PIN>;
PIN_DC = <LCD_DC_PIN>;
PIN_MOSI = <LCD_MOSI_PIN>;
PIN_SCK = <LCD_SCK_PIN>;
PIN_BL = <LCD_BL_PIN>

demo = () => {
    g.clear().setColor(1,1,1).setFontVector(40);
    g.drawString("Espruino",20,50);
    g.drawString("Rocks",20,95);
    setTimeout(()=>{
      var times = 0;
      y = g.getWidth(); x = g.getHeight();
      g.clear().setFont("6x8",4);
      setInterval(function() {
        g.setColor(Math.random(), Math.random(), Math.random());
        g.fillRect(Math.random() * x, Math.random() * y, Math.random() * x, Math.random() * y);
        g.setColor(0xffff).drawString(times, 0, 0, true);
        times++;}, 250);
    },2E3);
};

SPI1.setup({ sck: PIN_SCK, mosi: PIN_MOSI, baud: 30000000 });

PIN_BL.set();

// init the ST778V lcd and assign the SPI LCD unbufferd driver
g = require("ST7789V-SLU").connect(SPI1, {
        cs: PIN_CS,
        dc: PIN_DC,
        width: 240,
        height: 240,
        colstart: 0,
        rowstart: 80,
        inverse: 1 }, demo);

```
