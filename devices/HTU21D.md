<!--- Copyright (c) 2014 Tom Gidden, 2015 Luwar. See the file LICENSE for copying permission. -->
HTU21D Temperature and RH Sensor
================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/HTU21D. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,I2C,HTU21D,temperature,humidity

The HTU21D is a low-cost, easy to use, highly accurate, digital humidity and temperature sensor.  Use the [HTU21D](/modules/HTU21D.js) ([About Modules](/Modules)) module for it.

You can wire this up as follows:

| Device Pin | Espruino |
| ---------- | -------- |
| GND / -    | GND      |
| VCC / +    | 3.3      |
| SCL        | B6       |
| SDA        | B7       |

**Note:**
- On Adafruit's board, don't connect the 3.3v line and instead connect VCC on the breakout board to Espruino's 3.3v → https://learn.adafruit.com/adafruit-htu21d-f-temperature-humidity-sensor/wiring-and-test
- On some Sparkfun's board, the pull up resistors are not connected by default. You need to bridge the solder jumper on the board → https://learn.sparkfun.com/tutorials/htu21d-humidity-sensor-hookup-guide

Use cases
---------

Read the temperature and humidity and wait until the measurement is completed. This blocks the I2C bus and the cpu for at most 50ms:

```JavaScript
I2C1.setup( {scl: B8, sda: B9 } );
var htu = require('HTU21D').connect( I2C1 );
console.log( "Temperature = " + htu.readTemperature() + " °C" );
console.log( "Humidity    = " + htu.readHumidity() + " %" );
```

If you want to work asynchronously then you have to use the getTemperature() and getHumidity().

```JavaScript
I2C1.setup( {scl: B8, sda: B9 } );
var htu = require('HTU21D').connect( I2C1 );

var temperature;
var humidity;

function startMeasuring() {
  htu.getTemperature( function(temp) {
    htu.getHumidity( function(hum) {
      temperature = temp;
      humidity = hum;
      startMeasuring(); // start the next measuring cycle
    });
  } );
}
startMeasuring();

// It's forbidden to call a HTU21D method while measuring asynchronously!
// e.g. htu.readTemperature() would here throw an exception.

// After 50 ms the temperature and humidity are always up-to-date.
setInterval( function() {
  console.log( "T = " + temperature.toFixed(2) + " °C, " +
               "RH = " + humidity.toFixed(2) + " %" );
}, 100 );
```

**Note** It's important to make sure that the sensor will not be used during an asynchronous measuring.

This is an incorrect usage:

```JavaScript
I2C1.setup( {scl: B8, sda: B9, bitrate: 50000 } );
var htu = require('HTU21D').connect( I2C1 );

htu.getTemperature( function (temp) { console.log(temp); } );

// This will throw an error "Sensor is measuring" !
htu.getHumidity( function( humidity ) {
} );
```

The humidity is slightly temperature dependent but you can compensate this dependency if you have the current temperature:

```JavaScript
I2C1.setup( {scl: B8, sda: B9 } );
var htu = require('HTU21D').connect( I2C1 );
var temp = htu.readTemperature();
var humidity = htu.readHumidity();
humdity = htu.getCompensatedHumidity( humidity, temp ); // improve accuracy
console.log("Temperature = " + temp.toFixed(2) + " °C" );
console.log("Humidity    = " + humidity.toFixed(2) + " %" );
console.log("Dew point   = " + htu.getDewPoint(temp,humidity).toFixed(2) + " °C");
```

Sometime it is not required to work with the highest resolution. With a lower resolution the
measuring time is decreasing and so the power consumption:

```JavaScript
I2C1.setup( {scl: B8, sda: B9 } );
var htu = require('HTU21D').connect( I2C1 );

// 12 instead of 14 bits but only 13 ms instead of 50 ms
htu.setResolution( htu.RH_8_BITS_TEMP_12_BITS );

// This call takes only 13 ms instead of 50 ms.
var temperature = htu.readTemperature();
console.log( "T = " + temperature );
```

Possible resolutions are:

|                         | RH      | Measuring Time | Temperature | Measuring Time |
| ----------------------- | ------- | -------------- | ----------- | -------------- |
| RH_12_BITS_TEMP_14_BITS | 12 bits | max. 16 ms     | 14 bits     | 50 ms          |
| RH_8_BITS_TEMP_12_BITS  |  8 bits | max.  3 ms     | 12 bits     | 13 ms          |
| RH_10_BITS_TEMP_13_BITS | 10 bits | max.  5 ms     | 13 bits     | 25 ms          |
| RH_11_BITS_TEMP_11_BITS | 11 bits | max.  8 ms     | 11 bits     |  7 ms          |

Every HTU21D sensor has a unique chip identification number. Maybe you wants to tag your delivered devices?  

```JavaScript
I2C1.setup( {scl: B8, sda: B9 } );
var htu = require('HTU21D').connect( I2C1 );
console.log( "0x" + htu.getSerialNumber().toString(16) ); // → e.g. 0x2ee38a18
```

The internal heater can be used for checking the operation and for preventing condensation:

```JavaScript
I2C1.setup( {scl: B8, sda: B9 } );
var htu = require('HTU21D').connect( I2C1 );

console.log( "Heater = " + htu.isHeaterOn() ); // → false
htu.setHeaterOn( true );
console.log( "Heater = " + htu.isHeaterOn() ); // → true
htu.setHeaterOn( false );
console.log( "Heater = " + htu.isHeaterOn() ); // → false
```

You can reboot the sensor to initial state (maximal resolution, heater off) with a soft reset:

```JavaScript
htu.setHeaterOn( true );
htu.setResolution( htu.RH_8_BITS_TEMP_12_BITS );

htu.softReset();

console.log( "Heater = " + htu.isHeaterOn() ); // → false
console.log( "max. resolution = " + (htu.getResolution() === htu.RH_8_BITS_TEMP_12_BITS ) );  // → false
console.log( "max. resolution = " + (htu.getResolution() === htu.RH_12_BITS_TEMP_14_BITS ) ); // → true
```

The sensor operates from 1.5V to 3.6V. Its possible
to detect a voltage supply less than 2.25V:

```JavaScript
console.log( "End of battery = " + htu.isEndOfBattery() ); // → false
```

Troubleshooting
---------------

**The humidity returned is -6**

The HTU21D datasheet states that this response (equivalent to an actual reading of 0 from the sensor)
means that the humidity sensor is open circuit (eg. broken). The temperature will probably still
work but you'll need to get a new sensor if you need to measure humidity.

Buying
-----

* [AdaFruit breakout board](https://www.adafruit.com/products/1899)
* [SparkFun Breakout](https://www.sparkfun.com/products/12064)
* .. or cheaper from EBay

Links
-----
* Manufacturer MEAS http://www.meas-spec.com/product/humidity/HTU21D.aspx
* Datasheet http://www.meas-spec.com/downloads/HTU21D.pdf
* HTU2X Serial Number Reading http://www.meas-spec.com/downloads/HTU2X_Serial_Number_Reading.pdf
