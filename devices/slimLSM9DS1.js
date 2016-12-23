/* Copyright (c) 2016 Joe McCarty. See the file LICENSE for copying permission. */
/*
This module provides I2C connection to a LSM9DS1 IMU
The prefix slim indicates that the zero calibration and interrupt functions are omitted. These functions may be added using a different module
*/

//slimLSM9DS1.js as a module
//13 Dec2016
////////////////////////////////////////
/*Private */
var WHO_AM_I_AG_RSP=0x68;
var WHO_AM_I_M_RSP=0x3D;
var Mags={
 WHO_AM_I_M:	0x0F,
 OFFSET_X_REG_L_M:	0x05,
 OFFSET_X_REG_H_M:	0x06,
 OUT_X_L_M: 0x28,
 CTRL_REG1_M:0x20,
 CTRL_REG2_M:0x21,
 STATUS_REG_M:0x27,
};

var Regs={
WHO_AM_I_XG:(0x0F),
 CTRL_REG9:(0x23),
 FIFO_CTRL:(0x2E),
 OUT_TEMP_L:(0x15),
 OUT_X_L_G:(0x18),
 OUT_X_L_XL:(0x28),
 CTRL_REG1_G:(0x10),
 CTRL_REG3_G:(0x12),
 CTRL_REG6_XL:(0x20),
 STATUS_REG_1:(0x27),
};

/** 'creates an instance of LSM9DS1*/
function LSM9DS1(i2c,xgAddress,mAddress) {
  this.i2c = i2c;
  this.xgAddress= xgAddress;
  this.mAddress= mAddress;
this.xgstack=[
  { "sub": 16, "data": 192 },
  { "sub": 17, "data": 0 },
  { "sub": 18, "data": 0 },
  { "sub": 30, "data": 58 },
  { "sub": 19, "data": 0 },
  { "sub": 31, "data": 56 },
  { "sub": 32, "data": 192 },
  { "sub": 33, "data": 0 }
 ];
this.mstack=[
  { "sub": 32, "data": 28 },
  { "sub": 33, "data": 0 },
  { "sub": 34, "data": 0 },
  { "sub": 35, "data": 12 },
  { "sub": 36, "data": 0 }
 ];
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

/** 'a g m where readings are stored' */
  this.g=[0,0,0];
  this.a=[0,0,0];
  this.m=[0,0,0];
  this.temperature=0;
/** 'autoCalc determine output units 0=raw,1=raw-offset,2=calibrated' */
  this.autoCalc = 0; 
}
/** 'run() initializes the LSM9DS1' */
LSM9DS1.prototype.run=function(){
 var i;
var mTest = this.mReadByte(Mags.WHO_AM_I_M);
var xgTest = this.xgReadByte(Regs.WHO_AM_I_XG);
var whoAmICombined = (xgTest << 8) | mTest;
if (whoAmICombined != ((WHO_AM_I_AG_RSP << 8) | WHO_AM_I_M_RSP))
	return 0;//callback(0);
 for(i=0; i<this.xgstack.length;i++){
//[i].sub,this.xgstack[i].data);
this.i2c.writeTo(this.xgAddress,this.xgstack[i].sub,
                 this.xgstack[i].data);
 }
 for(i=0; i<this.mstack.length;i++){
//[i].sub,this.mstack[i].data);
this.i2c.writeTo(this.mAddress,this.mstack[i].sub,
                 this.mstack[i].data);
 }
return whoAmICombined;
};//end run

/** 'mReadByte(subAddress) read a byte from the magnetometer at subaddress'*/
LSM9DS1.prototype.mReadByte=function(subAddress){
 var x=this.mAddress;
 var data=Uint8Array(1);
 this.i2c.writeTo(x, subAddress);
 data=this.i2c.readFrom(x, 1);
 return data[0];
};//end mReadByte

/** 'xgReadByte(subAddress) read a byte from the dyro/accelerometer at subAddress'*/
LSM9DS1.prototype.xgReadByte=function(subAddress){
 var x=this.xgAddress;
 var data=Uint8Array(1);
 this.i2c.writeTo(x, subAddress);
 data=this.i2c.readFrom(x, 1);
 return data[0];
};//end xgReadByte

/** 'magOffset(axis,offset) write axis offset to magnetometer'*/
LSM9DS1.prototype.magOffset=function(axis,offset){
 if (axis > 2)return 0;
 var msb, lsb;
 msb = (offset & 0xFF00) >> 8;
 lsb = offset & 0x00FF;
 this.mWriteByte(Mags.OFFSET_X_REG_L_M + (2 * axis), lsb);
 this.mWriteByte(Mags.OFFSET_X_REG_H_M + (2 * axis), msb);
};//end magOffset

/** 'public' constants here */
LSM9DS1.prototype.mWriteByte=function(subAddress,data){ 
  //console.log("mWriteByte ",this.mAddress, subAddress, data);
  var x=this.mAddress;
  this.i2c.writeTo(x, subAddress,data);
  return 0;
};//end mWriteByte

/** 'public' constants here */
LSM9DS1.prototype.enableFIFO=function(enable){
	var temp = this.xgReadByte(Regs.CTRL_REG9);
	if (enable) temp |= (1<<1);
	else temp &= ~(1<<1);
	this.xgWriteByte(Regs.CTRL_REG9, temp);
};//end enableFIFO

/** 'xgWriteByte(subAddress,data) Write data byte to gyro/accelerometer at subAddress' */
LSM9DS1.prototype.xgWriteByte=function(subAddress,data){
 var x=this.xgAddress;
 this.i2c.writeTo(x, subAddress,data);
};//end xgWriteByte

/** 'setFIFO(fifoMode,fifoThs) Sets fifo mode and length' */
LSM9DS1.prototype.setFIFO=function(fifoMode,fifoThs){
 var threshold = fifoThs <= 0x1F ? fifoThs : 0x1F;
 this.xgWriteByte(Regs.FIFO_CTRL, ((fifoMode & 0x7) << 5) |   (threshold & 0x1F));
};//end setFIFO

/** 'readAccel() reads X,Y,Z accelerometer values'*/
LSM9DS1.prototype.readAccel=function(){
 var temp=this.xgReadBytes(Regs.OUT_X_L_XL, 6);
 var i;
 this.a[0]=this.twos_comp(temp[0],temp[1]);
 this.a[1]=this.twos_comp(temp[2],temp[3]);
 this.a[2]=this.twos_comp(temp[4],temp[5]);
 if (this.autoCalc>0){
  for(i=0;i<3;i++)
   this.a[i] -= this.accelscale[this.aScale].aoff[i];
 }//endif
 if (this.autoCalc>1){
  for(i=0;i<3;i++)
   this.a[i]=this.a[i]*this.accelscale[this.aScale].ares[i];
 }//endif
};//end readAccel

/** 'xgReadBytes(subAddress,count) read count bytes from gyro/accelerometer at subAddress'*/
LSM9DS1.prototype.xgReadBytes=function(subAddress,count){
 var dest= new Uint8Array(count);
 var x=this.xgAddress;
 this.i2c.writeTo(x, subAddress|0x80);
 dest=this.i2c.readFrom(x, count);
 return dest;
};//end xgReadBytes

/** 'prototype.twos_comp(low,high) converts low and high bytes'*/
LSM9DS1.prototype.twos_comp=function(low,high){
 var t=(high << 8) | low;
  return(t & 0x8000 ? t - 0x10000 : t);
};//end twos_comp

/** 'readGyro() get data reading from the Gyro' */
LSM9DS1.prototype.readGyro=function(){
 var temp=	this.xgReadBytes(Regs.OUT_X_L_G,6);
 var i;
 this.g[0]=this.twos_comp(temp[0],temp[1]);
 this.g[1]=this.twos_comp(temp[2],temp[3]);
 this.g[2]=this.twos_comp(temp[4],temp[5]);
 if (this.autoCalc>0){
  for(i=0;i<3;i++)
   this.g[i] -=this.gyroscale[this.gScale].goff[i];
 }//endif
 if (this.autoCalc>1){
  for(i=0;i<3;i++)
   this.g[i]=this.g[i]*this.gyroscale[this.gScale].gres[i];
 }//endif
};//end readGyro

/** 'readMag() get data reading from the magnetometer'*/
LSM9DS1.prototype.readMag=function(){
 var temp=this.mReadBytes(Mags.OUT_X_L_M, 6);
 var i;
 this.m[0]=this.twos_comp(temp[0],temp[1]);
 this.m[1]=this.twos_comp(temp[2],temp[3]);
 this.m[2]=this.twos_comp(temp[4],temp[5]);
 if (this.autoCalc>0){
  for(i=0;i<3;i++)
   this.m[i] -=this.mscale[this.mScale].moff[i];
 }//endif
 if (this.autoCalc>1){
  for(i=0;i<3;i++)
   this.m[i]=this.m[i]*this.mscale[this.mScale].mres[i];
 }//endif
};//end readMag

/** 'mReadBytes(subAddress,count) read count bytes from magnetometer at subAddress'*/
LSM9DS1.prototype.mReadBytes=function(subAddress,count){
 var x=this.mAddress;
 var dest=new Uint8Array(count);
 this.i2c.writeTo(x, subAddress|0x80);
 dest=this.i2c.readFrom(x, count);
 return dest;
};//end mReadBytes

/** 'readTemp() read the chip temperature C' */
LSM9DS1.prototype.readTemp=function(){
 var temp=this.xgReadBytes(Regs.OUT_TEMP_L, 2); 
 this.temperature=this.twos_comp(temp[1]<<4,(temp[0]&0xf)<<4);
 this.temperature=this.temperature/15;
};//end readTemp

/** 'setGyroScale(gScl) gScl 0 for 245, 1 for 500, 2 for 2000' */
LSM9DS1.prototype.setGyroScale=function(gScl){
 if(gScl<0)return "Bad Gyro Scale selection";
 if(gScl>2)return "Bad Gyro Scale selection";
 var ctrl1RegValue = this.xgReadByte(Regs.CTRL_REG1_G);
 ctrl1RegValue &= 0xE7;
 ctrl1RegValue |= this.gyroscale[gScl].regvalue;
 this.xgWriteByte(Regs.CTRL_REG1_G, ctrl1RegValue);
 this.gScale=gScl;
 return this.gyroscale[gScl].scale;
};//end setGyroScale

/** 'setGyroBandwidth(bw) 0..3' */
LSM9DS1.prototype.setGyroBandwidth=function(bw){
 if(bw<0)return "Bad Gyro Bandwidth selection";
 if(bw>3)return "Bad Gyro Bandwidth selection";
 var temp = this.xgReadByte(Regs.CTRL_REG1_G);
 temp &= 0xFC;
 temp |= bw;
 this.xgWriteByte(Regs.CTRL_REG1_G, temp);
 return bw;
};//end setGyroBandwidth

/** 'setGyroHPfilter(onoff,cutoff) 0/1, 0..31'*/
LSM9DS1.prototype.setGyroHPfilter=function(onoff,cutoff){
 if(cutoff<0)return "Bad Gyro cutoff selection";
 if(cutoff>31)return "Bad Gyro cutoff selection";
 var temp = this.xgReadByte(Regs.CTRL_REG3_G);
 temp &= 0xB0;
 temp |= cutoff;
 onoff&=1;onoff=onoff<<6;
 temp|=onoff;
 this.xgWriteByte(Regs.CTRL_REG3_G, temp);
 return cutoff;
};//end setGyroHPfilter

/** 'public' constants here */
LSM9DS1.prototype.setAccelScale=function(aScl){
 if(aScl<0)return "Bad Acceleration Scale selection";
 if(aScl>3)return "Bad Acceleration Scale selection";
 var tempRegValue = this.xgReadByte(Regs.CTRL_REG6_XL);
 // Mask out accel scale bits:
 tempRegValue &= 0xE7;
 tempRegValue |= this.accelscale[aScl].regvalue;
 this.xgWriteByte(Regs.CTRL_REG6_XL, tempRegValue);
 this.aScale=aScl;
 return this.accelscale[aScl].scale;
};//end setAccelScale

/** 'setMagScale(mScl) 0..3' */
LSM9DS1.prototype.setMagScale=function(mScl){
 if(mScl<0)return "Bad Magnetometer Scale selection";
 if(mScl>3)return "Bad Magnetometer Scale selection";
 var temp = this.mReadByte(Mags.CTRL_REG2_M);
 temp &= 0xFF^(0x3 << 5);
 temp |= this.mscale[mScl].regvalue;
 this.mWriteByte(Mags.CTRL_REG2_M, temp);
 this.mScale=mScl;
 return this.mscale[mScl].scale;
};//end setMagScale

/** 'Bool=magAvailable()' */
LSM9DS1.prototype.magAvailable=function(){
	var status;
	status = this.mReadByte(Mags.STATUS_REG_M);
    return (status & 8)>>3;
};//end magAvailable

/** 'Bool=accelAvailable()' */
LSM9DS1.prototype.accelAvailable=function(){
 var status = this.xgReadByte(Regs.STATUS_REG_1);
 return (status & (1<<0));
};//end accelAvailable

/** 'Bool=gyroAvailable()' */
LSM9DS1.prototype.gyroAvailable=function(){
 var status = this.xgReadByte(Regs.STATUS_REG_1);
 return ((status & (1<<1)) >> 1);
};//end gyroAvailable

/** 'Bool=tempAvailable()' */
LSM9DS1.prototype.tempAvailable=function(){
 var status = this.xgReadByte(Regs.STATUS_REG_1);
 return ((status & (1<<2)) >> 2);
};//end tempAvailable

/** 'setGyroODR(gRate)' */
LSM9DS1.prototype.setGyroODR=function(gRate){
 if ((gRate & 0x07) !== 0){
  var temp = this.xgReadByte(Regs.CTRL_REG1_G);
  temp &= 0xFF^(0x7 << 5);
  temp |= (gRate & 0x07) << 5;
  this.gyro_sampleRate= gRate & 0x07;
  this.xgWriteByte(Regs.CTRL_REG1_G, temp);
 }//endif
};//end setGyroODR


/** 'setAccelODR(aRate)' */
LSM9DS1.prototype.setAccelODR=function(aRate){
 if ((aRate & 0x07) !== 0){
  var temp = this.xgReadByte(Regs.CTRL_REG6_XL);
  temp &= 0x1F;
  temp |= ((aRate & 0x07) << 5);
  this.accel_sampleRate = aRate & 0x07;
  this.xgWriteByte(Regs.CTRL_REG6_XL, temp);
 }//endif
};//end setAccelODR

/** 'setMagODR(mRate)' */
LSM9DS1.prototype.setMagODR=function(mRate){
 var temp = this.mReadByte(Mags.CTRL_REG1_M);
 temp &= 0xFF^(0x7 << 2);
 temp |= ((mRate & 0x07) << 2);
 this.mag_sampleRate = mRate & 0x07;
 this.mWriteByte(Mags.CTRL_REG1_M, temp);
};//end setMagODR

/** This is 'exported' so it can be used with `require('slimLSM9dS1.js').connect(i2c,xgAddress,mAddress)` */
// Create an instance of LSM9DS1
exports.connect = function(i2c,xgAddress,mAddress) {
  return new LSM9DS1(i2c,xgAddress,mAddress);
};


