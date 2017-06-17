/* Copyright (C) 2017 Joachim Klein. See the file LICENSE for copying permission. */
/*
This module interfaces with Vishay VCNL4020. 
The API is similar to the API in the Vishay examples.
It should be easy to use the Vishay examples to implement any kind of applicaiton.

Connection:

To use the VCNL4020 only a i2c Interface ist required. Data rate might be setup to 100kHz.

For more information please read the module description.

*/

/** Addresses of the control registers */
var C = {
	
	I2C_ADDRESS: 0x13,

	CommandRegister : 0x80,
	PRODUCT_ID_REVISION : 0x81,
	PROXIMITY_RATE	: 0x82,
	IR_LED_CURRENT : 0x83,
	AMBIENT_LIGHT_PARAMETER	: 0x84,
	AMBIENT_LIGHT_RESULT : [0x85, 0x86],
	PROXIMITY_RESULT : [0x87, 0x88],
	INTERRUPT_CONTROL : 0x89,
	LOW_THRESHOLD : [0x8A, 0x8B],
	HIGH_THRESHOLD : [0x8C, 0x8D],
	INTERRUPT_STATUS : 0x8E,
	PROXIMITY_MODULATOR_TIMING : 0x8F
};

function VCNL4020( i2c ) {
	this.i2c=i2c;
}

exports.connect = function(vcnl_i2c) {
	return new VCNL4020(vcnl_i2c);
};

VCNL4020.prototype.SetCommandRegister = function ( mCommand ) {
	this.w(C.CommandRegister, mCommand);
}

VCNL4020.prototype.ReadCommandRegister = function () {
	return this.r(C.CommandRegister);
}

VCNL4020.prototype.ReadID = function () {
	return this.r(C.PRODUCT_ID_REVISION);
}

VCNL4020.prototype.SetCurrent = function ( Current ) {
	this.w(C.IR_LED_CURRENT, Current);
}
VCNL4020.prototype.ReadCurrent = function ( ) {
	return this.r(C.IR_LED_CURRENT);
}

VCNL4020.prototype.SetProximityRate = function (ProximityRate) {
	this.w(C.PROXIMITY_RATE, ProximityRate);
}

VCNL4020.prototype.SetAmbiConfiguration = function (AmbiConfiguration) {
	this.w(C.AMBIENT_LIGHT_PARAMETER, AmbiConfiguration);
}

VCNL4020.prototype.SetInterruptControl = function (InterruptControl) {
	this.w(C.INTERRUPT_CONTROL, InterruptControl);
}

VCNL4020.prototype.ReadInterruptControl = function ( ) {
	return this.r(C.INTERRUPT_CONTROL);
}

VCNL4020.prototype.SetInterruptStatus = function ( InterruptStatus ) {
	this.w(C.INTERRUPT_STATUS, InterruptStatus);
}

VCNL4020.prototype.SetModulatorTimingAdjustment = function (ModulatorTimingAdjustment) {
	this.w(C.PROXIMITY_MODULATOR_TIMING, ModulatorTimingAdjustment);
}

VCNL4020.prototype.ReadInterruptStatus = function ( ) {
	return this.r(C.INTERRUPT_STATUS);
}

VCNL4020.prototype.ReadProxiValue = function ( ) {
	return this.r2(C.PROXIMITY_RESULT[0]);
}

VCNL4020.prototype.ReadAmbiValue = function ( ) {
	return this.r2(C.AMBIENT_LIGHT_RESULT[0]);
}

VCNL4020.prototype.SetLowThreshold = function ( LowThreshold ) {
	var	LoByte=0;
	var	HiByte=0;
	LoByte = (LowThreshold & 0x00ff);
	HiByte = ((LowThreshold & 0xff00)>>8);
	this.w(C.LOW_THRESHOLD[0], HiByte);
	this.w(C.LOW_THRESHOLD[1], LoByte);
}

VCNL4020.prototype.SetHighThreshold = function (HighThreshold) {
	var	LoByte=0;
	var	HiByte=0;
	LoByte = (HighThreshold & 0x00ff);
	HiByte = ((HighThreshold & 0xff00)>>8);
	this.w(C.HIGH_THRESHOLD[0], HiByte);
	this.w(C.HIGH_THRESHOLD[1], LoByte);
}

/** Bits in Command register (0x80) */
var DEF = {
	CMD_ALL_DISABLE : (0x00),
	CMD_SELFTIMED_MODE_ENABLE : (0x01),
	CMD_PROX_ENABLE : (0x02),
	CMD_AMBI_ENABLE : (0x04),
	CMD_PROX_ON_DEMAND : (0x08),
	CMD_AMBI_ON_DEMAND : (0x10),
	CMD_MASK_PROX_DATA_READY : (0x20),
	CMD_MASK_AMBI_DATA_READY : (0x40),
	CMD_MASK_LOCK : (0x80)
};

VCNL4020.prototype.ReadProxiOnDemand = function () {
	var Command=0;
	var Result = 0;
	
	this.SetCommandRegister (DEF.CMD_PROX_ENABLE | DEF.CMD_PROX_ON_DEMAND);
	// wait on prox data ready bit
	do {
		Command = this.ReadCommandRegister (); 
	} while (!(Command & DEF.CMD_MASK_PROX_DATA_READY));
	Result = this.ReadProxiValue (); 
	this.SetCommandRegister (DEF.CMD_ALL_DISABLE); 
	return Result;
}

VCNL4020.prototype.ReadAmbiOnDemand = function ( ) {
	var Command=0;
	var Result = 0;
	
	this.SetCommandRegister (DEF.CMD_PROX_ENABLE | DEF.CMD_AMBI_ON_DEMAND);
	
	do {
		Command = this.ReadCommandRegister (); 
	} while (!(Command & DEF.CMD_MASK_AMBI_DATA_READY));
	
	Result = this.ReadAmbiValue (); 
	this.SetCommandRegister (DEF.CMD_ALL_DISABLE); 
	return Result;
}

/** logReg
* Dump all Control registers 
*/
VCNL4020.prototype.logReg = function () {
	var cl = console.log;
	cl("CommandRegister: " + this.ReadCommandRegister().toString(16));
	cl("PRODUCT_ID_REVISION: " + this.ReadID().toString(16));
	cl("PROXIMITY_RATE: " + this.r(C.PROXIMITY_RATE).toString(16));
	cl("IR_LED_CURRENT: " + this.ReadCurrent().toString(16));
	cl("AMBIENT_LIGHT_PARAMETER: " + this.r(C.AMBIENT_LIGHT_PARAMETER).toString(16));
	cl("AMBIENT_LIGHT_RESULT: " + this.ReadAmbiValue() );
	cl("PROXIMITY_RESULT: " + this.ReadProxiValue() );	
	cl("INTERRUPT_CONTROL: " + this.r(C.INTERRUPT_CONTROL).toString(16));
	cl("LOW_THRESHOLD: " + this.r2(C.LOW_THRESHOLD[0]));	
	cl("HIGH_THRESHOLD: " + this.r2(C.HIGH_THRESHOLD[0]));	
	cl("INTERRUPT_STATUS: " + this.ReadInterruptStatus().toString(16));
	cl("PROXIMITY_MODULATOR_TIMING: " + this.r(C.PROXIMITY_MODULATOR_TIMING).toString(16));
}


/********************
 * Support functions
 */
/** r
 * read one byte of data from a register.
 */
VCNL4020.prototype.r = function(addr) {
	this.i2c.writeTo({address:C.I2C_ADDRESS, stop:false}, 0x80 | addr);
	var result = this.i2c.readFrom(C.I2C_ADDRESS, 1);
	return result[0];
};

/** r2 
 * reading two bytes will read two consecutive registers! 
 */
VCNL4020.prototype.r2 = function(addr) {
	this.i2c.writeTo({address:C.I2C_ADDRESS, stop:false}, 0x80 | addr);
	var result = this.i2c.readFrom(C.I2C_ADDRESS, 2);
	return (result[0]*256+result[1]);
};

/** w 
 * write data to a register 
 */
VCNL4020.prototype.w = function(addr, data) {
	this.i2c.writeTo(C.I2C_ADDRESS, addr, data);
};
