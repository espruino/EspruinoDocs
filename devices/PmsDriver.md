<!--- Copyright (c) 2019 Akos Lukacs. See the file LICENSE for copying permission. -->
PMS7003 Particulate matter sensor
=================================

* KEYWORDS: Module, Plantower, PMS7003, Particulate matter sensor, Air quality

A minimal driver for the Plantower PMS 7003 particulate matter sensor with UART output. Might work with other Plantower sensors that use the same protocol. Use the [PmsDriver](/modules/PmsDriver.js) ([About Modules](/Modules)) module for it.


For minimal configuration, you only need to provide power (5V) to the PMS sensor, and it automatically sends measurements. Hook up it's TX pin to an Espruino's serial RX pin and you are good to go!

# Connecting

The connector on the sensor itself is tiny, 2x5 pin, 1.27mm pitch. Soldering does take some time. `Pin1` is the one closest to the corner.
The seller may offer an adapter cable, that's probably easier to use.

## Connect via 10pin connector on the sensor

| Device Pin  | Espruino       |
| ----------- | -------------- |
|  1 (5V)     | 5V             |
|  2 (5V)     | 5V             |
|  3 (GND)    | GND            |
|  4 (GND)    | GND            |
|  5 (Reset)  | -              |
|  6 (N/C)    | -              |
|  7 (RX)     | -              |
|  8 (N/C)    | -              |
|  9 (TX)     | Serial RX pin  |
| 10 (Set)    | -              |

You can leave all other pins unconnected, they have internal pull-ups.
The sensor automaticallly starts sending data, I measured a varying power consumption between 25-50mA.

## Connect via seller supplied cable
Check the seller's description for pinout!


# How to use the module

```
var PMS = require('PmsDriver');

// define the callback that will be called by the module
function onPms(d) {
    if (d.checksumOk) {
        // Checksum OK, show it on a display, send thru MQTT...
        console.log('PMS data: ', d);
    } else {
        // Checksum error, discard it
        console.log('PMS chekcksum ERR!');
    }
}

// Connecting with the Espruino Wifi's Serial1
var pms = PMS.connect(Serial1, B7, onPms);
```
And the sensor sends a new set of data every 800-900ms.

## The response data
```
{
    checksumOk: boolean, // is the checksum OK? Discard if false, other properties will not be present!
    dCF1: PmData,        // CF=1, standard particle
    dAtm: PmData         // Under atmospheric environment
}
```

PmData is an object with the following properties:
```
{
    pm1: number (integer),    // PM 1.0 concentration [μg/m3]
    pm2_5: number (integer),  // PM 2.5 concentration [μg/m3]
    pm10: number (integer)    // PM 10 concentration [μg/m3]
}
```

### Sample output

```
{
  "dCF1": { "pm1": 11, "pm2_5": 20, "pm10": 20 },
  "dAtm": { "pm1": 11, "pm2_5": 20, "pm10": 20 },
  "checksumOk": true
}
```

## Detailed data

The sensor sends more details, but probably not usefull for everybody, so to save some CPU cycles and memory, it's enabled by setting `pms.details` to `true` or if you pass `true` as the fourth paramenter to the `connect()` function. The extended response contains more fields with raw data:
```
    d7_0_3um:   Data 7 indicates the number of particles with diameter beyond 0.3 um in 0.1 L of air.
    d8_0_5um:   Data 8 indicates the number of particles with diameter beyond 0.5 um in 0.1 L of air.
    d9_1_0um:   Data 9 indicates the number of particles with diameter beyond 1.0 um in 0.1 L of air.
    d10_2_5um:  Data 10 indicates the number of particles with diameter beyond 2.5 um in 0.1 L of air.
    d11_5_0um:  Data 11 indicates the number of particles with diameter beyond 5.0 um in 0.1 L of air.
    d12_10_0um: Data 12 indicates the number of particles with diameter beyond 10 um in 0.1 L of air.
```
You can toggle this with setting `pms.details` to `true` or `false`.


### Sample output with details

```
{
  "dCF1": { "pm1": 2, "pm2_5": 3, "pm10": 3 },
  "dAtm": { "pm1": 2, "pm2_5": 3, "pm10": 3 },
  "checksumOk": true,
  "d7_0_3um": 417,
  "d8_0_5um": 132,
  "d9_1_0um": 10,
  "d10_2_5um": 4,
  "d11_5_0um": 0,
  "d12_10_0um": 0
}
```

# Power consumption & power down modes

You can use the `5 (Reset)` or the `10 (Set)` pin to power down the sensor to save energy and the lifetime of the fan and laser diode in the sensor.


| Device Pin  | Espruino                       |
| ----------- | ------------------------------ |
|  1 (5V)     | 5V                             |
|  2 (5V)     | 5V                             |
|  3 (GND)    | GND                            |
|  4 (GND)    | GND                            |
|  5 (Reset)  | Optional, any GPIO or n/c      |
|  6 (N/C)    | -                              |
|  7 (RX)     | -                              |
|  8 (N/C)    | -                              |
|  9 (TX)     | Serial RX pin                  |
| 10 (Set)    | Optional, any GPIO or n/c      |

Measured currents on my unit:

| Mode        | Measured power |
|-------------|----------------|
| "On"        | 25 - 50 mA     |
| "Set" low   | 5 mA           |
| "Reset" low | 1 mA           |
| Both low    | 1.3 mA         |

The "On" current varies in each 800-900ms cycle, but don't have the equipment to measure the average current.

In my tests neither pulling the "Set" or "Reset" pin is low-power enough, so it's probably better to just cut power to the sensor, if you want to save power. The sensor just start sending data again after 2-3 seconds. Probably you should discard the first couple of measurements after power-on.

# UART control
Theoretically you can control the module via UART, but couldn't find an english datasheet describing it.

# Buying
You can buy it from china, for example from Aliexpress: [only the sensor](https://www.aliexpress.com/store/product/PLANTOWER-Laser-PM2-5-DUST-SENSOR-PMS7003-G7-High-precision-laser-dust-concentration-sensor-digital-dust/1725971_32639894148.html) 12-13$, or [with adapter cable](https://www.aliexpress.com/store/product/PLANTOWER-Laser-PM2-5-DUST-SENSOR-PMS7003-G7-Thin-shape-Laser-digital-PM2-5-sensor-Inculd/1725971_32784279004.html) 17-18$.