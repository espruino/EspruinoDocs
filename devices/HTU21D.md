<!--- Copyright (c) 2014 Tom Gidden. See the file LICENSE for copying permission. -->
HTU21D Temperature and RH Sensor
=====================

* KEYWORDS: Module,I2C,HTU21D,temperature,humidity

The HTU21D is a low-cost, easy to use, highly accurate, digital humidity and temperature sensor.  Use the [HTU21D](/modules/HTU21D.js) ([About Modules](/Modules)) module for it.

You can wire this up as follows:

| Device Pin | Espruino |
| ---------- | -------- |
| GND / -    | GND      |
| Vcc / +    | 3.3      |
| CL         | B6       |
| DA         | B7       |

Basic usage:

```JavaScript
  I2C1.setup({sda:B7, scl:B6});

  var htu = require('HTU21D').connect(I2C1);

  // Check the humidity every two seconds
  setInterval(function () {
    htu.getHumidity(
      function (x) { print ("RH = "+x+"%"); }
    );
  }, 2000);

  // Stagger the temperature reading by one second, to prevent conflict
  setTimeout(function () {

    // Check the temperature every two seconds
    setInterval(function () {
      htu.getTemperature(
        function (x) { print ("T = "+x+" oC"); }
      );
    }, 2000);
  }, 1000);
```