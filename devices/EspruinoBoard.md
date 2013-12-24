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

* Currently, PWM outputs (via ```analogWrite```) won't work on pin A9
* You can't setWatch on two pins with the same number (eg. A5 and C5) - it's a limitation of the STM32F1
* You can't use ```setWatch``` on B11/C11/D11 and enable ```setDeepSleep```, as A11 is watched in order to wake when USB is plugged in
