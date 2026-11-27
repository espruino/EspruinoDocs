<!--- Copyright (c) 2016 Joe McCarty. See the file LICENSE for copying permission. -->
LSM9DS1 Accelerometer
=====================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/LSM9DS1. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,IMU,I2C,Sensor,Gyro,Accelerometer,Magnetometer

## Description

* 3 acceleration, 3 angular rate and, 3 magnetic field channels
* ±2 / ±4/ ±8 / ±16 g linear acceleration full scale
* ±4 / ±8/ ±12 / ±16 Gauss magnetic full scale
* ±245 / ±500 / ±2000 dps angular rate full scale
* 16-bit data output
* SPI / I2C serial interfaces
* Analog supply voltage 1.9 V to 3.6 V
* Die Temperature

[LSM9DS1 Datasheet](http://www.st.com/content/ccc/resource/technical/document/datasheet/1e/3f/2a/d6/25/eb/48/46/DM00103319.pdf/files/DM00103319.pdf/jcr:content/translations/en.DM00103319.pdf)

## Module Overview

The module [LSM9DS1.js](LSM9DS1.js) provides support for LSM9DS1.

The I2C interface bus for the LSM9DS1 uses two different bus addresses. The `xgAddress` for the gyro and accelerometer defaults to `0x6B`. The `mAddress` for the magnetometer defaults to `0x1E`. The Sparkfun part uses these default addresses, but can be modified to use the alternatives of 0x1C and 0x6A.


## Software

You can use the module as follows:

```JS
var W;
function start(){
  I2C1.setup({ scl:..., sda:...});
  var xgAddress = 0x6B; // Would be 0x1C if SDO_M is LOW
  var mAddress = 0x1e; // Would be 0x6A if SDO_AG is LOW
  W = require("LSM9DS1").connect(I2C1, xgAddress, mAddress);
  W.run(); //Get it started
  // you can set W.mscale/W.gyroscale/W.accelscale with saved calibration data

  // use magnetometer offset in program not the ones on the chip
  W.magOffset(0,0);
  W.magOffset(1,0);
  W.magOffset(2,0);
  // once the run() function has executed the scale and output data rate (ODR) can be changed using
  W.setGyroScale(1);//0,1,2
  W.setAccelScale(1);//0,1,2,3
  W.setMagScale(1);//0,1,2,3
  // use autoCalc to control display values
  W.autoCalc=2;//0=raw,1=raw-offset,2=calibrated
  W.setGyroODR(6);//0,1,2,3,4,5,6
  W.setAccelODR(6);//0,1,2,3,4,5,6
  W.setMagODR(7);//0,1,2,3,4,5,6,7
  // you can then call readall to get the data
  W.readall(W);
}

function readall(W){
  W.readAccel();
  W.readGyro();
  W.readMag();
  W.readTemp();

  console.log("Acceleration,     ",W.a[0],',',W.a[1],',',W.a[2]);
  console.log("Gyro,             ",W.g[0],',',W.g[1],',',W.g[2]);
  console.log("Magnetometer,     ",W.m[0],',',W.m[1],',',W.m[2]);
  console.log("Temperature ", W.temperature/10);
  var pirate = 180.0/Math.PI;
  console.log("Level", pirate*Math.atan2(W.a[0],W.a[2]),pirate*Math.atan2(W.a[1],W.a[2]));
  var heading = pirate*Math.atan2(-W.m[0],W.m[1]); // if level
  if (heading<0) heading+=360;
  console.log("heading", heading);
}

start();
```

### Calibration Structures

* The `scale`: element is the sensor scale.
* The `regvalue`: element is used to write to the device and should not be modified.
* The `res`: element is used to convert counts to engineering units for each axis of the sensor in X, Y, and Z order.
* The `off`: element is the zero offset for each axis of the sensor

```JS
/** 'mScale indexes mscale, used to select magnetometer scale' */
M.mScale=0;
M.mscale=[
  {scale:4,regvalue:0,
   mres:[0.000122,0.000122,0.000122],
   moff:[0,0,0] //zero offset in counts
  },
  {scale:8,regvalue:32,
   mres:[0.000244,0.000244,0.000244],
   moff:[0,0,0]
  },
  {scale:12,regvalue:64,
   mres:[0.000366,0.000366,0.000366],
   moff:[0,0,0]
  },
  {scale:16,regvalue:96,
   mres:[0.000488,0.000488,0.000488],
   moff:[0,0,0]
  },
];

/** 'gScale indexes gyroscale, used to select gyroscope scale' */
M.gScale=0;
M.gyroscale=[
  {scale:245,regvalue:0,
   gres:[245/32768.0,245/32768.0,245/32768.0],
   goff:[0,0,0] //zero offset
  },
  {scale:500,regvalue:8,
   gres:[500/32768.0,500/32768.0,500/32768.0],
   goff:[0,0,0]
  },
  {scale:2000,regvalue:0x18,
   gres:[2000/32768.0,2000/32768.0,2000/32768.0],
   goff:[0,0,0]
  },
];

/** 'aScale indexes accelscale, used to select accelerometer scale' */
M.aScale=0;
M.accelscale=[
  {scale:2,regvalue:0,
   ares:[2/32768.0,2/32768.0,2/32768.0],
   aoff:[0,0,0]
  },
  {scale:4,regvalue:16,
   ares:[4/32768.0,4/32768.0,4/32768.0],
   aoff:[0,0,0]
  },
  {scale:8,regvalue:24,
   ares:[8/32768.0,8/32768.0,8/32768.0],
   aoff:[0,0,0]
  },
  {scale:16,regvalue:8,
   ares:[16/32768.0,16/32768.0,16/32768.0],
   aoff:[0,0,0]
  },
];
```

## Buying

* [LSM9DS1 at Sparkfun](https://www.sparkfun.com/products/13944)
* [LSM9DS1 at Adafruit](https://www.adafruit.com/products/2021)
