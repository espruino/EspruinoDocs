/* Copyright (c) 2016 Luwar. See the file LICENSE for copying permission. */

/**
 * Espruino module for MAG3110 - digital 3-axis magnetometer from NXP/Freescale connected by I2C
 */

/**
 * Creates a new MAG3110 sensor instance
 * @constructor
 * @struct
 * @param i2c Instance of the I2C Class, e.g. I2C1
 * @param options optional init options, currently only the I²C address, default 0x0E (MAG3110)
 *                The FXMS3110CD has the slave address 0x0f.
 */
function MAG3110(i2c, options) {
    this.i2c = i2c;
    this.address = (options && options.address) || 0x0E;
    // Check Device ID
    var deviceId = this.read8(MAG3110.WHO_AM_I);
    if (deviceId != 0xC4) {
        throw new Error("invalid device id");
    }
}

/**
 * Read the current operation mode from the sensor
 * The sensor is in standby operation mode after power on reset.
 * 0 .. standby
 * 1 .. active (RAW data)
 * 2 .. active (offset-corrected data)
 * @returns {number}
 */
MAG3110.prototype.getMode = function () {
    return this.read8(MAG3110.SYSMOD);
};

/**
 * Write the new operation mode to the sensor.
 * If you change into an active mode (raw or offset-corrected) then the automatic magnetic sensor reset will be disabled.
 * You have to enable this flag by calling setAutomaticMagneticReset(true) if required.
 * @param mode new operation mode
 *  0 .. standby
 *  1 .. active (RAW data)
 *  2 .. active (offset-corrected data)
 */
MAG3110.prototype.setMode = function (mode) {
    var value = this.read8(MAG3110.CTRL_REG1);
    if (mode === 0) {
        this.write8(MAG3110.CTRL_REG1, value & 0xfe); // clear AC bit
    }
    else {
        this.write8(MAG3110.CTRL_REG1, value | 1); // set AC bit
        this.write8(MAG3110.CTRL_REG2, mode === 1 ? 0x20 : 0); // clear or set RAW bit
    }
};

/**
 * Read the last measurement value from the sensor
 * The complements x,y and z from the different axis are in the range of
 * -30000 to +30000.
 * If the operation mode is 2 (active/offset-corrected data) the result
 * is the raw sensor data minus the configured offset.
 * If the operation mode is 1 (active/raw data) the configured offset will be ignored.
 * @returns {{x: number, y: number, z: number}}
 */
MAG3110.prototype.read = function () {
    this.i2c.writeTo(this.address, MAG3110.OUT_X_MSB);
    var d = this.i2c.readFrom(this.address, 6);
    return {
        x: MAG3110.fromTwoComplement(d[0], d[1]),
        y: MAG3110.fromTwoComplement(d[2], d[3]),
        z: MAG3110.fromTwoComplement(d[4], d[5])
    };
};

/**
 * Read the user offsets of the x-,y- and z-axis which are automatically subtracted
 * by the MAG3110 if the sensor is in active-mode with offset-corrected data (mode = 2).
 * Possible values are in the range from -10000 to +10000.
 * After POR all values are 0.
 * @returns {{x: number, y: number, z: number}} offset vector
 */
MAG3110.prototype.getOffset = function () {
    this.i2c.writeTo(this.address, MAG3110.OFF_X_MSB);
    var d = this.i2c.readFrom(this.address, 6);
    var x = (d[0] << 7) | (d[1] >> 1);
    var y = (d[2] << 7) | (d[3] >> 1);
    var z = (d[4] << 7) | (d[5] >> 1);
    return {
        // correct 2's complement
        x: (x & 0x4000) ? x - 0x8000 : x,
        y: (y & 0x4000) ? y - 0x8000 : y,
        z: (z & 0x4000) ? z - 0x8000 : z
    };
};

/**
 * Write new user offsets of the x, y and z-axis into the sensor
 * The values are not persistent (no EEPROM) and are lost after power down.
 * @param offset {{x: number, y: number, z: number}} new offset vector
 */
MAG3110.prototype.setOffset = function (offset) {
    var x = offset.x << 1;
    var y = offset.y << 1;
    var z = offset.z << 1;
    this.i2c.writeTo(this.address, [MAG3110.OFF_X_MSB, (x & 0xff00) >> 8, x & 0xff,
        (y & 0xff00) >> 8, y & 0xff, (z & 0xff00) >> 8, z & 0xff]);
};

/**
 * Starts one measurement in standby operation mode.
 * In standby mode triggered measurement will occur immediately and part will return to standby mode
 * as soon as the measurement is complete. The method can only be call in standby operation mode.
 * The sampling parameters will be set to 0 (max. OutputRate).
 */
MAG3110.prototype.triggerMeasurement = function () {
    if (this.getMode() != 0) {
        throw new Error("The device must be in STANDBY mode to trigger an immediate measurement.");
    }
    var value = this.read8(MAG3110.CTRL_REG1);
    value |= 0x02; // set TM bit
    this.write8(MAG3110.CTRL_REG1, value);
};

/**
 * Returns whether a new measurement available
 * @returns {boolean}
 */
MAG3110.prototype.isNewDataAvailable = function () {
    return !!(this.read8(MAG3110.DR_STATUS) & 0x8); // test bit ZYXDR
};

/**
 * Change the over-sampling ratio and the data rate of the sensor. Possible values are  in the range from 0 to 31.
 * 0: OutputRate: 80.00 Hz, Over Sample Ratio: 16, ADC Rate: 1280 Hz, Current: 900µA
 * 1: OutputRate: 40.00 Hz, ...
 * @param sampling Parameter index in the range from 0 to 31.
 */
MAG3110.prototype.setSamplingParams = function (sampling) {
    if (this.getMode() != 0) {
        throw new Error("Sample params can only be changed in STANDBY mode.");
    }
    var old = this.read8(MAG3110.CTRL_REG1);
    this.write8(MAG3110.CTRL_REG1, (old & 0x7) | (sampling << 3));
};

/**
 * Read the configured over-sampling ratio and data rate
 * Possible values are in the range 0 to 31.
 * See setSamplingParams(..) for more details.
 * @returns {number}
 */
MAG3110.prototype.getSamplingParams = function () {
    return this.read8(MAG3110.CTRL_REG1) >> 3;
};

/**
 * Read the die temperature in °C in the range from -40°C to 125°C.
 * The temperature data is updated on every measurement cycle.
 * The sensitivity of the temperature sensor is factory trimmed to 1°C but the absolute offset is NOT calibrated.
 * It must be calibrated by the user software if absolute accuracy is required.
 * @returns {number} temperatur in °C
 */
MAG3110.prototype.readTemperature = function () {
    var t = this.read8(MAG3110.DIE_TEMP);
    return (t & 0x80) ? t - 0x100 : t;
};

/**
 * Performs a manual magnetic sensor reset (One-Shot).
 * Initiates a magnetic sensor reset cycle that will restore correct operation after exposure to an excessive magnetic
 * field wich exceeds the Full Scale Range of +/-1000µT, e.g. near a speaker magnet.
 */
MAG3110.prototype.magneticReset = function () {
    var value = this.read8(MAG3110.CTRL_REG2);
    value |= 0x10; // set Mag_RST
    this.write8(MAG3110.CTRL_REG2, value);
};

/**
 * Set the automatic magentic reset flag.
 * If set the magnetic resets occur automatically before each data acquisition. If unset no automatic reset occurs.
 * The default value after power on reset is false (no automatic magnetic reset).
 * @param automatic true, if automatic magnetic reset before each measurement
 */
MAG3110.prototype.setAutomaticMagneticReset = function (automatic) {
    var old = this.read8(MAG3110.CTRL_REG2);
    this.write8(MAG3110.CTRL_REG2, automatic ? old | 0x80 : old & 0x7f);
};

//---------------------------------------------------------------------------------------------------------
// Helper methods
//---------------------------------------------------------------------------------------------------------
// Internal API: Read one byte from register reg
MAG3110.prototype.read8 = function (reg) {
    this.i2c.writeTo(this.address, reg);
    var d = this.i2c.readFrom(this.address, 1);
    return d[0];
};

// Internal API: Write one byte value to register reg
MAG3110.prototype.write8 = function (reg, value) {
    this.i2c.writeTo(this.address, [reg, value]);
};

// Internal API: convert from two 8-bit 2's complement
MAG3110.fromTwoComplement = function (msb, lsb) {
    var t = msb << 8 | lsb;
    return t & 0x8000 ? t - 0x10000 : t; // correct 2's complement
};

// Internal registers
/** @const */ MAG3110.DR_STATUS = 0x00;
/** @const */ MAG3110.OUT_X_MSB = 0x01;
/** @const */ MAG3110.WHO_AM_I = 0x07;
/** @const */ MAG3110.SYSMOD = 0x08;
/** @const */ MAG3110.OFF_X_MSB = 0x09;
/** @const */ MAG3110.DIE_TEMP = 0x0f;
/** @const */ MAG3110.CTRL_REG1 = 0x10;
/** @const */ MAG3110.CTRL_REG2 = 0x11;

exports.connect = function (i2c, options) { return new MAG3110(i2c, options); };
