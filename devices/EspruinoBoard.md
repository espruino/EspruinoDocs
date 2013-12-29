<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Espruino Board
=============

* KEYWORDS: Espruino,Board,PCB

The Espruino board is the officially Supported board - it comes pre-programmed with Espruino, so you just plug it in and it works. You can [[Order]] them from [Espruino.com](http://www.espruino.com).

You can see the [available pins and peripherals here](http://www.espruino.com/ReferenceESPRUINOBOARD)

Features
-------

* Less than half the size of a business card ( 54mm x 41mm )
* STM32 32-bit 72MHz ARM Cortex M3 CPU
* 256KB of Flash memory, 48KB of RAM
* Micro USB connector
* Input Voltage Range of 3.6v to 15v
* Battery connector (JST PHR-2 2 Pin)
* Built-in SD card connector
* Red, Green and Blue LEDs
* Pads to allow HC-05 Bluetooth modules to be added
* Extremely low profile
* 0.1" Pin spacing
* 44 GPIO Pins, which can handle: 26 PWM Pins, 16 ADC Pins, 3 USARTs, 2 SPI, 2 I2C and 2 DACs
* Prototype area which can be used in many different configurations, for example: Servo Headers, Up to 14x 500mA outputs, 2x .NET Gadgeteer connectors, or NRF24L01+ wireless transceiver modules

Layout
-----

[See available pins and peripherals](http://www.espruino.com/ReferenceESPRUINOBOARD)

...

Power
----

Espruino has 3 ways of powering it - a JST PHR-2 battery connector, Micro USB, or pin headers.

...

Connecting
---------

### Batteries
You can usually buy batteries with the 2 pin female JST (PHR-2) connector ready-soldered. [Olimex](https://www.olimex.com/Products/Power/) is a good source. Otherwise you can buy JST connectors from places like Farnell ([housing](http://uk.farnell.com/jst-japan-solderless-terminals/phr-2/housing-2way-2mm/dp/3616186?Ntt=361-6186) and [pins](http://uk.farnell.com/jst-japan-solderless-terminals/sph-002t-p0-5s/contact-loose-piece-0-05-0-22mm/dp/3617210?Ntt=361-7210)).

### Servos
...

### Motor Drivers
...

### Bluetooth
Espruino is designed for HC-05 modules. Have a look at the [[Bluetooth]] page for more information/

Known Problems
------------

* Currently, PWM outputs (via ```analogWrite```) won't work on pin A9 ([bug](https://github.com/espruino/Espruino/issues/142))
* You can't setWatch on two pins with the same number (eg. A5 and C5) - it's a limitation of the STM32F1 
* You can't use ```setWatch``` on B11/C11/D11 and enable ```setDeepSleep```, as A11 is watched in order to wake when USB is plugged in
* USB 'loses' characters if you send 60 or more at once ([bug](https://github.com/espruino/Espruino/issues/94))

Troubleshooting
-------------

### My board doesn't appear as a USB Serial port in Windows XP

Windows XP doesn't come with the correct drivers preinstalled. You'll need to install [ST's VCP drivers](http://www.st.com/web/en/catalog/tools/PF257938) first. 

### I tried to reflash my Espruino Board, and now it won't work

Just try reflashing again (by holding down BTN1 when RST is released, you should always be able to get the glowing blue LED). As Espruino itself doesn't work, the IDE won't know what type of board it is supposed to flash so you'll have to look up the firmware manually. Just head to [the Espruino binaries site](http://www.espruino.com/binaries/?C=M;O=D) and look for the most recent (nearest the top) file named ```espruino_1v##_espruino_1r#.bin``` where ```1r#``` is the revision number written on the back of your Espruino board. Copy the link to the file, and paste it into the Espruino Web IDE.

### Reflashing always fails, or sometimes board locks up while sending code

This seems to be a problem on some Windows PCs. Try using a different USB port... If you were using a USB1/2 port (black), try using a blue USB3 port instead (or vice versa). Unfortunately you may have to change computers in order to find one that works. Macs and Linux computers seem to handle USB much more reliably. We're working on a solution to this though ([bug](https://github.com/espruino/Espruino/issues/94)).

Advanced Reflashing
-----------------

If you're developing and you want to completely rewrite the bootloader, you can wire up the Espruino board to a USB-TTL convertor as follows:

| USB-TTL | Name | Espruino Pin |
|----------------|------|--------------|
| 5V | 5V | VBAT |
| GND | GND      | GND |
| TX | USART1_RX        | A10 |
| RX | USART1_TX      | A9 |
| - | BOOT0 - 3.3V       | BOOT0 | 
| GND | BOOT1 - 0V        | B2 |

Note: BOOT0 is in a group of two pins (RST and BOOT0) in the middle of the top edge of the board.

Then, dab reset to enter bootloader mode and use the [STM32 flasher utility](https://github.com/espruino/Espruino/blob/master/scripts/stm32loader.py) to flash the STM32 chip.
