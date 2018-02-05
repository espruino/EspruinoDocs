/* Copyright (C) 2018 Joachim Klein. See the file LICENSE for copying permission. */
/*
This module interfaces with STMicroelectronics
LSM6DSL iNEMO inertial module: 3D accelerometer and 3D gyroscope. 

For development a X-Nucleo-IKS01A01 was used, connected to an STM32-Nucleo Board.
Connection:
*/

/** Addresses of the control registers */
var C = {
	
	I2C_ADDRESS: 0x6B,
	I2C_ADDRESS1: 0x6A,

	FUNC_CFG_ACCESS: 0x01, 
	SENSOR_SYNC_TIME_FRAME: 0x04,
	SENSOR_SYNC_RES_RATIO: 0x05,
	FIFO_CTRL: [0x06, 0x07, 0x08, 0x09,0x0A],
	DRDY_PULSE_CFG_G: 0x0B,
	INT1_CTRL: 0x0D,
	INT2_CTRL: 0x0E,
	WHO_AM_I: 0x0F,
	// Accelerometer and gyroscope control registers
	CTRL: [0x10, 0x11,0x12,0x13,0x14,0x15,0x16,0x17,0x18,0x19],
	MASTER_CONFIG: 0x1A,
	// I2C master configuration register
	WAKE_UP_SRC: 0x1B,
	TAP_SRC:    0x1C,
	D6D_SRC:    0x1D,
	STATUS_REG: 0x1E,
	// Status data register for user interface
	OUT_TEMP: [0x20, 0x21],
	// Gyroscope output registers for user interface
	OUT_G: [0x22, 0x23, 0x24, 0x25, 0x26, 0x27],
	// Accelerometer output registers
	OUT_XL: [0x28, 0x29, 0x2A, 0x2B, 0x2C, 0x2D],
	// Sensor hub output registers
	SENSORHUB: [0x2E, 0x2F, 0x30, 0x31,0x32,0x33, 0x34,0x35,0x36,0x37,0x38,0x39],
};

/** create object LSM6DSL 
 * Object includes i2c interface and variables for the result.
 * To reduce CPU usage the update functions do not return data.
 * The results wil be stored in the object variables.
 * Scaling is done after read.
 * Accelerator data is in g.
 * Gyrodata is in degree per second (dps).
*/
function LSM6DSL( i2c ) {
	this.i2c=i2c;
	this.XL_X =0;
	this.XL_Y =0;
	this.XL_Z =0;
	this.G_X =0;
	this.G_Y =0;
	this.G_Z =0;
	this.options = {};
}

/** connect
 * default fuction for connecting the I2C Interface to the sensor. 
 */
exports.connect = function(LSM_i2c) {
	return new LSM6DSL(LSM_i2c);
};

/** SetReg
 * Allows to write directly to the config registers.
 * This is a developer function which should be used to implement new functions.
 * 
 * CFGREG: Register adress.
 * NewCfg: value to be written
*/
LSM6DSL.prototype.SetReg = function ( CFGREG, NewCfg ) {
	print ( "REG: " + CFGREG.toString(16)+", CFG: "+NewCfg.toString(16))
	this.w(CFGREG, NewCfg);
}

/** GetReg
 * Allows toread a single register.
 * Path through to r
 * Implementation for developers to try new settings from IDE.
 * 
 * CFGREG: Register Address
*/
LSM6DSL.prototype.GetReg = function ( CFGREG ) {
	return this.r(CFGREG);
}
/**
* Set threshold for interrupt.
* Value should be between 0..32767
* not yet used
*/
LSM6DSL.prototype.SetThreshold = function ( Threshold ) {
	this.w(C.INT_THS[0], Threshold&0xff);
	this.w(C.INT_THS[1], (Threshold)>>8)&0x7F;
}

/** enable
* Init the LSM6DSL with default values.
* options: (first value is default)
* mode:		 normal, slow, middle, fast
* sensor:	 both, gyro, acc
* interrupt: false, true 
*/
LSM6DSL.prototype.enable = function ( options ) {
	this.options = options||{};
	var rate=0x10;
	if (this.options.mode) {
		/* normal and slow use the default rate
			code is here for future use and extension but not required.
		if (this.options.mode == "normal") {
			rate=0x10;
		}
		if (this.options.mode == "slow") {
			rate=0x10;
		} */
		if (this.options.mode == "middle") {
			rate=0x20;
		}
		if (this.options.mode == "fast") {
			rate=0x30;
		}
	} // default: use lowest rate

	if (this.options.sensor) {
		if (this.options.mode == "both") {
			this.w(C.CTRL[0], rate);
			this.w(C.CTRL[1], rate);
			}
		if (this.options.mode == "gyro") {
			this.w(C.CTRL[0], 0x0);
			this.w(C.CTRL[1], rate);
			}
		if (this.options.mode == "acc") {
			this.w(C.CTRL[0], rate);
			this.w(C.CTRL[1], 0x0);
			}
	} else {
		this.w(C.CTRL[0], rate);
		this.w(C.CTRL[1], rate);
	}

	if (this.options.interrupt) {
		this.w(C.INT1_CTRL, 0x03);
	} else {
		this.w(C.INT1_CTRL, 0x00);
	}
	
}

/** GetID
* Return Chip ID.
* The value should be 61 (dec).
* Allows to verify if the correct chip is connected.
*/
LSM6DSL.prototype.GetID = function () {
	return this.r(C.WHO_AM_I);
}

/** GetTemperature
 * Return the current value of the temperature register 
 * The value is not explaind in the data sheet.
 * Return value is only provided if temperature measurement is enabled.
*/
LSM6DSL.prototype.GetTemperature = function () {
	return this.r2(C.TEMP_OUT[0]);
}

/** logReg
 * Dump all Control and status registers 
 * This function is implemented for debugging purposes 
 *only and should not be used during normal operation.
*/
LSM6DSL.prototype.logReg = function () {
	var cl = console.log;
	cl("Status Register: " + this.r(C.STATUS_REG).toString(16));
	
	for ( i= 1; i< 0x7f; i++)
	{
		if (i===0x02) { i=0x04; }
		if (i===0x0c) { i=0x0d; }
		if (i===0x1f) { i=0x20; }
		
		cl("Reg " + i.toString(16) + ": "+this.r(i).toString(16));
	}
	
}


/**************************
 * Support functions
 **************************/
/** r
 * read one byte of data from a register.
 */
LSM6DSL.prototype.r = function(addr) {
	this.i2c.writeTo({address:C.I2C_ADDRESS, stop:false}, addr);
	//this.i2c.writeTo({address:C.I2C_ADDRESS, stop:false}, 0x80 | addr);
	var result = this.i2c.readFrom(C.I2C_ADDRESS, 1);
	return result[0];
};

/** r2 
 *read two consecutive registers! 
 */
LSM6DSL.prototype.r2 = function(addr) {
	this.i2c.writeTo({address:C.I2C_ADDRESS, stop:false}, addr);
	var result = this.i2c.readFrom(C.I2C_ADDRESS, 2);
	return (result[0]+result[1]*256);
};

/** UpdateXL
* read the sensor XL registers and store results in object variables.
*/
LSM6DSL.prototype.updateXL = function() {
	this.i2c.writeTo({address:C.I2C_ADDRESS, stop:false}, C.OUT_XL[0]);
	//this.i2c.writeTo({address:C.I2C_ADDRESS}, C.OUT_G[0]);
	var result = this.i2c.readFrom(C.I2C_ADDRESS, 6);
	var Res2 = new Int16Array(3);
	Res2[0]=(result[0]+result[1]*256);
	Res2[1]=(result[2]+result[3]*256);
	Res2[2]=(result[4]+result[5]*256);
	this.XL_X=Res2[0]/16384;
	this.XL_Y=Res2[1]/16384;
	this.XL_Z=Res2[2]/16384;
};

/** UpdateG
* read the sensor Gyro registers and store results in object variables.
*/
LSM6DSL.prototype.updateG = function() {
	this.i2c.writeTo({address:C.I2C_ADDRESS, stop:false}, C.OUT_G[0]);
	//this.i2c.writeTo({address:C.I2C_ADDRESS}, C.OUT_G[0]);
	var result = this.i2c.readFrom(C.I2C_ADDRESS, 6);
	var Res2 = new Int16Array(6);
	for (var i=0; i<3;i++)
	{
		Res2[i]=result[i*2]+result[i*2+1]*256;	
	}
	
	this.G_X=(result[0]+result[1]*256)/1142;
	this.G_Y=(result[2]+result[3]*256)/1142;
	this.G_Z=(result[4]+result[5]*256)/1142;
};

/** Update
* read all sensor registers and store results in object variables.
*/
LSM6DSL.prototype.update = function() {
	this.i2c.writeTo({address:C.I2C_ADDRESS, stop:false}, C.OUT_G[0]);
	//this.i2c.writeTo({address:C.I2C_ADDRESS}, C.OUT_G[0]);
	var result = this.i2c.readFrom(C.I2C_ADDRESS, 12);
	var Res2 = new Int16Array(6);
	for (var i=0; i<6;i++)
	{
		Res2[i]=result[i*2]+result[i*2+1]*256;	
	}
	
	this.XL_X= (Res2[3]/16784);
	this.XL_Y= (Res2[4]/16784);
	this.XL_Z= (Res2[5]/16784);
	this.G_X = (Res2[0])/1142;
	this.G_Y = (Res2[1])/1142;
	this.G_Z = (Res2[2])/1142;
};

/** w 
 * write data to a register 
 */
LSM6DSL.prototype.w = function(addr, data) {
	this.i2c.writeTo(C.I2C_ADDRESS, addr, data);
};
