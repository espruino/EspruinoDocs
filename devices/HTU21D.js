/* Copyright (c) 2014 Tom Gidden, 2015 Luwar. See the file LICENSE for copying permission. */

/**
 * HTU21D humidity and temperature sensor from Measurement Specialties
 */
var HTU21D = (function () {

    /**
     * Creates a new HTU21D sensor instance
     * @param i2c Instance of the I2C Class, e.g. I2C1
     */
    function HTU21D( i2c ) {
        this.i2c = i2c;

        // Possible resolutions
        this.RH_12_BITS_TEMP_14_BITS = 0x0; // Default after reset
        this.RH_8_BITS_TEMP_12_BITS = 0x1;
        this.RH_10_BITS_TEMP_13_BITS = 0x2;
        this.RH_11_BITS_TEMP_11_BITS = 0x3;

        this.i2cAddress = 0x40;

        // ID of the measuring timer, if asynchronous measuring  with getTemperature() or getHumidity()) is in progress.
        // null, if there is no current asynchronous meauring
        this.measuringTimerId = null;

        this.softReset(); // Soft reset is recommended at start according to the datasheet.
    }

    /**
     * returns if an asynchronous measuring triggered by getHumidity() or getTemperature() is in progress
     * @returns {boolean}
     */
    HTU21D.prototype.isMeasuring = function () {
        return !!this.measuringTimerId;
    };

    //------------------------------------------------------------------------------------------------------------------
    // Read Temperature (synchonous / asynchonous)
    //------------------------------------------------------------------------------------------------------------------

    /**
     * Read the temperature in °C from the sensor
     * This synchronous operation blocks the i2c bus until the measurement is completed.-It takes
     * at most 50 ms with with 14 bits resolution.
     * @returns {number}
     */
    HTU21D.prototype.readTemperature = function () {
        this.verifyNotMeasuring();
        this.writeCommand( HTU21D.CMD_TEMPERATURE_MEASUREMENT_HOLD_MASTER );
        return -46.85 + 175.72 * this.readMeasuredData() / 65536;
    };

    /**
     * Starts an asynchronous temperature measuring
     * Until the measuring is completed no other command can be send to the sensor!
     * @param callback function( temperature: number ) { ..} will be called with the temperature result
     */
    HTU21D.prototype.getTemperature = function ( callback ) {
        var _this = this;
        this.verifyNotMeasuring();
        // Measure time depends on the configured resolution.
        var waitMillis = HTU21D.mapResolution2TemperatureMeasurementTime[this.getResolution()];
        this.writeCommand( HTU21D.CMD_TEMPERATURE_MEASUREMENT_NO_HOLD_MASTER );
        this.measuringTimerId = setTimeout( function () {
            _this.measuringTimerId = null;
            callback( -46.85 + (175.72 * _this.readMeasuredData() / 65536) );
        }, waitMillis );
    };

    //------------------------------------------------------------------------------------------------------------------
    // Read Humidity (synchonous / asynchonous)
    //------------------------------------------------------------------------------------------------------------------

    /**
     * Read the relative humidity in % from the sensor
     * This synchronous operation blocks the i2c bus until the measurement is completed. It takes at most 16 ms with 12 bits resolution.
     * @returns {number}
     */
    HTU21D.prototype.readHumidity = function () {
        this.verifyNotMeasuring();
        this.writeCommand( HTU21D.CMD_HUMIDITY_MEASUREMENT_HOLD_MASTER );
        return -6 + 125 * this.readMeasuredData() / 65536;
    };

    /**
     * Starts an asynchronous humidity measuring
     * Until the measuring is completed no other command can be send to the sensor!
     * @param callback function( humidity: number ) {..} will be called with the humidity result
     */
    HTU21D.prototype.getHumidity = function ( callback ) {
        var _this = this;
        this.verifyNotMeasuring();
        // Measure time depends on the configured resolution.
        var waitMillis = HTU21D.mapResolution2HumidityrMeasurementTime[this.getResolution()];
        this.writeCommand( HTU21D.CMD_HUMIDITY_MEASUREMENT_NO_HOLD_MASTER );
        this.measuringTimerId = setTimeout( function () {
            _this.measuringTimerId = null;
            callback( -6 + (125 * _this.readMeasuredData() / 65536) );
        }, waitMillis );
    };

    /**
     * Calculates the temperature compensated humidity
     * The temperature measured with getHumidity() and readHumidity() is a little bit temperature dependent. With
     * getCompensatedHumidity() it is possible to reduce/compensate the dependency and get a more accurate value.
     * @param humidity Measured sensor value get from getHumidity() or readHumidity()
     * @param temperature Current Temperature from getTemperature() or readTemperature() or any other sensor
     * @returns {number} Humidity in %
     */
    HTU21D.prototype.getCompensatedHumidity = function ( humidity, temperature ) {
        return humidity + (25 - temperature) * -0.15;
    };

    /**
     * Calculate the dew point in dependency on the temperature and the humidity.
     * The dew point is the temperature at which the water vapor in the air becomes saturated (RH = 100%) and condensation begins.
     * @param temperature Temperature in °C
     * @param relativeHumidity Relative Humidity in %
     * @returns {number} Dew point in °C
     */
    HTU21D.prototype.getDewPoint = function ( temperature, relativeHumidity ) {
        var C = 235.66; // Constant from the datasheet
        return 1 / (1 / (temperature + C) + (2 - Math.log( relativeHumidity ) / Math.LN10) / 1762.39) - C;
    };

    /**
     * softReset() reboots the sensor by switching the power off and on again.
     * The soft reset takes less than 15ms. The resolution will be set to the highest resolution (RH_12_BITS_TEMP_14_BITS).
     * The internal heater will be turned off.
     */
    HTU21D.prototype.softReset = function () {
        this.verifyNotMeasuring();
        this.writeCommand( HTU21D.CMD_SOFT_RESET ); // Sensor will be ready after 15 ms.
    };

    //------------------------------------------------------------------------------------------------------------------
    // Resolution
    //------------------------------------------------------------------------------------------------------------------

    /**
     * read the current configured sensor resolution
     * @returns {number} Possible return values are:
     *   0 = RH_12_BITS_TEMP_14_BITS .. humidity: 12 bits resolution, temperature: 14 bits resolution
     *   1 = RH_8_BITS_TEMP_12_BITS  .. humidity:  8 bits resolution, temperature: 12 bits resolution
     *   2 = RH_10_BITS_TEMP_13_BITS .. humidity: 10 bits resolution, temperature: 13 bits resolution
     *   3 = RH_11_BITS_TEMP_11_BITS .. humidity: 11 bits resolution, temperature: 11 bits resolution
     */
    HTU21D.prototype.getResolution = function () {
        this.verifyNotMeasuring();
        // Move bit 7 to bit 1
        var reg = this.readUserRegister() & 0x81;
        return reg & 0x80 ? (reg | 0x2) & 0x3 : (reg & ~0x2) & 0x3;
    };

    /**
     * Set a new sensor resolution
     * The resolution of the temperature and humidity sensor cannot set independently.
     * @param resolution New sensor resolution. Possible values are documented under getResolution()
     */
    HTU21D.prototype.setResolution = function ( resolution ) {
        this.verifyNotMeasuring();
        this.writeCommand( HTU21D.CMD_READ_USER_REGISTER );
        var reg = this.read8();
        // Move bit 1 to bit 7
        reg &= ~0x81; // Clear Bit 0 and 7
        if (resolution & 0x2) {
            reg |= 0x80;
        }
        reg |= (resolution & 0x1);
        this.i2c.writeTo( this.i2cAddress, [HTU21D.CMD_WRITE_USER_REGISTER, reg] );
    };

    //------------------------------------------------------------------------------------------------------------------
    // End of Battery Status
    //------------------------------------------------------------------------------------------------------------------

    /**
     * Get the "End of Battery" status
     * The “End of Battery” alert/status is activated when the battery power falls below 2.25V.
     * @returns {boolean} true, if the power voltage falls below 2.25V, otherwise false
     */
    HTU21D.prototype.isEndOfBattery = function () {
        this.verifyNotMeasuring();
        return !!(this.readUserRegister() & 0x40);
    };

    //------------------------------------------------------------------------------------------------------------------
    // Heater support
    //------------------------------------------------------------------------------------------------------------------

    /**
     * Returns is the internal heater is switched on
     * @returns {boolean}
     */
    HTU21D.prototype.isHeaterOn = function () {
        this.verifyNotMeasuring();
        return !!(this.readUserRegister() & 0x04);
    };

    /**
     * Change the state of the internal heater.
     * @param on Status of the heater after this operation. true means "heater on" and false means "heater off".
     */
    HTU21D.prototype.setHeaterOn = function ( on ) {
        this.verifyNotMeasuring();
        this.writeCommand( HTU21D.CMD_READ_USER_REGISTER );
        var reg = this.read8();
        reg = on ? (reg | 0x04) : reg & ~0x04; // set or clear bit 2
        this.i2c.writeTo( this.i2cAddress, [HTU21D.CMD_WRITE_USER_REGISTER, reg] );
    };

    //------------------------------------------------------------------------------------------------------------------
    // Serial Number
    //------------------------------------------------------------------------------------------------------------------

    /**
     * Get the unique internal 32 bit serial number of the sensor.
     * Each HTU21D has an unique serial number which consists of 8 bytes at all. 4 Bytes are common/fixed for all HTU21D sensors.
     * The other (unique) part will be returned by this operation.
     * The complete serial number has 64 bit with 4 fixed bytes which will be not returned.
     * @returns {number} 4 Bytes Unique serial number
     */
    HTU21D.prototype.getSerialNumber = function () {
        this.verifyNotMeasuring();
        this.i2c.writeTo( this.i2cAddress, [0xfa, 0x0f] );
        var d = this.i2c.readFrom( this.i2cAddress, 8 );
        this.i2c.writeTo( this.i2cAddress, [0xfc, 0xc9] );
        var e = this.i2c.readFrom( this.i2cAddress, 6 );
        // Check CRC
        HTU21D.checkCrc( d[0], d[1] );
        HTU21D.checkCrc( d[2], d[3] );
        HTU21D.checkCrc( d[4], d[5] );
        HTU21D.checkCrc( (e[0] << 8) + e[1], e[2] );
        // Common/Fixed bytes for all HTU21D sensors
        if (e[3] !== 0x48 || e[4] !== 0x54 || d[0] !== 0x00 || e[0] !== 0x32) {
            throw new Error( "Invalid Serial Number" );
        }
        return (d[2] << 24) | (d[4] << 16) | (d[6] << 8) | e[1];
    };

    //------------------------------------------------------------------------------------------------------------------
    // Internal helper methods
    //------------------------------------------------------------------------------------------------------------------

    // Writes one byte to the i2c sensor
    HTU21D.prototype.writeCommand = function ( value ) {
        this.i2c.writeTo( this.i2cAddress, value );
    };

    // Reads one byte from the i2c sensor
    HTU21D.prototype.read8 = function () {
        return this.i2c.readFrom( this.i2cAddress, 1 )[0];
    };

    // Read the value of the user register
    HTU21D.prototype.readUserRegister = function () {
        this.writeCommand( HTU21D.CMD_READ_USER_REGISTER );
        return this.read8();
    };

    // Ensures that the sensor is not busy and no asynchonous operation is currently executed
    // Otherwise an Error exception will be thrown.
    HTU21D.prototype.verifyNotMeasuring = function () {
        if (this.measuringTimerId) {
            throw new Error( "Sensor is measuring." );
        }
    };

    HTU21D.prototype.readMeasuredData = function () {
        var d = this.i2c.readFrom( this.i2cAddress, 3 );
        var raw = (d[0] << 8) | d[1];
        HTU21D.checkCrc( raw, d[2] ); // d[2] is the crc value from the sensor.
        return raw & 0xfffc;
    };

    /**
     * CRC with I²C protocol
     *  - Generator polynomial: x^8 + x^5 + x^4 + 1 → 0x131
     *  - Initialization      : 0x00
     *  - Protected data      : Read data (2 Bytes)
     *  - Final Operation     : none
     */
    HTU21D.checkCrc = function ( value, receivedCrc ) {
        var dividend = value << 8 | receivedCrc; // append crc value
        var pattern = 1 << 23;
        for (var i = 0; i < 16; ++i) {
            if (dividend & pattern) {
                dividend ^= 0x988000; // = 0x131 << 15, so that x^8 corresponds to the MSB of dividend
            }
            dividend <<= 1;
        }
        if (dividend) {
            throw new Error( "CRC Error" );
        }
    };

    /*
     * Possible Values are:
     * Bit 7    Bit 0    RH         Measuring Time  Temperature Measuring Time
     * 0        0        12 bits    max. 16 ms      14 bits     50 ms
     * 0        1         8 bits    max.  3 ms      12 bits     13 ms
     * 1        0        10 bits    max.  5 ms      13 bits     25 ms
     * 1        1        11 bits    max.  8 ms      11 bits      7 ms
     */

    // Mapping between the resolution and the required measuring time in milliseconds
    HTU21D.mapResolution2TemperatureMeasurementTime = [50, 13, 25, 7];
    HTU21D.mapResolution2HumidityrMeasurementTime = [16, 3, 5, 8];

    // Internal Sensor Commands
    HTU21D.CMD_TEMPERATURE_MEASUREMENT_HOLD_MASTER = 0xe3;
    HTU21D.CMD_HUMIDITY_MEASUREMENT_HOLD_MASTER = 0xe5;
    HTU21D.CMD_TEMPERATURE_MEASUREMENT_NO_HOLD_MASTER = 0xF3;
    HTU21D.CMD_HUMIDITY_MEASUREMENT_NO_HOLD_MASTER = 0xf5;
    HTU21D.CMD_WRITE_USER_REGISTER = 0xe6;
    HTU21D.CMD_READ_USER_REGISTER = 0xe7;
    HTU21D.CMD_SOFT_RESET = 0xfe;

    return HTU21D;
})();

exports.connect = function ( i2c ) {
    return new HTU21D( i2c );
};
