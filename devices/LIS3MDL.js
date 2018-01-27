/* Copyright (C) 2018 Joachim Klein. See the file LICENSE for copying permission. */
/*
This module interfaces with STMicroelectronics LIS3MDL. 

For development a X-Nucleo-IKS01A01 was used, connected to an STM32-Nucleo Board.
Connection:
*/

/** Addresses of the control registers */
var C = {
	I2C_ADDRESS: 0x1E,

    WHO_AM_I    : 0x0F,

	CTRL_REG1   : 0x20,
	CTRL_REG2   : 0x21,
	CTRL_REG3   : 0x22,
	CTRL_REG4   : 0x23,
	CTRL_REG5   : 0x24,

	STATUS_REG  : 0x27,
	OUT_X       : [0x28, 0x29],
	OUT_Y       : [0x2A, 0x2B],
	OUT_Z       : [0x2C,0x2D],
	TEMP_OUT    : [0x2E, 0x2F],
	INT_CFG     : 0x30,
	INT_SRC     : 0x31,
	INT_THS     : [0x32, 0x33]
};

function LIS3MDL( i2c ) {
	this.i2c=i2c;
}

exports.connect = function(LIS_i2c) {
	return new LIS3MDL(LIS_i2c);
};

/** SetInterruptCfg
* Allow to configure the interrupts. Read the user Manual for more information.
*/
LIS3MDL.prototype.SetInterruptCfg = function ( IntCfg ) {
	this.w(C.INT_CFG, IntCfg);
}

/**
* Set Threshold for interrupt.
* Value should be between 0..32767
*/
LIS3MDL.prototype.SetThreshold = function ( Threshold ) {
	this.w(C.INT_THS[0], Threshold&0xff);
	this.w(C.INT_THS[1], (Threshold)>>8)&0x7F;
}

/** enable
* Init the LIS3MDL with default values.
* options: (first value is default)
* Interrupt: false, true
* if true all interrupt will be enabled. Use SetInterruptCfg to modify.
* TempSense: false, true
* Threshold: 0 .. 32767
* FullsCale: 4, 8, 12, 16
*/
LIS3MDL.prototype.enable = function ( options ) {

	var creg = new Uint8Array(5);
	creg[1]=0x70; // OM = 11 (ultra-high-performance mode for X and Y); DO = 100 (10 Hz ODR)
	creg[2]=0x00; // FS = 00 (+/- 4 gauss full scale)
	creg[3]=0x00; // MD = 00 (continuous-conversion mode)
	creg[4]=0x0C; // OMZ = 11 (ultra-high-performance mode for Z)
	creg[0]=0x00; // Interrupt
	
    if (options.Interrupt) { if (options.Interrupt=true) { creg[0]=0xff; } }
	if (options.TempSense) { if (options.TempSense=true) { creg[1]|=0x80; } }
	if (options.LowPower) { if (options.TempSense=true) { creg[3]|=0x20; } }

	if (options.Threshold) {
		if ((options.Threshold>32767)||(options.Threshold<0)) { 
			console.log("Throshold exceed limits!");		
		} else {
				this.SetThreshold(options.Threshold)
		}
    }

	if (options.FullScale) {
		// Default is 4 Gauss == unchanged
		if (options.FullScale=8) { creg[2]|=0x20; }
		if (options.FullScale=12) { creg[2]|=0x40; }
		if (options.FullScale=16) { creg[2]|=0x60; }
    }
	
	this.w(C.CTRL_REG1, creg[1]);
	this.w(C.CTRL_REG2, creg[2]);
	this.w(C.CTRL_REG3, creg[3]);
    this.w(C.CTRL_REG4, creg[4]);
	this.w(C.INT_CFG, creg[0]);

	
	}

/** GetID
* Return Chip ID.
* The value should be 61 (dec).
* Allows to verify if the correct chip is connected.
*/
LIS3MDL.prototype.GetID = function () {
	return this.r(C.WHO_AM_I);
}

/** GetTemperature
 * Return the current value of the temperature register 
 * The value is not explaind in the data sheet.
 * Return value is only provided if temperature measurement is enabled.
*/
LIS3MDL.prototype.GetTemperature = function () {
	return this.r2(C.TEMP_OUT[0]);
}

/** Bits in Command register (0x80) */
var DEF = {
	DEF0 : (0x00),
	XIEN : (0x20),
	YIEN:  (0x10),
	ZIEN:  (0x08),
	IEA:   (0x04),
	LIR:   (0x02),
	IEN:   (0x01)
};

L
/** logReg
* Dump all Control and status registers 
*/
LIS3MDL.prototype.logReg = function () {
	var cl = console.log;
	cl("Status Register: " + this.r(C.STATUS_REG).toString(16));
	cl("Temperature: " + this.r2(C.TEMP_OUT[0]).toString(16));
	cl("Interrupt Configuration: " + this.r(C.INT_CFG).toString(16));
	cl("Interrupt Source: " + this.r(C.INT_SRC).toString(16));
	cl("Interrupt Threshold: " + this.r2(C.INT_THS[0]).toString(16));
	cl("Ctrl 1: " + this.r(C.CTRL_REG1).toString(16));
	cl("Ctrl 2: " + this.r(C.CTRL_REG2).toString(16));
	cl("Ctrl 3: " + this.r(C.CTRL_REG3).toString(16));
	cl("Ctrl 4: " + this.r(C.CTRL_REG4).toString(16));
	cl("Ctrl 5: " + this.r(C.CTRL_REG5).toString(16));
}


/********************
 * Support functions
 */
/** r
 * read one byte of data from a register.
 */
LIS3MDL.prototype.r = function(addr) {
	this.i2c.writeTo({address:C.I2C_ADDRESS, stop:false}, 0x80 | addr);
	var result = this.i2c.readFrom(C.I2C_ADDRESS, 1);
	return result[0];
};

/** r2 
 * reading two bytes will read two consecutive registers! 
 */
LIS3MDL.prototype.r2 = function(addr) {
	this.i2c.writeTo({address:C.I2C_ADDRESS, stop:false}, 0x80 | addr);
	var result = this.i2c.readFrom(C.I2C_ADDRESS, 2);
	return (result[0]+result[1]*256);
};

/** Read
* return the data from x, y, z regsiter as an Array 
*/
LIS3MDL.prototype.Read = function() {
	this.i2c.writeTo({address:C.I2C_ADDRESS, stop:false}, 0x80 | C.OUT_X[0]);
	var result = this.i2c.readFrom(C.I2C_ADDRESS, 6);
	var result2 = new Int16Array(3);
	result2[0]=result[0]+result[1]*256;
	result2[1]=	result[2]+result[3]*256;
	result2[2]= result[4]+result[5]*256;
//	var result3 = {x:(result[0]+result[1]*256), y:(result[2]+result[3]*256), z:(result[4]+result[5]*256)};
	return result2;
};


/** w 
 * write data to a register 
 */
LIS3MDL.prototype.w = function(addr, data) {
	this.i2c.writeTo(C.I2C_ADDRESS, addr, data);
};
