/* Copyright (C) 2015 Luwar. See the file LICENSE for copying permission. */

/*
 MCP9808 precision I2C temperature sensor from Microchip
 */


/* Module constants*/
var C = {
    I2CADDR_BASE: 0x18,
    // Registers
    // RFU, Reserved for Future Use: 0x00,
    REG_CONFIG: 0x01,
    REG_T_UPPER: 0x02,
    REG_T_LOWER: 0x03,
    REG_T_CRITICAL: 0x04,
    REG_TEMPERATURE: 0x05,
    REG_MANUFACTURER_ID: 0x06,
    REG_DEVICE_ID_REVISION: 0x07,
    REG_RESOLUTION: 0x08
};

/**
 * Create a new MCP9808 sensor
 * @param i2c   I2C instance
 * @param a2a1a0Pins optional configuration of the address pin A2 A1 A0, e.g. 0b101
 *                   0b00 if omitted
 */
function MCP9808( i2c, a2a1a0Pins ) {
    this.i2c = i2c;

    // calculate I2C address from base address and selected pins A0, A1, A2
    this.i2cAddress = C.I2CADDR_BASE | ((a2a1a0Pins || 0) & 0x07);

    // read and check manufacturer id
    if (this.read16( C.REG_MANUFACTURER_ID ) !== 0x54) {
        throw Error( "Invalid Manufacturer ID" );
    }

    // read and check device id and revision
    var deviceIdRevision = this.read16( C.REG_DEVICE_ID_REVISION );
    if ((deviceIdRevision & 0xff00) !== 0x0400) {
        throw Error( "Invalid Device ID" );
    }
    // deviceIdRevision & 0xff == chip revision, but until now it is always 0.
}

/**
 * returns the current sensor resolution as enum
 *     MCP9808.RESOLUTION_0_5_CELSIUS   0.5°C,    approx.  30 ms
 *     MCP9808.RESOLUTION_0_25_CELSIUS  0.25°C,   approx.  65 ms
 *     RESOLUTION_0_125_CELSIUS         0.125°C,  approx. 130 ms
 *     RESOLUTION_0_0625_CELSIUS        0.0615°C  approx. 250 ms
 */
MCP9808.prototype.getResolution = function () {
    return this.read8( C.REG_RESOLUTION );
};

/**
 * set the current sensor resolution
 * Allowed values are:
 *     MCP9808.RESOLUTION_0_5_CELSIUS   0.5°C,    approx.  30 ms
 *     MCP9808.RESOLUTION_0_25_CELSIUS  0.25°C,   approx.  65 ms
 *     RESOLUTION_0_125_CELSIUS         0.125°C,  approx. 130 ms
 *     RESOLUTION_0_0625_CELSIUS        0.0615°C  approx. 250 ms
 */
MCP9808.prototype.setResolution = function ( resolution ) {
    this.write8( C.REG_RESOLUTION, resolution & 0x03 );
};

/**
 * return the temperature in °C
 */
MCP9808.prototype.getTemperature = function () {
    return MCP9808.rawToCelsius( this.read16( C.REG_TEMPERATURE ) & 0x1fff );
};

//------------------------------------------------------------------------------------------------------------------
// Power Management
//------------------------------------------------------------------------------------------------------------------

/**
 * return whether the sensor is running or in power down mode
 * true if the sensor is running
 */
MCP9808.prototype.isRunning = function () {
    return !(this.read16( C.REG_CONFIG ) & 0x100);
};

/**
 * wakeup the sensor from power down mode
 */
MCP9808.prototype.wakeup = function () {
    var value = this.read8( C.REG_CONFIG );
    value &= 0xfe;
    this.write8( C.REG_CONFIG, value );
};

/**
 * Set the sensor in power down mode
 * The temperature can be read but will not be updated anymore.
 */
MCP9808.prototype.shutdown = function () {
    var value = this.read8( C.REG_CONFIG );
    this.write8( C.REG_CONFIG, value | 1 );
};

//------------------------------------------------------------------------------------------------------------------
// Alert Management
//------------------------------------------------------------------------------------------------------------------

/**
 * returns whether a configured limit temperature (lower, upper, critical) is reached
 * {
 *     aboveCriticalLimit: true/false,
 *     aboveUpperLimit: true/false,
 *     belowLowerLimit: true7false
 * }
 */
MCP9808.prototype.getAlertStatus = function () {
    var raw = this.read8( C.REG_TEMPERATURE );
    return {
        aboveCriticalLimit: !!(raw & 0x80),
        aboveUpperLimit: !!(raw & 0x40),
        belowLowerLimit: !!(raw & 0x20)
    };
};

/**
 * get the hysteresis for alerts in °C
 * If an alert has triggered and alert mode is CHECK_ALL_LIMITS_COMPARATOR or CHECK_CRITICAL_LIMIT
 * the current temperature must below the limit temperature minus hysteresis.
 * This avoids the flickering of the ALERT pin when temperature is around a configured limit temperature.
 *
 * Only 4 different values are supported. Possible return values would be
 *   0.0°C, 1.5°C, 3.0°C or 6.0°C.
 **/
MCP9808.prototype.getHysteresis = function () {
    var shift = (this.read8( C.REG_CONFIG ) & 0x6) >> 1;
    var table = [0.0, 1.5, 3.0, 6.0];
    return table[shift];
};

/**
 * set the hysteresis for alerts in °C
 * Only 4 different values are supported: 0.0°C, 1.5°C, 3.0°C or 6.0°C.
 */
MCP9808.prototype.setHysteresis = function ( celsius ) {
    var table = {0: 0, 1.5: 2, 3: 4, 6: 6};
    var bits = table[celsius];
    // possible bug in espruino: var a = 0; typeof(a) → "undefined"
    if (typeof bits === "undefined" && bits !== 0) {
        console.log( "Invalid hysteresis " + celsius + ", only 0°C, 1.5°C, 3.0°C or 6.0°C allowed." );
        return;
    }
    this.write8( C.REG_CONFIG, (this.read8( C.REG_CONFIG ) & 0xf9) | bits );
};

//------------------------------------------------------------------------------------------------------------------
// Alert Output Polarity
//------------------------------------------------------------------------------------------------------------------

/**
 * returns whether the ALERT pin goes high or low when an temperature alert occurs.
 * returns true is the ALERT pin goes high when an temperature alert occurs.

 * Hint: The ALERT pin is an open-drain-output. At least a pull-up resistor is required!
 */
MCP9808.prototype.isAlertHighActive = function () {
    return !!(this.read16( C.REG_CONFIG ) & 0x2);
};

/**
 * set the output polarity of the ALERT pin
 *   true - the ALERT pin goes high when ALERT occurs
 *   false - the ALERT pin goes low when ALERT occurs
 *
 * Hint: The ALERT pin is an open-drain-output. At least a pull-up resistor is required!
 */
MCP9808.prototype.setAlertHighActive = function ( highActive ) {
    this.write16( C.REG_CONFIG, (0xfffd & this.read16( C.REG_CONFIG )) | (highActive ? 2 : 0) );
};

//------------------------------------------------------------------------------------------------------------------
// Alert Mode
//------------------------------------------------------------------------------------------------------------------
/**
 * If the sensor is in alert mode MCP9808.CHECK_ALL_LIMITS_INTERRUPT then the alert will not
 * disapper when the temperature is in a valid range again.
 * Only a call the clearInterrupt() will reset the alert.
 */
MCP9808.prototype.clearInterrupt = function () {
    var value = this.read16( C.REG_CONFIG );
    value |= 0x20; // Set Bit 5: Interrupt Clear bit
    this.write16( C.REG_CONFIG, value );
};

/**
 * get the configured alert mode. Possible return values are
 *   MCP9808.DISABLED
 *   MCP9808.CHECK_ALL_LIMITS_COMPARATOR
 *   MCP9808.CHECK_ALL_LIMITS_INTERRUPT
 *   MCP9808.CHECK_CRITICAL_LIMIT
 */
MCP9808.prototype.getAlertMode = function () {
    var config = this.read16( C.REG_CONFIG );
    if (config & 0x0008) {
        if (config & 0x0004) {
            return MCP9808.CHECK_CRITICAL_LIMIT;
        }
        else if (config & 0x0001) {
            return MCP9808.CHECK_ALL_LIMITS_INTERRUPT;
        }
        else {
            return MCP9808.CHECK_ALL_LIMITS_COMPARATOR;
        }
    }
    else {
        return MCP9808.DISABLED;
    }
};

/**
 * set the alert mode, Allowed values . Possible are
 *   MCP9808.DISABLED
 *   MCP9808.CHECK_ALL_LIMITS_COMPARATOR
 *   MCP9808.CHECK_ALL_LIMITS_INTERRUPT
 *   MCP9808.CHECK_CRITICAL_LIMIT
 */
MCP9808.prototype.setAlertMode = function ( mode ) {
    var config = this.read16( C.REG_CONFIG );
    this.write16( C.REG_CONFIG, (config & 0xfff2) | (mode & 0xd) );
};

/**
 * returns if a configure temperature alert has occured
 */
MCP9808.prototype.hasAlert = function () {
    return !!(this.read16( C.REG_CONFIG ) & 0x10);
};

//------------------------------------------------------------------------------------------------------------------
// Limits and Critical Temperatures
//------------------------------------------------------------------------------------------------------------------

/**
 * get the lower temperature limit to trigger an alert
 * The default value after reset is 0°C.
 */
MCP9808.prototype.getAlertLowerLimit = function () {
    return MCP9808.rawToCelsius( this.read16( C.REG_T_LOWER ) );
};

/**
 * Set the lower temperature limit to trigger an alert.
 * @param temperature lower limit in celsius
 */
MCP9808.prototype.setAlertLowerLimit = function ( temperature ) {
    this.write16( C.REG_T_LOWER, MCP9808.celsiusToRaw( temperature ) );
};

/**
 * get the upper temperature limit to trigger an alert
 * The default value after reset is 0°C.
 */
MCP9808.prototype.getAlertUpperLimit = function () {
    return MCP9808.rawToCelsius( this.read16( C.REG_T_UPPER ) );
};

/**
 * Set the upper temperature limit to trigger an alert.
 * @param temperature upper limit in celsius
 */
MCP9808.prototype.setAlertUpperLimit = function ( temperature ) {
    this.write16( C.REG_T_UPPER, MCP9808.celsiusToRaw( temperature ) );
};

/**
 * get the critical temperature limit to trigger an alert
 * The default value after reset is 0°C.
 */
MCP9808.prototype.getAlertCriticalLimit = function () {
    return MCP9808.rawToCelsius( this.read16( C.REG_T_CRITICAL ) );
};

/**
 * Set the critical temperature limit to trigger an alert.
 * @param temperature critical limit in celsius
 */
MCP9808.prototype.setAlertCriticalLimit = function ( temperature ) {
    this.write16( C.REG_T_CRITICAL, MCP9808.celsiusToRaw( temperature ) );
};

//------------------------------------------------------------------------------------------------------------------
// Internal Helper Functions
//------------------------------------------------------------------------------------------------------------------
/**
 * Utility function to convert from the sensor temperature representation
 * (two complement, resolution 1/16) to a JavaScript number in °C.
 */
MCP9808.rawToCelsius = function ( raw ) {
    return raw & 0x1000 ? (raw & 0xefff) / 16.0 - 256 : raw / 16.0;
};

/**
 * Utility function to convert from °C to the intern sensor temperature representation.
 */
MCP9808.celsiusToRaw = function ( celsius ) {
    return celsius < 0 ? (16.0 * celsius + 4096) | 0x1000 : 16.0 * celsius;
};

// Read 1 byte from register reg
MCP9808.prototype.read8 = function ( reg ) {
    this.i2c.writeTo( this.i2cAddress, reg );
    return this.i2c.readFrom( this.i2cAddress, 1 )[0];
};

// Read two  bytes from register reg and combine to unsigned integer
MCP9808.prototype.read16 = function ( reg ) {
    this.i2c.writeTo( this.i2cAddress, reg );
    var array = this.i2c.readFrom( this.i2cAddress, 2 );
    return (array[0] << 8) | array[1];
};

// Write one byte (value) to register reg
MCP9808.prototype.write8 = function ( reg, value ) {
    this.i2c.writeTo( this.i2cAddress, [reg, value] );
};

// Write an unsigned integer value (two bytes) to register reg
MCP9808.prototype.write16 = function ( reg, value ) {
    this.i2c.writeTo( this.i2cAddress, [reg, value >> 8, value & 0xff] );
};

//------------------------------------------------------------------------------------------------------------------
// Resolution Options
//------------------------------------------------------------------------------------------------------------------
MCP9808.RESOLUTION_0_5_CELSIUS = 0; // 0.5°C,    ca.  30 ms
MCP9808.RESOLUTION_0_25_CELSIUS = 1; // 0.25°C,   ca.  65 ms
MCP9808.RESOLUTION_0_125_CELSIUS = 2; // 0.125°C   ca. 130 ms
MCP9808.RESOLUTION_0_0625_CELSIUS = 3; // 0.0615°C, ca. 250 ms

//------------------------------------------------------------------------------------------------------------------
// Alert Modes
//------------------------------------------------------------------------------------------------------------------

// ALERT Pin unused
MCP9808.DISABLED = 0;

// Activates ALERT if at least one configured temperature limit exceed
// Deactives ALERT if all configure temperature limits hold with respect to the configured hysteresis.
MCP9808.CHECK_ALL_LIMITS_COMPARATOR = 0x8; //

// Activates ALERT if at least one configured temperature limit exceed
// No automatic deactivation - a call to clearInterrupt() required
MCP9808.CHECK_ALL_LIMITS_INTERRUPT = 0x9;

// Active ALERT if temperature is above the configured critical temperature.
// Deactivates ALERT if the ciritcal temperature goes below the current temperature with respect to the configured hysteresis.
MCP9808.CHECK_CRITICAL_LIMIT = 0xc;


exports.connect = function ( /*=I2C*/ i2c, a2a1a0Pins ) {
    return new MCP9808( i2c, a2a1a0Pins );
};
