/* Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
const FW200 = atob("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");
const FW201 = atob("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");

const C = {
    WHO_AM_I_VALUE: 0x81,

    STATUS_ERROR: 0x01,
    STATUS_DATA_READY: 0x08,
    STATUS_APP_VALID: 0x10,
    STATUS_APP_VERIFY: 0x20,
    STATUS_APP_ERASE: 0x40,
    STATUS_FW_MODE: 0x80,

    // MEAS_MODE_INT_THRESH: 0x04,
    MEAS_MODE_INT_DATARDY: 0x08,
    /** Mode 0 – Idle (Measurements are disabled in this mode) */
    MEAS_MODE_DRIVE_MODE_IDLE: 0x00,
    /** Mode 1 – Constant power mode, IAQ measurement every second */
    MEAS_MODE_DRIVE_MODE_1SEC: 0x10,
    /** Mode 2 – Pulse heating mode IAQ measurement every 10 seconds */
    MEAS_MODE_DRIVE_MODE_10SEC: 0x20,
    /** Mode 3 – Low power pulse heating mode IAQ measurement every 60 seconds */
    MEAS_MODE_DRIVE_MODE_60SEC: 0x30,
    /** Mode 4 – Constant power mode, sensor measurement every 250ms */
    MEAS_MODE_DRIVE_MODE_250MS: 0x40,

    BOOTLOADER_APP_START: 0xF4,
};

const REGS = {
    /** Status register */
    STATUS: 0x00,


    /** Measurement mode and conditions register */
    MEAS_MODE: 0x01,

    /** Algorithm result. The most significant 2 bytes contain a ppm estimate of the equivalent CO2 (eCO2) level, and the next two bytes contain a ppb estimate of the total VOC level. */
    ALG_RESULT_DATA: 0x02,

    /** Environment Data register */
    ENV_DATA: 0x05,

    /** Hardware ID. The value is 0x81 */
    HW_ID: 0x20,
    /**  HW Version */
    HW_VERSION: 0x21,

    /**  FW Boot Version */
    FW_BOOT_VERSION: 0x23,

    /** firmware version in the CCS811 */
    FW_APP_VERSION: 0x24,

    /** erase register */
    ERASE: 0xF1,

    /** write the application here */
    REG_BOOT_APP: 0xF2,

    /** target register for firmware updates */
    APP_DATA: 0xF2,

    VERIFY: 0xF3,

    /** If the correct 4 bytes (0x11 0xE5 0x72 0x8A) are written to this register in a single sequence the device will reset and return to BOOT mode. */
    SW_RESET: 0xFF,
};

/** 4 byte sequence to erase the firmware */
const ERASE_COMMAND = [0xE7, 0xA7, 0xE6, 0x09];

/** 4 byte sequence to reset the device */
const RESET_COMMAND = [0x11, 0xE5, 0x72, 0x8A];

/** Helper function to set the nWake pin low / high before and after I2C communication.
 * (used if nWake is present in the options) */
function wrapWithnWake(nWakePin, i2cFunc) {
    return function(arg1, arg2) {
        nWakePin.write(0);
        // According to the datasheet, you should wait 50us after setting nWake to low, but the Espruino interpreter is slow enough :)
        var i2cResult = i2cFunc(arg1, arg2);
        nWakePin.write(1);
        return i2cResult;
    }
}


/** Set up the CCS811 firmware updater
 @constructor
 (see details at exports.connectI2C) */
function CCS811_FW(r, w, options) {

    this.r = (options && options.nWake) ? wrapWithnWake(options.nWake, r) : r; // read from a register
    this.w = (options && options.nWake) ? wrapWithnWake(options.nWake, w) : w; // write to a register
    this.options = options || {};

    this.w(REGS.SW_RESET, RESET_COMMAND); // software reset
    var ccs = this;
    setTimeout(function() {
        if (ccs.r(REGS.HW_ID, 1)[0] != C.WHO_AM_I_VALUE) {throw "CCS811 WHO_AM_I check failed";}

        var ai = ccs.readAppInfo();
        print(`CCS811 firmware updater
The version of firmware to use depends on the usage status of the device:
    - New fresh sensors use firmware 2-0-0  -> call gas.flash200()
    - Sensors run for a number of days use firmware 2-0-1  -> call gas.flash201()`);

        if (ai.v.major == 1) {print('  **  Version 1 firmware detected, update to v.2.x is recommended! **');}

        ccs.printStatusReg(ai.status);

        print(' ');
        print(`Current fw version: ${ai.v.major}.${ai.v.minor}.${ai.v.trivial}, fwBootVersion: ${ai.fwBootVersion}`)

    }, 100);
}

CCS811_FW.prototype.printStatusReg = function(status) {
    print('| CCS811 FW - status register:');

    var sFwMode = !!(status & C.STATUS_FW_MODE);
    print('|  7:', sFwMode, sFwMode ? 'Application mode' : 'Boot mode');

    var sEraseCompleted = !!(status & C.STATUS_APP_ERASE);
    print('|  6:', sEraseCompleted, sEraseCompleted ? 'Erase completed' : 'No erase completed');

    var sAppverify = !!(status & C.STATUS_APP_VERIFY);
    print('|  5:', sAppverify, sAppverify ? 'Verify completed' : 'No verify completed');

    var sAppValid = !!(status & C.STATUS_APP_VALID);
    print('|  4:', sAppValid, sAppValid ? 'Valid firmware' : 'No application FW!');

    var sDrdy = !!(status & C.STATUS_DATA_READY);
    print('|  3:', sDrdy, sDrdy ? 'Data ready' : 'No data ready');

    // byte 2:1 is reserved

    var sErr = !!(status & C.STATUS_ERROR);
    print('|  1:', sErr, sErr ? 'Error, read 0xE0 for details!' : 'No error');
}

CCS811_FW.prototype.readAppInfo = function() {
    var ccs = this;

    var status = ccs.r(REGS.STATUS, 1)[0];
    // var hwId = ccs.r(REGS.HW_ID, 1)[0];
    var fwBootVersion = ccs.r(REGS.FW_BOOT_VERSION, 1)[0];
    var fwAppVersion = ccs.r(REGS.FW_APP_VERSION, 2);

    var major = (fwAppVersion[0] & 0xF0) >> 4;
    var minor = fwAppVersion[0] & 0x0F;
    var trivial = fwAppVersion[1];
    return {
        status: status,
        fwBootVersion: fwBootVersion,
        v: {major: major, minor: minor, trivial: trivial}
    }
}

/** write an 8 byte chunk of the firmware */
function _writeNext(ccs, fw, position) {
    var nextEnd = Math.min(position + 8, fw.length);
    var bytes = fw.slice(position, nextEnd);
    if (position % 256 == 0) {print(`CCS811 FW - write @${position}`);}
    ccs.w(REGS.REG_BOOT_APP, bytes)

    if (nextEnd < fw.length) {
        setTimeout(_writeNext, 50, ccs, fw, nextEnd);
    } else {
        ccs.w(REGS.VERIFY, 0);

        // wait after verify is sent...
        setTimeout(function() {
            ccs.w(REGS.SW_RESET, RESET_COMMAND); // software reset
            setTimeout(function() {
                var status = ccs.r(REGS.STATUS, 1)[0];
                // STATUS_APP_VERIFY & STATUS_APP_VALID = 0x30
                var isValid = (status & 0x30) == 0x30;
                print('CCS811 FW - update done, firmware valid:', isValid);
                ccs.printStatusReg(status);
            }, 100);
        }, 600);
    }
}

/** internals of firmware update */
CCS811_FW.prototype._writeFirmware = function(fw, vMajor, vMinor, vTrivial, forceUpdate) {
    var ccs = this;
    var ai = ccs.readAppInfo();
    if ((ai.v.major < vMajor) || (ai.v.minor < vMinor) || (ai.v.trivial < vTrivial) || (forceUpdate == true)) {
        print(`CCS811 FW - Starting app update from v.${ai.v.major}.${ai.v.minor}.${ai.v.trivial} -> v.${vMajor}.${vMinor}.${vTrivial} fw length: ${fw.length}`);

        // write erase command & wait 5?00ms
        ccs.w(REGS.ERASE, ERASE_COMMAND);

        setTimeout(function() {
            var status = ccs.r(REGS.STATUS, 1)[0];
            var eraseOk = !!(status & C.STATUS_APP_ERASE);
            if (eraseOk) {
                print('CCS811 FW - Erase ok!');
                // ccs.printStatusReg(status);
                _writeNext(ccs, fw, 0);
            } else {
                print('CCS811 FW - Erase not ok! Status:', ccs.printStatusReg(status));
            }
        }, 500);
    } else {
        throw `CCS811 FW - already at v.${ai.v.major}.${ai.v.minor}! Pass true as the last parameter to force update / downgrade!`;
    }
}

/** writes firmware version 2.0.0 */
CCS811_FW.prototype.flash200 = function(forceUpdate) {
    this._writeFirmware(FW200, 2, 0, 0, forceUpdate);
}

/** writes firmware version 2.0.1 */
CCS811_FW.prototype.flash201 = function(forceUpdate) {
    this._writeFirmware(FW201, 2, 0, 1, forceUpdate);
}

exports.connectI2C = function(i2c, options) {
    var addr = (options && options.addr) || 0x5A;
    return new CCS811_FW(function(reg, len) { // read
        i2c.writeTo(addr, reg);
        return i2c.readFrom(addr, len);
    }, function(reg, data) { // write
        i2c.writeTo(addr, reg, data);
    }, options);
};
