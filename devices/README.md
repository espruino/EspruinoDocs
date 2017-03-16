# Two Modules for LSM9DS1,
## thinLSM9DS1.js and calibrateLSM9DS1.js
<!--- Copyright (c) 2016 Joe McCarty. See the file LICENSE for copying permission. -->

* KEYWORDS: Module,IMU,I2C,Gyro,Accelerometer,Magnetometer

### LSM9DS1 Description
* 3 acceleration, 3 angular rate and, 3 magnetic field channels
* ±2/ ±4/ ±8/ ±16 g linear acceleration full scale
* ±4/ ±8/ ±12/ ±16 gauss magnetic full scale
* ±245/ ±500/ ±2000 dps angular rate full scale
* 16-bit data output
* SPI / I2C serial interfaces
* Analog supply voltage 1.9 V to 3.6 V
* Die Temperature
* Sources:..

  [LSM9DS1 at Sparkfun](https://www.sparkfun.com/products/13944)

  [LSM9DS1 at Adafruit](https://www.adafruit.com/products/2021)


* [LSM9DS1 Datasheet](http://www.st.com/content/ccc/resource/technical/document/datasheet/1e/3f/2a/d6/25/eb/48/46/DM00103319.pdf/files/DM00103319.pdf/jcr:content/translations/en.DM00103319.pdf)

Note that figure 1 of the datasheet is a bit confusing. Note the dot on the picture of the chip for each axis.

### Module Overview
The module calibrateLSM9DS1.js adds calibration functions to the 
module thinLSM9DS1.js 
The program savecal.js can be used to alter values in the calibration stucture save in ROM.
The program AmenucalslimLSM9DS1.js should be used first to establish the zero offsets for each sensor, axis and scale.
The program AmenutestSlimLSM9DS1.js is similar but omits the calibration functions and menus.
These programs and modules were created and tested using the Sparkfun breakout board.

### Connecting the LSM9DS1 to a Pico using I2C

#### You can wire this up as follows:

| Device Pin | Espruino |
| ---------- | -------- |
| 1 (GND)    | GND      |
| 2 (VCC)    | 3.3      |
| 3 (SDA)  | B4       |
| 4 (SCLT)| A8       |

#### Software Configuration
1. The program savecal.js is used to write the calibaration structure to ROM on the Pico. It uses the module FlashEEPROM.js and writes the sturcture to a ROM page defined by: var CalPage=99; The CalPage can be edited if needed
2. The programs AmenucalslimLSM9DS1.js and 
AmenutestSlimLSM9DS1.js can be configured to use a different CalPage, I2C, and pins for the SCL and SDA. The I2C interface bus for the LSM9DS1 uses two different bus addresses. The xgAddress for the gyro and accelerometer defaults to 0x6B. The mAddress for the magnetometer defaults to 0x1E. The Sparkfun part uses these default addresses, but can be modified to use the alternatives of 0x1C and 0x6A.
3. The program savecal.js can be used to write the calibration structure to ROM. The AmenucalslimLSM9DS1.js will also create the structure when the calibration save option is selected. Savecal.js may be used to adjust the scale factors for each axis manually.
4. Calibration (sets zero offsets for sensors)

   1. Load and run the AmenucalslimLSM9DS1.js program
   2. Place the LSM9DS1 board on a level surface (X and Y axis level), and select the Calibrate Gyro and Accelerometer option.
   3. To calibrate the magnetometer, I found it useful to tape the device to a wooden cube and use a wooden fence to ensure that the device points North and South as different axis are pointed for calibration. The menu option Calibrate Magnetometer will call out six steps starting with pointing the X-axis North.
   4. Save the calibrations by selecting menu option Save calibrations to ROM.
   5. The menu option Read and Display Data will do that until the return key is pressed.

5. Some caution is needed with these menu programs. They make use of the USB port on the Pico. This disconnects the Espruino console from the USB port and can BRICK the Pico if a proper exit that restores the connection. The programs as written provide three exit paths: the Pico pushbutton, a control-C, and "E" in the menus. If you edit these programs please confirm that the exit methods work before performing a save() to save the program to ROM. When loaded the left WebIDE pane will ask you to startPgm() or save(). Use the startPgm() option until you are satified that the exits work.


#### How to use these modules:
calibrateLSM9DS1.js requires thinLSM9DS1.js 

```
require("slimLSM9DS1");
W=require("calibrateLSM9DS1").connect(I2C3,xgAddress,mAddress);
W.run();//Get it started
```
Both menu programs, and savecal.js  also require FlashEEPROM

```
var CalPage=99; //ROM page where calibration is saved

//Configuration
//The I2C pins that the LSM9D01 is connected to
//PICO I2C pins
//IC1  sda=B7  scl=B6
//IC1  sda=B9  scl=B8  shim pins
//IC3  sda=B4  scl=A8
//IC2  sda=B3  scl=B10
var W;
function start(){
//  console.log("start");
 I2C3.setup({ scl :A8, sda: B4} );
//console.log(I2C3);
var xgAddress= 0x6B;// Would be 0x1C if SDO_M is LOW
var mAddress= 0x1e;// Would be 0x6A if SDO_AG is LOW 
 W =require("slimLSM9DS1").connect(I2C3,xgAddress,mAddress);
W.run();//Get it started
//
//load the zero offsets obtained from calibration program
var f = new (require("FlashEEPROM"))();
var arr;
var mmmag=f.read(CalPage);
if (mmmag === undefined) {
  console.log("No calibration found");
} else {
 console.log("Calibration is defined");
 var mmag=E.toString(mmmag);
 arr = mmag.split(";");
W.mscale=JSON.parse(arr[0]);
W.gyroscale=JSON.parse(arr[1]);
W.accelscale=JSON.parse(arr[2]);
}
//use magnetometer offset in program not the ones on the chip
W.magOffset(0,0);
W.magOffset(1,0);
W.magOffset(2,0);
// once the run() function has executed the scale and output data rate (ODR) can be
// changed using
W.setGyroScale(1);//0,1,2
W.setAccelScale(1);//0,1,2,3
W.setMagScale(1);//0,1,2,3
//use autoCalc to control display values
W.autoCalc=2;//0=raw,1=raw-offset,2=calibrated
W.setGyroODR(6);//0,1,2,3,4,5,6
W.setAccelODR(6);//0,1,2,3,4,5,6
W.setMagODR(7);//0,1,2,3,4,5,6,7
// can put readall in a loop
W.readall(W);
}//end start

function readall(W){
W.readAccel();
W.readGyro();
W.readMag();ma=MA.getAvg(W.m);
W.readTemp();

console.log("Acceleration,     ",W.a[0],',',W.a[1],',',W.a[2]);
console.log("Gyro,             ",W.g[0],',',W.g[1],',',W.g[2]);
console.log("Magnetometer,     ",W.m[0],',',W.m[1],',',W.m[2]);
console.log("Avg Magnetometer  ",ma[0],',',ma[1],',',ma[2]);
console.log("Temperature ",W.temperature/10);
var pirate=180.0/Math.PI;
console.log("Level", pirate*Math.atan2(W.a[0],W.a[2]),pirate*Math.atan2(W.a[1],W.a[2]));
var heading; // if level
heading=pirate*Math.atan2(-W.m[0],W.m[1]);
if(heading <0) heading+=360;
console.log("heading",heading);
}//end readall

function startPgm(){
setTimeout(function () {
 start();
();
}, 1000);
}//end startPgm
startPgm();
```

#### The Calibration Structures:
The scale: element is the sensor scale.
The regvalue: element is used to write to the device and should not be modified.
The res: element is used to convert counts to engineering units for each axis of the sensor in X, Y, and Z order.
The off: element is the zero offset for each axis of the sensor

```
/** 'mScale indexes mscale, used to select magnetometer scale' */
this.mScale=0;
this.mscale=[ 
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
  this.gScale=0;
  this.gyroscale=[
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
this.aScale=0;
this.accelscale=[
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