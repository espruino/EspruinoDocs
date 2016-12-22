//AmenuCalSlimLSM9DS1.js
//21 Dec 2016
/* Copyright (c) 2016 Joe McCarty. See the file LICENSE for copying permission. */

var CalPage=99; //ROM page where calibration is saved
//////////////////////////////////////////////////////////////
// CAUTION CAUTION CAUTION/////
//////////////////////////////////////////////////////////////

//How not to brick a PICO when reassigning the console
// away from the USB port to do menu programs

//Setup the button to light the LED and reset the Pico
//Always include this code when a save() and oninit() functions are // used.
setWatch(function(e) {
  digitalWrite(LED1, e.state);
  USB.setConsole();
  reset();
}, BTN, { repeat: true });


E.on('init', function() {
 console.log("Hello");
 startPgm();
});

//input cmd from terminal,send it to parsecmd()
USB.on('data', function (data) {
 var i;
  sst+=data;
// look for control c in input stream
  if(sst.indexOf(String.fromCharCode(3))>-1){
  USB.setConsole();
  reset();
  }//   console.log("control C seen");
  USB.print(data);
  if(sst.length>-1)
  if(sst.charAt(sst.length-1)==="\r")selectparser();
//  if(sst.charAt(0)==="\r")selectparser();
});

//Espruino replies here
LoopbackA.on('data',function(data){
  USB.print(data); //sending data to terminal
});


console.log("In left pane type startPgm();");
console.log("Use startPgm() first and make sure you can exit back to the console");
console.log("Once you are sure that a proper exit works then type  save();");


var menulevel=0;
function startPgm(){
setTimeout(function () {
 start();
 LoopbackB.setConsole();
 mainmenu();
}, 1000);
}//end startPgm

var sst="";

function selectparser(){
 switch(menulevel){
   case 0:
    parsemainmenu();
   break;
   case 1:
    parsegyromenu();
   break;
   case 2:
    parseaccelmenu();
   break;
   case 3:
    parsemagmenu();
   break;
   case 4:
    parsegyroscalemenu();
   break;
   case 5:
    parseaccelscalemenu();
   break;
   case 6:
    parsemagscalemenu();
   break;
   case 7:
    parsegyroODRmenu();
   break;
   case 8:
    parseaccelODRmenu();
   break;
   case 9:
    parsemagODRmenu();
   break;
   case 10://return exits read and displaydata
    sst="";
    clearInterval(nn);
    mainmenu();
   break;
   case 11://select display units
    parsedisplaymenu();
   break;
   case 12://magnetometer calstep 0
    W.calMag(0,function(){
     USB.print("Point X-axis South and press return\n\r");
     sst="";
     menulevel=13;
    });
   break;
   case 13://magnetometer calstep 1
    W.calMag(1,function(){
     USB.print("Point Y-axis North and press return\n\r");
     sst="";
     menulevel=14;
    });
   break;
   case 14://magnetometer calstep 2
    W.calMag(2,function(){
     USB.print("Point Y-axis South and press return\n\r");
     sst="";
     menulevel=15;
    });
   break;
   case 15://magnetometer calstep 3
    W.calMag(3,function(){
     USB.print("Point Z-axis North and press return\n\r");
     sst="";
     menulevel=16;
    });
   break;
   case 16://magnetometer calstep 4
    W.calMag(4,function(){
     USB.print("Point Z-axis South and press return\n\r");
     sst="";
     menulevel=17;
    });
   break;
   case 17://magnetometer calstep `
    W.calMag(5,function(){
     mainmenu();
    });
   break;
 }//end switch
}

function mheader(){
 USB.print("\n\rSelect option or use control-C to exit\n\r");
}

function mainmenu(){
 sst="";
 menulevel=0;
 mheader();
 USB.print("0 Configure Gyro\n\r");
 USB.print("1 Configure Accelerometer\n\r");
 USB.print("2 Configure Magnetometer\n\r");
 USB.print("3 Select Display Units\n\r");
 USB.print("4 Read and Display Data\n\r");
 USB.print("5 Show Calibration Structure\n\r");
 USB.print("6 Calibrate Gyro and Accelerometer\n\r");
 USB.print("7 Calibrate Magnetometer\n\r");
 USB.print("8 Save calibrations to ROM\n\r");
 USB.print("E Exit\n\r");
}

var count=0;var nn;
function parsemainmenu(){
USB.print("\n\r");
   switch(this.sst.charAt(0)){
    case "0"://Configure Gyro
     USB.print("Configure Gyro\n\r");
     gyromenu();
    break;
    case "1"://Configure Accelerometer
     USB.print("Configure Accelerometer\n\r");
     accelmenu();
    break;
    case "2"://Configure Magnetometer
     USB.print("Configure Magnetometer\n\r");
     magmenu();
    break;
    case "3"://select display units
     USB.print("Select Display Units\n\r");
     displaymenu();
    break;
    case "4"://read and display data
     menulevel=10;sst="";
     readall(W);
     nn=setInterval(function () {
       readall(W);
       count++;
       if(count>1000)clearInterval(nn);
      }, 200);
    break;
    case "5"://show calibration structure
     USB.print("Magnetometer Scale "+W.mScale+"\n\r");
     USB.print(JSON.stringify(W.mscale)+"\n\r");
     USB.print("Gyro Scale "+W.gScale+"\n\r");
     USB.print(JSON.stringify(W.gyroscale)+"\n\r");
     USB.print("Acceleration Scale "+W.aScale+"\n\r");
     USB.print(JSON.stringify(W.accelscale)+"\n\r\n\r");
     mainmenu();
    break;
    case "6"://calibrate the gyro and accelerometer
//do all scales 0..4
     W.calibrate(W.autoCalc,0,0,function(){
      W.calibrate(W.autoCalc,0,1,function(){
       W.calibrate(W.autoCalc,0,2,function(){
        W.calibrate(W.autoCalc,0,3,function(){
        });//3
       });//2
      });//1
      mainmenu();
     });//0
//     mainmenu();
    break;
    case "7"://calibrate magnetometer
     USB.print("Point X-axis North and press return\n\r");
     menulevel=12;sst="";
    break;
    case "8"://save calibrations to ROM
     USB.print("Saving calibration to ROM\n\r");
     var mag=JSON.stringify(W.mscale)+';'+JSON.stringify(W.gyroscale)+';'+
 JSON.stringify(W.accelscale);
 var f = new (require("FlashEEPROM"))();
 f.write(CalPage, mag);
     mainmenu();
    break;
   case"E"://Exit
     USB.setConsole();
     LoopbackA.print("USB.setConsole();\n\r");
     USB.print("Exit\n\r");
    break;
    default:
     mainmenu();
    break;
  }//end switch sst
}//end parsemainmenu

function displaymenu(){
 sst="";
 menulevel=11;
 mheader();
 USB.print("0 Raw count\n\r");
 USB.print("1 Raw-Offset\n\r");
 USB.print("2 Engineering Units\n\r");
 USB.print("8 Main Menu\n\r");
 USB.print("E Exit\n\r");
}

function parsedisplaymenu(){
USB.print("\n\r");
   switch(this.sst.charAt(0)){
    case "0"://Raw count
     USB.print("Raw Count\n\r");
     W.autoCalc=0;
     mainmenu();
    break;
    case "1"://Rawcount-offset
     USB.print("Raw Count - Offset\n\r");
     W.autoCalc=1;
     mainmenu();
    break;
    case "2"://Engineering Units
     USB.print("Engineering Units\n\r");
     W.autoCalc=2;
     mainmenu();
    break;
    case "8"://Main Menu
     USB.print("Return to Main Menu\n\r");
     mainmenu();
    break;
    case"E"://Exit
     USB.setConsole();
     LoopbackA.print("USB.setConsole();\n\r");
     USB.print("Exit\n\r");
    break;
    default:
     displaymenu();
    break;
  }//end switch sst
}

function gyromenu(){
 sst="";
 menulevel=1;
 mheader();
 USB.print("0 Set Gyro Scale\n\r");
 USB.print("1 Set Gyro Output Data Rate\n\r");
// USB.print("2 Set Gyro Filter\n\r");
 USB.print("8 Main Menu\n\r");
 USB.print("E Exit\n\r");
}

function parsegyromenu(){
USB.print("\n\r");
   switch(this.sst.charAt(0)){
    case "0"://Set Gyro Scale
     USB.print("Set Gyro Scale\n\r");
     gyroscalemenu();
    break;
    case "1"://Set Gyro Output Data Rate
     USB.print("Set Gyro Output Data Rate\n\r");
     gyroODRmenu();
    break;
    case "8"://Main Menu
     USB.print("Return to Main Menu\n\r");
     mainmenu();
    break;
    case"E"://Exit
     USB.setConsole();
     LoopbackA.print("USB.setConsole();\n\r");
     USB.print("Exit\n\r");
    break;
    default:
     gyromenu();
    break;
  }//end switch sst
}//end parsegyromenu

function accelmenu(){
 sst="";
 menulevel=2;
 mheader();
 USB.print("0 Set Accelerometer Scale\n\r");
 USB.print("1 Set Accelerometer Output Data Rate\n\r");
 USB.print("8 Main Menu\n\r");
 USB.print("E Exit\n\r");
}

function parseaccelmenu(){
USB.print("\n\r");
   switch(this.sst.charAt(0)){
    case "0"://Set accel Scale
     USB.print("Set Accelerometer Scale\n\r");
     accelscalemenu();
    break;
    case "1"://Set accel Output Data Rate
     USB.print("Set Accelerometer Output Data Rate\n\r");
     accelODRmenu();
    break;
    case "8"://Main Menu
     USB.print("Return to Main Menu\n\r");
     mainmenu();
    break;
    case"E"://Exit
     USB.setConsole();
     LoopbackA.print("USB.setConsole();\n\r");
     USB.print("Exit\n\r");
    break;
    default:
     accelmenu();
    break;
  }//end switch sst
}//end parseaccelmenu

function magmenu(){
 sst="";
 menulevel=3;
 mheader();
 USB.print("0 Set Magnetometer Scale\n\r");
 USB.print("1 Set Magnetometer Output Data Rate\n\r");
 USB.print("8 Main Menu\n\r");
 USB.print("E Exit\n\r");
}

function parsemagmenu(){
USB.print("\n\r");
   switch(this.sst.charAt(0)){
    case "0"://Set mag Scale
     USB.print("Set Magnetometer Scale\n\r");
     magscalemenu();
    break;
    case "1"://Set mag Output Data Rate
     USB.print("Set Magnetometer Output Data Rate\n\r");
     magODRmenu();
    break;
    case "8"://Main Menu
     USB.print("Return to Main Menu\n\r");
     mainmenu();
    break;
    case"E"://Exit
     USB.setConsole();
     LoopbackA.print("USB.setConsole();\n\r");
     USB.print("Exit\n\r");
    break;
    default:
     magmenu();
    break;
  }//end switch sst
}//end parsemagmenu


/////////////////////////

function gyroscalemenu(){
 sst="";
 menulevel=4;
 mheader();
 USB.print("Select Gyro Scale\n\r");
 USB.print("0 for  245 deg/s\n\r");
 USB.print("1 for  500 deg/s\n\r");
 USB.print("2 for 2000 deg/s\n\r");
 USB.print("8 Main Menu\n\r");
 USB.print("E Exit\n\r");
}

function parsegyroscalemenu(){
USB.print("\n\r");
   switch(this.sst.charAt(0)){
    case "0"://Set gyro Scale 245
    case "1":///Set gyro Scale 500
    case "2"://Set gyro Scale 2000r
     USB.print("Set Gyro Scale\n\r");
     W.setGyroScale(Number(this.sst.charAt(0)));
     gyromenu();
    break;
    case "8"://Main Menu
     USB.print("Return to Main Menu\n\r");
     mainmenu();
    break;
    case"E"://Exit
     USB.setConsole();
     LoopbackA.print("USB.setConsole();\n\r");
     USB.print("Exit\n\r");
    break;
    default:
     gyroscalemenu();
    break;
  }//end switch sst
}//end parsegyroscalemenu

function accelscalemenu(){
 sst="";
 menulevel=5;
 mheader();
 USB.print("Select Accelerometer Scale\n\r");
 USB.print("0 for  2 g\n\r");
 USB.print("1 for  4 g\n\r");
 USB.print("2 for  8 g\n\r");
 USB.print("3 for 16 g\n\r");
 USB.print("8 Main Menu\n\r");
 USB.print("E Exit\n\r");
}

function parseaccelscalemenu(){
USB.print("\n\r");
   switch(this.sst.charAt(0)){
    case "0"://Set accel Scale 2g
    case "1"://Set accel Scale 4g
    case "2"://Set accel Scale 8g
    case "3"://Set accel Scale 16g
     USB.print("Set Accelerometer Scale\n\r");
     W.setAccelScale(Number(this.sst.charAt(0)));
     accelmenu();
    break;
    case "8"://Main Menu
     USB.print("Return to Main Menu\n\r");
     mainmenu();
    break;
    case"E"://Exit
     USB.setConsole();
     LoopbackA.print("USB.setConsole();\n\r");
     USB.print("Exit\n\r");
    break;
    default:
     accelscalemenu();
    break;
  }//end switch sst
}//end parseaccelscalemenu

function magscalemenu(){
 sst="";
 menulevel=6;
 mheader();
 USB.print("Select Magnetometer Scale\n\r");
 USB.print("0 for  4 Gauss\n\r");
 USB.print("1 for  8 Gauss\n\r");
 USB.print("2 for 12 Gauss\n\r");
 USB.print("3 for 16 Gauss\n\r");
 USB.print("8 Main Menu\n\r");
 USB.print("E Exit\n\r");
}

function parsemagscalemenu(){
USB.print("\n\r");
   switch(this.sst.charAt(0)){
    case "0"://Set mag Scale 4 Gauss
    case "1"://Set mag Scale 8 Gauss
    case "2"://Set magl Scale 12 Gauss
    case "3"://Set mag Scale 16 Gauss
     USB.print("Set Accelerometer Scale\n\r");
     W.setMagScale(Number(this.sst.charAt(0)));
     magmenu();
    break;
    case "8"://Main Menu
     USB.print("Return to Main Menu\n\r");
     mainmenu();
    break;
    case"E"://Exit
     USB.setConsole();
     LoopbackA.print("USB.setConsole();\n\r");
     USB.print("Exit\n\r");
    break;
    default:
     magscalemenu();
    break;
  }//end switch sst
}//end parsemagscalemenu 

function gyroODRmenu(){
 sst="";
 menulevel=7;
 mheader();
 USB.print("Select Gyro Output Data Rate\n\r");
// USB.print("0 for  off\n\r");
 USB.print("1 for  14.9 Hz\n\r");
 USB.print("2 for  59.5 Hz\n\r");
 USB.print("3 for 119   Hz\n\r");
 USB.print("4 for 238   Hz\n\r");
 USB.print("5 for 476   Hz\n\r");
 USB.print("6 for 952   Hz\n\r");
 USB.print("8 Main Menu\n\r");
 USB.print("E Exit\n\r");
}

function parsegyroODRmenu(){
USB.print("\n\r");
   switch(this.sst.charAt(0)){
//    case "0"://Set gyroODR off
    case "1"://Set gyroODR 14.9 Hz
    case "2"://Set gyroODR 59.5 Hz
    case "3"://Set gyroODR 119 Hz
    case "4"://Set gyroODR 238 Hz
    case "5"://Set gyroODR 476 Hz
    case "6"://Set gyroODR 952 Hz
    USB.print("Set Gyro Output Data Rate\n\r");
     W.setGyroODR(Number(this.sst.charAt(0)));
     gyromenu();
    break;
    case "8"://Main Menu
     USB.print("Return to Main Menu\n\r");
     mainmenu();
    break;
    case"E"://Exit
     USB.setConsole();
     LoopbackA.print("USB.setConsole();\n\r");
     USB.print("Exit\n\r");
    break;
    default:
     gyroODRmenu();
    break;
  }//end switch sst
}//end parsegyroODRmenu

function accelODRmenu(){ //(accelerometer only mode)
 sst="";
 menulevel=8;
 mheader();
 USB.print("Select Accelerometer Output Data Rate\n\r");
// USB.print("0 for  off\n\r");
 USB.print("1 for  10   Hz\n\r");
 USB.print("2 for  50   Hz\n\r");
 USB.print("3 for 119   Hz\n\r");
 USB.print("4 for 238   Hz\n\r");
 USB.print("5 for 476   Hz\n\r");
 USB.print("6 for 952   Hz\n\r");
 USB.print("8 Main Menu\n\r");
 USB.print("E Exit\n\r");
}

function parseaccelODRmenu(){
USB.print("\n\r");
   switch(this.sst.charAt(0)){
//    case "0"://Set accelODR off
    case "1"://Set accelODR 10    Hz
    case "2"://Set accelODR 50   Hz
    case "3"://Set accelODR 119 Hz
    case "4"://Set accelODR 238 Hz
    case "5"://Set accelODR 476 Hz
    case "6"://Set accelODR 952 Hz
    USB.print("Set Accelerometer Output Data Rate\n\r");
     W.setAccelODR(Number(this.sst.charAt(0)));
     accelmenu();
    break;
    case "8"://Main Menu
     USB.print("Return to Main Menu\n\r");
     mainmenu();
    break;
    case"E"://Exit
     USB.setConsole();
     LoopbackA.print("USB.setConsole();\n\r");
     USB.print("Exit\n\r");
    break;
    default:
     accelODRmenu();
    break;
  }//end switch sst
}//endparsemagODRmenu 

function magODRmenu(){ //(accelerometer only mode)
 sst="";
 menulevel=9;
 mheader();
 USB.print("Select Magnetometer Output Data Rate\n\r");
 USB.print("0 for   0.625 Hz\n\r");
 USB.print("1 for   1.25  Hz\n\r");
 USB.print("2 for   2.5   Hz\n\r");
 USB.print("3 for   5     Hz\n\r");
 USB.print("4 for  10     Hz\n\r");
 USB.print("5 for  20     Hz\n\r");
 USB.print("6 for  40     Hz\n\r");
 USB.print("7 for  80     Hz\n\r");
 USB.print("8 Main Menu\n\r");
 USB.print("E Exit\n\r");
}

function parsemagODRmenu(){
USB.print("\n\r");
   switch(this.sst.charAt(0)){
    case "0"://Set magODR 0.625 Hz
    case "1"://Set magODR 1.25  Hz
    case "2"://Set magODR 2.5   Hz
    case "3"://Set magODR 5 Hz
    case "4"://Set magODR 10 Hz
    case "5"://Set magODR 206 Hz
    case "6"://Set magODR 40 Hz
    case "7"://Set magODR 80 Hz
    USB.print("Set Accelerometer Output Data Rate\n\r");
     W.setMagODR(Number(this.sst.charAt(0)));
     magmenu();
    break;
    case "8"://Main Menu
     USB.print("Return to Main Menu\n\r");
     mainmenu();
    break;
    case"E"://Exit
     USB.setConsole();
     LoopbackA.print("USB.setConsole();\n\r");
     USB.print("Exit\n\r");
    break;
    default:
     magODRmenu();
    break;
  }//end switch sst
}//end parsemagODRmenu

/*
W.setGyroBandwidth(0);// 0..3 see table 46
//
//setGyroHPfilter=function(onoff,cutoff)
W.setGyroHPfilter(1,7); //cutoff 0 to 15
*/

//////////////////////////////////////////////////////
var AC=new xyzAvg(20);var ac=[0,0,0];
var GY=new xyzAvg(20);var gy=[0,0,0];
var MA=new xyzAvg(20);var ma=[0,0,0];
function readall(W){
W.readAccel();
ac=AC.getAvg(W.a);
W.readGyro();
gy=GY.getAvg(W.g);
W.readMag();
ma=MA.getAvg(W.m);
W.readTemp();
var pirate=180.0/Math.PI;

console.log("Acceleration,     ",W.a[0],',',W.a[1],',',W.a[2]);
console.log("Avg Acceleration, ",ac[0],',',ac[1],',',ac[2]);
console.log("Gyro,             ",W.g[0],',',W.g[1],',',W.g[2]);
console.log("Avg Gyro,         ",gy[0],',',gy[1],',',gy[2]);
console.log("Magnetometer,     ",W.m[0],',',W.m[1],',',W.m[2]);
console.log("Avg Magnetometer  ",ma[0],',',ma[1],',',ma[2]);

console.log("Temperature ",W.temperature/10);
console.log("Level", pirate*Math.atan2(W.a[0],W.a[2]),pirate*Math.atan2(W.a[1],W.a[2]));
var heading; // if level
heading=pirate*Math.atan2(-W.m[0],W.m[1]);
if(heading <0) heading+=360;
console.log("heading",heading);
heading=pirate*Math.atan2(-ma[0],ma[1]);
if(heading <0) heading+=360;
console.log("avg heading",heading);
}//end readall

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
var f = new (require("FlashEEPROM"))();
require("slimLSM9DS1");
W=require("calibrateLSM9DS1").connect(I2C3,xgAddress,mAddress);
W.run();//Get it started
//
//load the zero offsets obtained from calibration program
//load the zero offsets obtained from calibration program
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

 W.enableFIFO(true);
 W.setFIFO(5,10); //FIFO_THS=1,len

//use autoCalc to control display values
W.autoCalc=2;//0=raw,1=raw-offset,2=calibrated
}//end start

///// running average functions
//Ravg.js
//15 Dec 2016
//running averagearr

function Ravg(n){
 this.N=n;
 this.avg=0.0;
 this.flag=true;
}

Ravg.prototype.getAvg=function(data){
 if(this.flag){
  this.avg=data;
  this.flag=false;
 }else{
  this.avg=(this.avg*(this.N-1)+data)/this.N;
 }//end else
 return this.avg;
};

function xyzAvg(n){
 this.vect=[new Ravg(n),new Ravg(n),new Ravg(n)];
}

xyzAvg.prototype.getAvg=function(data){
 var Rvalue=[0,0,0];
 var i;
 for(i=0;i<3;i++)Rvalue[i]=this.vect[i].getAvg(data[i]);
 return Rvalue;
};

//////////////////////////////////////////////////////////////////
