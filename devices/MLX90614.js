/* Copyright (C) 2016 Luwar. See the file LICENSE for copying permission. */

/*
 Espruino module for MLX90614 Infra Red thermometer from Melexis connected by I2C
 */

/**
 * Creates a new MLX90614 sensor instance
 * @param i2c Instance of the I2C Class, e.g. I2C1
 * @param address (optional) alternative I2C address; default is 0x5a
 */
function MLX90614(i2c, address) {
    this.i2c = i2c;
    this.voltage = 3.3; // supply voltage to compensate supply voltage dependence
    this.ECC_Reg = 0x24; // Emissivity Correction Coefficient Register
    // Check params
    var br = (i2c._options && i2c._options.bitrate) || 50000; // later replaced with getBitrate()
    if (br < 10000 || br > 100000) {
        throw new Error("The maximum clock frequency is 100 kHz and the minimum is 10 kHz.");
    }
    this.i2cAddress = address || 0x5a;
    // The first request will always trigger a crc error. → Dummy read von emissivity without crc check.
    this.i2c.writeTo({ address: this.i2cAddress, stop: false }, this.ECC_Reg);
    this.i2c.readFrom(this.i2cAddress, 3);
}

/**
 * Read the ambient temperature from the sensor. The ambient temperature is the internal chip temperature.
 * @returns {number} Ambient temperature in °C
 */
MLX90614.prototype.readAmbientTemperature = function () {
    return this.convertRawToCelcius(this.read16(0x06));
};

/**
 * @returns {number} temperature in °C
 */
MLX90614.prototype.readObject1Temperature = function () {
    return this.convertRawToCelcius(this.read16(0x07));
};

/**
 * Some variants of MXL90614 have a second IR sensor with a different field of view (angle).
 * If the second sensor element is not available the sensor does not answer and you will get an I2C error.
 * @returns {number} temperature in °C
 */
MLX90614.prototype.readObject2Temperature = function () {
    return this.convertRawToCelcius(this.read16(0x08));
};

/**
 * Enter the sensor into sleep mode (typ. 2.5µA). Afterwards the sensor doesn't answer I2C requests anymore.
 * There are two ways to put MLX90614 into power-up default mode: 1) POR or 2) By wake up request (SCL pin hight and
 * then SDA pin low for at least 33ms). Wakeup is currently not implemented.
 *
 * This function is not available in 5V supply version.
 */
MLX90614.prototype.enterSleepMode = function () {
    this.i2c.writeTo(this.i2cAddress, 0xff, 0xe8);
};
/**
 * Read the current configured object emissivity from the sensor in the range from 0.0 to 1.0.
 * @returns {number} configured object emissivity
 */
MLX90614.prototype.getEmissivity = function () {
    return this.read16(this.ECC_Reg) / 65535;
};

/**
 * Write a new object emissivity persistent into the sensor. The value will be stored in EEPROM.
 * It is not necessary to erase the memory before. This is done internally.
 * A read write operation will only be done if the value has changed.
 * @param emissivity new object emissivity in the range from 0.0 to 1.0
 */
MLX90614.prototype.setEmissivity = function (emissivity) {
    var rawOld = this.read16(this.ECC_Reg);
    var rawNew = Math.round(emissivity * 65535);
    if (rawOld !== rawNew) {
        this.write16(this.ECC_Reg, 0);
        this.write16(this.ECC_Reg, rawNew);
    }
};

//----------------------------------------------------------------------------------------------------------
// Internal helper methods
//----------------------------------------------------------------------------------------------------------

MLX90614.prototype.convertRawToCelcius = function (raw) {
    if (raw & 0x8000) {
        throw new Error("Invalid temperature");
    }
    return raw * 0.02 - this.voltage * 0.6 - 271.35;
};

MLX90614.prototype.read16 = function (reg) {
    this.i2c.writeTo({ address: this.i2cAddress, stop: false }, reg);
    var d = this.i2c.readFrom(this.i2cAddress, 3);
    var allData = [this.i2cAddress << 1, reg, (this.i2cAddress << 1) + 1, d[0], d[1]];
    if (this.crc8(allData) !== d[2]) {
        throw new Error("CRC Error");
    }
    return (d[1] << 8) + d[0];
};

MLX90614.prototype.write16 = function (cmd, value) {
    var allData = [(this.i2cAddress << 1), cmd, value & 0xff, value >> 8];
    var crc = this.crc8(allData);
    var d = [cmd, value & 0xff, value >> 8, crc];
    this.i2c.writeTo(this.i2cAddress, d);
};

// Calculates CRC-8: x^8 + x^5 + x^4 + 1
MLX90614.prototype.crc8 = function (bytes) {
    var crc = 0;
    bytes.forEach(function (oneByte) {
        for (var i = 7; i >= 0; --i) {
            var temp = crc >> 7 ^ oneByte >> i & 1;
            crc = crc << 1 & 255;
            if (temp == 1) {
                crc ^= 7;
            }
        }
    });
    return crc;
};

exports.connect = function (/*=I2C*/ i2c, address) {
    return new MLX90614(i2c, address);
};