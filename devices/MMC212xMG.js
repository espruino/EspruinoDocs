/* Copyright (c) 2015 Luwar. See the file LICENSE for copying permission. */
/**
 * Dual-axis Magnetic Sensor with I²C from MEMSIC
 * Used in breakout HDMM01 from Pollin
 */

    /**
     * Creates a new MMC212x sensor instance
     * @constructor
     * @param i2c Instance of the I2C Class, e.g. I2C1
     * @param i2cAddress optional alternate I²C address, default 0x30
     */
function MMC212x( i2c, i2cAddress ) {
    this.i2c = i2c;
    this.i2cAddress = i2cAddress;
    this.timerId = null;
    this.reset = false;
    this.center = {x: 2043, y: 2031.5};
    this.scaleX = 225 / 230;
    this.i2cAddress |= 0x30;
}

/**
 * Start a new measuring
 * When the measured value is available the callback function will be called
 * with the measured result.
 * @param callback The callback
 */
MMC212x.prototype.getMagneticValue = function ( callback ) {
    var _this = this;
    if (this.timerId) {
        throw new Error( "Measuring in progress" );
    }
    // Start measuring
    this.i2c.writeTo( this.i2cAddress, [0x00, 0x01] );
    // Wait at least 5 ms
    this.timerId = setTimeout( function () {
        _this.timerId = null;
        _this.i2c.writeTo( _this.i2cAddress, 0x00 );
        var d = _this.i2c.readFrom( _this.i2cAddress, 5 );
        // Byte 0 is the interal status register.
        //noinspection JSBitwiseOperatorUsage
        if (d[0] & 0x8) {
            throw new Error( "Measuring not finished" );
        }
        var xAxis = ((d[1] & 0x0f) << 8) + d[2];
        var yAxis = ((d[3] & 0x0f) << 8) + d[4];
        callback( xAxis, yAxis );
    }, 5 );
};

/**
 * Calculate the angle between north and the current sensor direction (+y-axis).
 * The angle is increasing in clockwise direction.
 *  +y-axis pointing to north →   0°
 *  +y-axis pointing to east  →  90°
 *  +y-axis pointing to south → 180°
 *  +y-axis pointing to west  → 270°
 * @param x Sensor value of the x-axis - get from getMagneticValue(..)
 * @param y Sensor value of the y-axis - get from getMagneticValue(..)
 * @returns {number} Angle between magnetic north and the current sensor orientation
 */
MMC212x.prototype.getAngle = function ( x, y ) {
    var phi = 180.0 / Math.PI * Math.atan2( (this.center.x - x) * this.scaleX, y - this.center.y );
    if (phi < 0) {
        phi += 360;
    }
    return phi;
};

//------------------------------------------------------------------------------------------------------------------
// Calibration support
//------------------------------------------------------------------------------------------------------------------

/**
 * After calling restoreSensorCharacteristic() you should calibrate the module.
 *
 * This method may be called only 10ms after reset.
 */
MMC212x.prototype.restoreSensorCharacteristic = function () {
    this.i2c.writeTo( this.i2cAddress, [0x00, this.reset ? 0x04 : 0x02] );
    this.reset = !this.reset;
};

/**
 * Calibrates internal ellipse parameter with the minimum and maximum of the x- and y-axis.
 *
 * Explaination:
 * If the sensor will be rotated the values of (x,y) will form an ellipse. These method
 * calculates the center of the ellipse and the scaling factor from x to y.
 *
 * @param xMin minimum value of the x-axis
 * @param xMax maximum value of the x-axis
 * @param yMin minimum value of the y-axis
 * @param yMax maximum value of the y-axis
 */
MMC212x.prototype.calibrate = function ( xMin, xMax, yMin, yMax ) {
    this.center.x = (xMax + xMin) / 2;
    this.center.y = (yMax + yMin) / 2;
    this.scaleX = (yMax - yMin) / (xMax - xMin);
};


//noinspection JSUnusedAssignment
/**
 * Creates a new MMC212x sensor instance
 * @constructor
 * @param i2c Instance of the I2C Class, e.g. I2C1
 * @param i2cAddress optional alternate I²C address, default 0x30
 */
exports.connect = function ( i2c, i2cAddress ) {
    return new MMC212x( i2c, i2cAddress );
};
//# sourceMappingURL=MMC212x.js.map
