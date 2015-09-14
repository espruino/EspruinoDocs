<!--- Copyright (c) 2014 Tom Gidden. See the file LICENSE for copying permission. -->
HTU21D Temperature and RH Sensor
=====================

* KEYWORDS: Module,I2C,HTU21D,temperature,humidity

The HTU21D is a low-cost, easy to use, highly accurate, digital humidity and temperature sensor.  Use the [HTU21D](/modules/HTU21D.js) ([About Modules](/Modules)) module for it.

You can wire this up as follows:

| Device Pin | Espruino |
| ---------- | -------- |
| GND / -    | GND      |
| VCC / +    | 3.3      |
| SCL        | B6       |
| SDA        | B7       |

**Note:** On Adafruit's board, don't connect the 3.3v line and instead connect VCC on thb breakout board to Espruino's 3.3v [as discussed here](https://learn.adafruit.com/adafruit-htu21d-f-temperature-humidity-sensor/wiring-and-test)

Basic usage:

```JavaScript
  I2C1.setup({sda:B7, scl:B6});

  var htu = require('HTU21D').connect(I2C1);

  // Check the humidity every two seconds
  setInterval(function () {
    htu.getHumidity(
      function (x) { console.log("RH = "+x+"%"); }
    );
  }, 2000);

  // Stagger the temperature reading by one second, to prevent conflict
  setTimeout(function () {

    // Check the temperature every two seconds
    setInterval(function () {
      htu.getTemperature(
        function (x) { console.log("T = "+x+" oC"); }
      );
    }, 2000);
  }, 1000);
```

Buying
-----

* [AdaFruit breakout board](https://www.adafruit.com/products/1899)
