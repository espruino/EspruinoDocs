/* Copyright (c) 2016 Joe McCarty. See the file LICENSE for copying permission. */
/*
This module provides I2C connection to a LSM9DS1 IMU
The prefix calibrate indicates that the calibration functions are added to the slimLSM9DS1.js.*/
//calibrateLSM9DS1.js as a module
//19 Dec2016
// requires slimLSM9DS1.js
// 13 dec 2016
////////////////////////////////////////
/*Private */
var Regs={
  FIFO_SRC: 		(0x2F),
};
 var Avg=[0,0,0,0];

/** This is 'exported' so it can be used with `require('calibrateLSM9dS1.js').connect(i2c,xgAddress,mAddress)` */
exports.connect = function(i2c,xgAddress,mAddress) {
 var Q=require("slimLSM9DS1").connect(i2c,xgAddress,mAddress);

/**'calibrate(autocalc,mode,cscale,callback) calibrates the accelerometer and gyro'*/

Q.calibrate=function(autocalc,mode,cscale,callback){
 var data= new Uint8Array(6);
 var samples=0;
 var ii,i;
 var aBiasRawTemp=[0,0,0];
 var gBiasRawTemp=[0,0,0];
 var saveascale=this.aScale;
 var savegscale=this.gScale;
 aBiasRawTemp[0]=0;aBiasRawTemp[1]=0;aBiasRawTemp[2]=0;
 gBiasRawTemp[0]=0;gBiasRawTemp[1]=0;gBiasRawTemp[2]=0;
  this.setAccelScale(cscale);
  if(cscale<3)this.setGyroScale(cscale);
 aBiasRawTemp[0]=0;aBiasRawTemp[1]=0;aBiasRawTemp[2]=0;
 gBiasRawTemp[0]=0;gBiasRawTemp[1]=0;gBiasRawTemp[2]=0;
 this.autoCalc = 0;
 this.enableFIFO(false);
 this.enableFIFO(true);
 this.setFIFO(0, 0); 
 this.enableFIFO(false);
 this.enableFIFO(true);
 this.setFIFO(1, 0x1F);
 while (samples < 0x1F){
  samples = (this.xgReadByte(Regs.FIFO_SRC) & 0x3F);
 }//end while
  for(ii = 0; ii < samples ; ii++){
   // Read the gyro data stored in the FIFO
   this.readGyro();
   for(i=0;i<3;i++)gBiasRawTemp[i] += this.g[i];
   this.readAccel();
   for(i=0;i<2;i++)aBiasRawTemp[i] += this.a[i];
if(!mode)aBiasRawTemp[2]+=this.a[2] -  1.0/this.accelscale[this.aScale].ares[2];
else   aBiasRawTemp[2]+=this.a[2];
   // Assumes sensor facing up!
  }//next ii
  for (ii = 0; ii < 3; ii++){
this.gyroscale[this.gScale].goff[ii]= gBiasRawTemp[ii]/ samples;
this.accelscale[this.aScale].aoff[ii]= aBiasRawTemp[ii] / samples;
  }//nextii
  this.enableFIFO(false);
  this.setFIFO(0, 0x00);//FIFO_OFF=0
  this.autoCalc = autocalc;
  this.setAccelScale(saveascale);
  this.setGyroScale(savegscale);
  callback();
};//end calibrate

/**'avgMag(scale,N,callback) takes N magnetometer readings calculate the average for the magnetometer scale'*/
Q.avgMag=function(scale,N,callback){
 var saveMagscale=this.mScale;
 var saveAutocalc=this.autoCalc;
 this.setMagScale(scale);
 this.autoCalc=0;
 this.setMagODR(7);
  this.readMag();
 var avg=[0,0,0];
 var i,j;
 for(i=0;i<N;i++){
  this.readMag();
  for(j=0;j<3;j++)avg[j]+=this.m[j];
 }//next i
 for(j=0;j<3;j++)avg[j]=avg[j]/N;
 this.setMagScale(saveMagscale);
 this.autoCalc=saveAutocalc;
 callback(avg);
};

/**'calmag(step,callback) calibrates the magnetometer in 6 steps'*/

Q.calMag=function(step,callback){
 var i;
 if(step%2 <1)for(i=0;i<4;i++) Avg[i]=0;
 W.avgMag(0,20,function(avg){
  Avg[0]+=avg[Math.floor(step/2)];
   W.avgMag(1,20,function(avg){
   Avg[1]+=avg[Math.floor(step/2)];
   W.avgMag(2,20,function(avg){
   Avg[2]+=avg[Math.floor(step/2)];
    W.avgMag(3,20,function(avg){
    Avg[3]+=avg[Math.floor(step/2)];
if(step%2>0){
for(i=0;i<4;i++)W.mscale[i].moff[Math.floor(step/2)]=Avg[i]/2;
}//endif
     callback();
    });
   });
  });
 });
};//end calMag

 return Q;
};
