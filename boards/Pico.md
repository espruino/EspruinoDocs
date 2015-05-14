<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Espruino Pico
============

![Espruino Pico](angled.jpg)

Features
-------

* 33mm x 15mm (1.3 x 0.6 inch)
* 22 GPIO pins : 9 Analogs inputs, 21 PWM, 2 Serial, 3 SPI, 3 I2C
* All GPIO is 5 volt tolerant (Arduino compatible)
* 2 rows of 9 0.1" pins, with a third 0.05" row of 8 pins on the end
* On-board USB Type A connector
* Two on-board LEDs and one button.
* STM32F401CDU6 CPU - ARM Cortex M4, 384kb flash, 96kb RAM
* On-board 3.3v 250mA voltage regulator, accepts voltages from 3.5v to 16v
* Current draw in sleep: <0.05mA - over 2.5 years on a 2500mAh battery
* On-board FET can be used to drive high-current outputs

Pinout
------

* APPEND_PINOUT: PICO_R1_3

<span style="color: red">**Note:** There is no built-in fuse on the Espruino Pico. You should check that your circuit does not contain shorts with a volt meter *before you plug it into USB*, or you may damage your board.</span>

Tutorials
--------

Tutorials using the Pico Board:

* APPEND_USES: Pico

Layout
-----

![Espruino Pico diagram](diagram.png)

| Name | Function |
|------|----------|
| USB  | Printed Type A USB connector plugs straight into standard socket |
| LEDs | Red and Green LEDs accessible using the built-in variables LED1 and LED2 |
| Button | Button accessible using the built-in variable BTN |
| SWD Debug | (Advanced) SWD debug connections for firmware debugging |
| BOOT0 Jumper | (Advanced) Short this jumper out to connect the button to BOOT0. Plugging the device in with the button pressed will the cause the DFU bootloader to be started, allowing you to change absolutely all of Espruino's firmware. |
| JST Battery | Pads for a surface mount JST battery connector (see [below](#battery)) |
| Micro/Mini USB | Under the white silkscreen are pads for Mini USB and Micro USB sockets (see [below](#usb)) |
| FET Jumper | Shorting this jumper allows the PFET to be controlled from pin B0 (see [below](#power)) |

**Note:** The two jumpers can be shorted out just by scribbling over them with an HB pencil.

<a name="battery"></a>Battery
-------

Espruino Pico contains the circuitry needed to power itself from a battery without the voltage drop of a diode. This means that it will happily run off of normal 3.7v LiPo batteries.

In order to connect to a battery, you can use either the pins marked `Bat` and `GND` (on opposite sides of the board, nearest the USB connector), or you can solder a JST S2B-PH-SM4-TB battery connector onto the underside of the board. These (or clones of them) are readily available:

* Octopart [list of distributors](https://octopart.com/s2b-ph-sm4-tb%28lf%29%28sn%29-jst-248913)
* [Farnell](http://uk.farnell.com/jst-japan-solderless-terminals/s2b-ph-sm4-tb-lf-sn/connector-header-smt-r-a-2mm-2way/dp/9492615)
* [RS](http://uk.rs-online.com/web/p/products/6881353/)

<a name="usb"></a>Alternate USB connectors
-------------------------

![Micro and Mini USB](microusb.jpg)

On the rear of the Pico Board under the while block of silkscreen, there are pads for both Micro and Mini USB connectors. To use these, *carefully* scratch off the silkscreen until you have copper tracks, and solder on the connector. 

The connectors you need are very standard parts. While some parts are listed below, many other parts from many different manufacturers would work perfectly well.


### Mini-B USB

5 pin, 4 pad surface mount

* [Seeed OPL (3400020P1)](http://www.seeedstudio.com/wiki/images/a/a9/3400020P1.pdf)
* [Digi-Key](http://www.digikey.co.uk/product-detail/en/DX2R005HN2E700/670-1190-1-ND/1283605)

### Micro-B USB 

5 pin, 2 pad surface mount

* [Seeed OPL (3400150P1)](http://www.seeedstudio.com/wiki/images/a/aa/3400150P1.pdf)
* Octopart [list of distributors](https://octopart.com/zx62-b-5pa%2811%29-hirose-42422030)
* [Farnell](http://uk.farnell.com/hirose-hrs/zx62-b-5pa-11/micro-usb-b-type-receptacle/dp/1645325)
* [RS](http://uk.rs-online.com/web/p/products/6850965/?cm_mmc=aff-_-uk-_-octopart-_-6850965)
* [Mouser](http://www.mouser.com/ProductDetail/Hirose-Electric/ZX62-B-5PA11/?qs=%2fha2pyFadujrkQEnlOn9YFM9AS87Cj2wDCLgsuo%252bP0h1%252bvKUCD3W%252bw%3d%3d)


<a name="power"></a>Power, and the FET/B0 Jumper
-------------

| Pico Board | Quick Reference | Circuit Diagram (below) | Description |
|-----------|-----------|-------|----------|
| USB Plug | | VUSB  | USB voltage in |
| VCC      | 5V | 5V | USB voltage output (minus diode drop) if connected, Battery voltage if not |
| Bat (also pad marked `+`) | BAT_IN | VBAT | Battery voltage input (connect battery here) |
| 3.3V     | VDD     | VDD | Regulated 3.3v output (~200mA continuous) |

Currently the labelling for the Pico's pins is quite confusing (it's different on the circuit diagram, PCB silkscreen, and the Pinout diagram). Hopefully the table above will help to clear it up slightly.

![Power circuitry](power.png)

Espruino's power circuitry is as above. When USB is connected the device is powered through a Schottky diode with 0.3v voltage drop. However when USB is disconnected then Espruino can be powered from a battery with no voltage drop. This is done by turning on the PFET Q1.

However, the `FET/B0` Jumper allows you to connect the PFET's gate to pin B0. This allows you to do several things:

* Check whether the device is running from USB or Battery (`digitalRead(B0)?"USB":"Bat"`)
* When running from USB, use the `Bat` Pin as a powered 5V output.
* When running from USB with a battery connected, charge the battery.

This last reason is why the jumper is *disconnected by default*. It could be dangerous to charge a LiPo battery this way unless your software also monitor's the battery's charge.

Once the `FET/B0` Jumper is shorted, the following commands will work:

```
digitalWrite(B0,0); // Turn on the 'Bat' output fully
digitalWrite(B0,1); // Partially turn on the 'Bat' output (this produces 3.3v on the FET, meaning it has just 1.4v between Gate and Drain)
digitalRead(B0); // turn off the output (also check if USB powered)
pinMode(B0, "af_opendrain");analogWrite(B0, 0.5, {freq:100}); // output a 100Hz 50% duty cycle square wave
```

The jumper can be shorted by scribbling over it with a normal HB pencil. See the [[Pico FET Output]] tutorial for an example.

<a name="signup"></a>Buying
------

We're currently sold out and are waiting for a new batch of boards to be produced.

If you're interested then please add your email address below, and we'll let you know when the boards are in distributors.

<iframe frameborder="0" height="500" marginheight="0" marginwidth="0" src="https://docs.google.com/forms/d/1kCVo9aPfLjNR0VJ0WSYsfSwSCY3pttf7axKsMhnpn64/viewform?embedded=true" width="600">Loading...</iframe>

