<!--- Copyright (c) 2016 ST Microelectronics. See the file LICENSE for copying permission. -->
LPS25HB pressure sensor
=======================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/LPS25HB. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,I2C,LPS25HB,IKS01A1,ST,pressure,sensor

LPS25HB is a pressure sensor that can be used by i2c. This sensor is available on ST X-NUCLEO-IKS01A1 expansion board.
datasheet is available on ST web site : 
     http://www.st.com/content/ccc/resource/technical/document/datasheet/9a/4c/aa/72/1f/45/4e/24/DM00141379.pdf/files/DM00141379.pdf/jcr:content/translations/en.DM00141379.pdf

Use the [LPS25HB](/modules/LPS25HB.js) ([About Modules](/Modules)) module for it.

You can wire this up as follows:

| Device Pin | Espruino Pico |
| ---------- | ------------- |
| D15 (SCL)  | B6            |
| D14 (SDA)  | B7            |
| GND        | GND           |
| +5V        | VBAT          |
| +3V3       | 3.3           |

**Note:** To avoid links, you can use the ArduinoPico adaptor. In this case, check the pins to use for SPI1, it should be B8 and B9.

How to use module:
------------------

```
I2C1.setup({scl:B6,sda:B7});
var pressure = require("LPS25HB").connect(I2C1);
pressure.getPressure(print);
```

Besides the I2C connection, connect() takes an optional argument to provide debug information :
```
I2C1.setup({scl:B6,sda:B7});
var pressure = require("LPS25HB").connect(I2C1, 1);
pressure.getPressure(print);
```

Buying:
-------

Shield can be purchased from many places:
* http://www.st.com/content/st_com/en/products/ecosystems/stm32-open-development-environment/stm32-nucleo-expansion-boards/stm32-ode-sense-hw/x-nucleo-iks01a1.html
* http://fr.farnell.com/stmicroelectronics/x-nucleo-iks01a1/expansion-brd-mems-sensor-stm32/dp/2475489

