/* Copyright (C) 2019 Jose A. Hurtado. See the file LICENSE for copying permission.
 * This modules was adapted from: https://github.com/pololu/vl53l1x-arduino/
 */

var C = {
    SOFT_RESET: 0x0000,
    OSC_MEASURED__FAST_OSC__FREQUENCY: 0x0006,
    VHV_CONFIG__TIMEOUT_MACROP_LOOP_BOUND: 0x0008,
    VHV_CONFIG__INIT: 0x000b,
    ALGO__PART_TO_PART_RANGE_OFFSET_MM: 0x001e,
    MM_CONFIG__OUTER_OFFSET_MM: 0x0022,
    DSS_CONFIG__TARGET_TOTAL_RATE_MCPS: 0x0024,
    PAD_I2C_HV__EXTSUP_CONFIG: 0x002e,
    GPIO__TIO_HV_STATUS: 0x0031,
    SIGMA_ESTIMATOR__EFFECTIVE_PULSE_WIDTH_NS: 0x0036,
    SIGMA_ESTIMATOR__EFFECTIVE_AMBIENT_WIDTH_NS: 0x0037,
    ALGO__CROSSTALK_COMPENSATION_VALID_HEIGHT_MM: 0x0039,
    ALGO__RANGE_IGNORE_VALID_HEIGHT_MM: 0x003e,
    ALGO__RANGE_MIN_CLIP: 0x003f,
    ALGO__CONSISTENCY_CHECK__TOLERANCE: 0x0040,
    CAL_CONFIG__VCSEL_START: 0x0047,
    PHASECAL_CONFIG__TIMEOUT_MACROP: 0x004b,
    PHASECAL_CONFIG__OVERRIDE: 0x004d,
    DSS_CONFIG__ROI_MODE_CONTROL: 0x004f,
    SYSTEM__THRESH_RATE_HIGH: 0x0050,
    SYSTEM__THRESH_RATE_LOW: 0x0052,
    DSS_CONFIG__MANUAL_EFFECTIVE_SPADS_SELECT: 0x0054,
    DSS_CONFIG__APERTURE_ATTENUATION: 0x0057,
    MM_CONFIG__TIMEOUT_MACROP_A: 0x005a,
    MM_CONFIG__TIMEOUT_MACROP_B: 0x005c,
    RANGE_CONFIG__TIMEOUT_MACROP_A: 0x005e,
    RANGE_CONFIG__VCSEL_PERIOD_A: 0x0060,
    RANGE_CONFIG__TIMEOUT_MACROP_B: 0x0061,
    RANGE_CONFIG__VCSEL_PERIOD_B: 0x0063,
    RANGE_CONFIG__SIGMA_THRESH: 0x0064,
    RANGE_CONFIG__MIN_COUNT_RATE_RTN_LIMIT_MCPS: 0x0066,
    RANGE_CONFIG__VALID_PHASE_HIGH: 0x0069,
    SYSTEM__INTERMEASUREMENT_PERIOD: 0x006c,
    SYSTEM__GROUPED_PARAMETER_HOLD_0: 0x0071,
    SYSTEM__SEED_CONFIG: 0x0077,
    SD_CONFIG__WOI_SD0: 0x0078,
    SD_CONFIG__WOI_SD1: 0x0079,
    SD_CONFIG__INITIAL_PHASE_SD0: 0x007a,
    SD_CONFIG__INITIAL_PHASE_SD1: 0x007b,
    SYSTEM__GROUPED_PARAMETER_HOLD_1: 0x007c,
    SD_CONFIG__QUANTIFIER: 0x007e,
    SYSTEM__SEQUENCE_CONFIG: 0x0081,
    SYSTEM__GROUPED_PARAMETER_HOLD: 0x0082,
    SYSTEM__INTERRUPT_CLEAR: 0x0086,
    SYSTEM__MODE_START: 0x0087,
    RESULT__RANGE_STATUS: 0x0089,
    PHASECAL_RESULT__VCSEL_START: 0x00d8,
    RESULT__OSC_CALIBRATE_VAL: 0x00de,
    FIRMWARE__SYSTEM_STATUS: 0x00e5,
    IDENTIFICATION__MODEL_ID: 0x010f,
    RangeValid: 0,
    SigmaFail: 1,
    SignalFail: 2,
    RangeValidMinRangeClipped: 3,
    OutOfBoundsFail: 4,
    HardwareFail: 5,
    RangeValidNoWrapCheckFail: 6,
    WrapTargetFail: 7,
    XtalkSignalFail: 9,
    SynchronizationInt: 10,
    MinRangeFail: 13,
    None: 255,
    MinTimingGuard: 4528,
    MaxTimingGuard: 1100000,
    TargetRate: 0x0a00
};

function VL53L1X(i2c, options) {
    this.i2c = i2c;
    this.ad = 0x52 >> 1;

    this.fast_osc_frequency = 0;
    this.osc_calibrate_val = 0;
    this.saved_vhv_init = 0;
    this.saved_vhv_timeout = 0;
    this.rangingData = {};
    this.results = {};
    this.calibrated = false;

    if (!options) {
        options = { distanceMode: 'long', timingBudget: 140000, enable2V8Mode: false, interMeasurementPeriod: 200 };
    } else {
        if (!options.distanceMode) {
            options.distanceMode = 'long';
        }

        if (!options.timingBudget) {
            options.timingBudget = (options.distanceMode === 'long' && 140000) || 50000;
        }

        if (options.interMeasurementPeriod === undefined) {
            // 0 means don't autostart
            options.interMeasurementPeriod = options.timingBudget / 1000;
        }

        options.enable2V8Mode = Boolean(options.enable2V8Mode);
    }

    this.init(options);
}

VL53L1X.prototype.r16 = function(reg) {
    this.i2c.writeTo(this.ad, reg >> 8, reg & 0xff);
    var data = this.i2c.readFrom(this.ad, 0x02);
    return (data[0] << 8) | data[1];
};

VL53L1X.prototype.r = function(reg, n) {
    this.i2c.writeTo(this.ad, reg >> 8, reg & 0xff);
    return this.i2c.readFrom(this.ad, n);
};

VL53L1X.prototype.r8 = function(reg) {
    this.i2c.writeTo(this.ad, reg >> 8, reg & 0xff);
    var data = this.i2c.readFrom(this.ad, 0x01);
    return data[0];
};

VL53L1X.prototype.w8 = function(reg, value) {
    this.i2c.writeTo(this.ad, reg >> 8, reg & 0xff, value);
};
VL53L1X.prototype.w16 = function(reg, value) {
    this.i2c.writeTo(this.ad, reg >> 8, reg & 0xff, value >> 8, value & 0xff);
};

VL53L1X.prototype.w32 = function(reg, value) {
    this.i2c.writeTo(this.ad, reg >> 8, reg & 0xff, value >> 24, value >> 16, value >> 8, value & 0xff);
};

VL53L1X.prototype.delayMicroseconds = function(us) {
    var t = getTime() + us / 1000000;
    while (getTime() < t);
};

VL53L1X.prototype.init = function(options) {
    if (this.r16(C.IDENTIFICATION__MODEL_ID) != 0xeacc) {
        throw Error('Model ID not recognized');
    }

    this.w8(C.SOFT_RESET, 0x00);
    this.delayMicroseconds(100);
    this.w8(C.SOFT_RESET, 0x01);

    this.delayMicroseconds(1000);

    while ((this.r8(C.FIRMWARE__SYSTEM_STATUS) & 0x01) == 0);

    // sensor uses 1V8 mode for I/O by default; switch to 2V8 mode if necessary
    if (options.enable2V8Mode) {
        this.w8(C.PAD_I2C_HV__EXTSUP_CONFIG, this.r8(C.PAD_I2C_HV__EXTSUP_CONFIG) | 0x01);
    }

    console.log(`[VL53L1X] IO 2V8 Mode  = '${options.enable2V8Mode}'`);

    this.fast_osc_frequency = this.r16(C.OSC_MEASURED__FAST_OSC__FREQUENCY); // this.fast_osc_frequency
    this.osc_calibrate_val = this.r16(C.RESULT__OSC_CALIBRATE_VAL); // this.osc_calibrate_val

    this.w16(C.DSS_CONFIG__TARGET_TOTAL_RATE_MCPS, 0x0a00); // should already be this value after reset
    this.w8(C.GPIO__TIO_HV_STATUS, 0x02);
    this.w8(C.SIGMA_ESTIMATOR__EFFECTIVE_PULSE_WIDTH_NS, 8); // tuning parm default
    this.w8(C.SIGMA_ESTIMATOR__EFFECTIVE_AMBIENT_WIDTH_NS, 16); // tuning parm default
    this.w8(C.ALGO__CROSSTALK_COMPENSATION_VALID_HEIGHT_MM, 0x01);
    this.w8(C.ALGO__RANGE_IGNORE_VALID_HEIGHT_MM, 0xff);
    this.w8(C.ALGO__RANGE_MIN_CLIP, 0); // tuning parm default
    this.w8(C.ALGO__CONSISTENCY_CHECK__TOLERANCE, 2); // tuning parm default

    // general config
    this.w16(C.SYSTEM__THRESH_RATE_HIGH, 0x0000);
    this.w16(C.SYSTEM__THRESH_RATE_LOW, 0x0000);
    this.w8(C.DSS_CONFIG__APERTURE_ATTENUATION, 0x38);

    // timing config
    // most of these settings will be determined later by distance and timing
    // budget configuration
    this.w16(C.RANGE_CONFIG__SIGMA_THRESH, 360); // tuning parm default
    this.w16(C.RANGE_CONFIG__MIN_COUNT_RATE_RTN_LIMIT_MCPS, 192); // tuning parm default

    // dynamic config

    this.w8(C.SYSTEM__GROUPED_PARAMETER_HOLD_0, 0x01);
    this.w8(C.SYSTEM__GROUPED_PARAMETER_HOLD_1, 0x01);
    this.w8(C.SD_CONFIG__QUANTIFIER, 2); // tuning parm default

    // VL53L1_preset_mode_standard_ranging() end

    // from VL53L1_preset_mode_timed_ranging_*
    // GPH is 0 after reset, but writing GPH0 and GPH1 above seem to set GPH to 1,
    // and things don't seem to work if we don't set GPH back to 0 (which the API
    // does here).
    this.w8(C.SYSTEM__GROUPED_PARAMETER_HOLD, 0x00);
    this.w8(C.SYSTEM__SEED_CONFIG, 1); // tuning parm default

    // from VL53L1_config_low_power_auto_mode
    this.w8(C.SYSTEM__SEQUENCE_CONFIG, 0x8b); // VHV, PHASECAL, DSS1, RANGE
    this.w16(C.DSS_CONFIG__MANUAL_EFFECTIVE_SPADS_SELECT, 200 << 8);
    this.w8(C.DSS_CONFIG__ROI_MODE_CONTROL, 2); // REQUESTED_EFFFECTIVE_SPADS

    this.setMeasurementTimingBudget(options.timingBudget);
    this.setDistanceMode(options.distanceMode);

    // the API triggers this change in VL53L1_init_and_start_range() once a
    // measurement is started; assumes MM1 and MM2 are disabled
    this.w16(C.ALGO__PART_TO_PART_RANGE_OFFSET_MM, this.r16(C.MM_CONFIG__OUTER_OFFSET_MM) * 4);

    if (options.interMeasurementPeriod > 0) {
        this.startContinuous(options.interMeasurementPeriod);
    }
};

VL53L1X.prototype.calcMacroPeriod = function(vcsel_period) {
    // from VL53L1_calc_pll_period_us()
    // fast osc frequency in 4.12 format; PLL period in 0.24 format
    var pll_period_us = (0x01 << 30) / this.fast_osc_frequency;

    // from VL53L1_decode_vcsel_period()
    var vcsel_period_pclks = (vcsel_period + 1) << 1;

    // VL53L1_MACRO_PERIOD_VCSEL_PERIODS = 2304
    var macro_period_us = 2304 * pll_period_us;
    macro_period_us >>= 6;
    macro_period_us *= vcsel_period_pclks;
    macro_period_us >>= 6;

    return macro_period_us;
};

VL53L1X.prototype.timeoutMicrosecondsToMclks = function(timeout_us, macro_period_us) {
    return ((timeout_us << 12) + (macro_period_us >> 1)) / macro_period_us;
};

VL53L1X.prototype.encodeTimeout = function(timeout_mclks) {
    // encoded format: "(LSByte * 2^MSByte) + 1"
    var ls_byte = 0;
    var ms_byte = 0;

    if (timeout_mclks > 0) {
        ls_byte = timeout_mclks - 1;

        while ((ls_byte & 0xffffff00) > 0) {
            ls_byte >>= 1;
            ms_byte++;
        }

        return (ms_byte << 8) | (ls_byte & 0xff);
    } else {
        return 0;
    }
};

VL53L1X.prototype.setMeasurementTimingBudget = function(timingBudget) {
    // assumes PresetMode is LOWPOWER_AUTONOMOUS
    if (timingBudget <= C.MinTimingGuard) {
        throw Error(`timingBudget '${timingBudget}us' too low`);
    }

    var range_config_timeout_us = (timingBudget -= C.MinTimingGuard);
    if (range_config_timeout_us > C.MaxTimingGuard) {
        throw Error(`timingBudget '${timingBudget}us' too high`);
    } // FDA_MAX_TIMING_BUDGET_US * 2

    range_config_timeout_us /= 2;

    // VL53L1_calc_timeout_register_values() begin

    var macro_period_us;

    // "Update Macro Period for Range A VCSEL Period"
    macro_period_us = this.calcMacroPeriod(this.r8(C.RANGE_CONFIG__VCSEL_PERIOD_A));

    // "Update Phase timeout - uses Timing A"
    // Timeout of 1000 is tuning parm default (TIMED_PHASECAL_CONFIG_TIMEOUT_US_DEFAULT)
    // via VL53L1_get_preset_mode_timing_cfg().
    var phasecal_timeout_mclks = this.timeoutMicrosecondsToMclks(1000, macro_period_us);
    if (phasecal_timeout_mclks > 0xff) {
        phasecal_timeout_mclks = 0xff;
    }
    this.w8(C.PHASECAL_CONFIG__TIMEOUT_MACROP, phasecal_timeout_mclks);

    // "Update MM Timing A timeout"
    // Timeout of 1 is tuning parm default (LOWPOWERAUTO_MM_CONFIG_TIMEOUT_US_DEFAULT)
    // via VL53L1_get_preset_mode_timing_cfg(). With the API, the register
    // actually ends up with a slightly different value because it gets assigned,
    // retrieved, recalculated with a different macro period, and reassigned,
    // but it probably doesn't matter because it seems like the MM ("mode
    // mitigation"?) sequence steps are disabled in low power auto mode anyway.
    this.w16(C.MM_CONFIG__TIMEOUT_MACROP_A, this.encodeTimeout(this.timeoutMicrosecondsToMclks(1, macro_period_us)));

    // "Update Range Timing A timeout"
    this.w16(
        C.RANGE_CONFIG__TIMEOUT_MACROP_A,
        this.encodeTimeout(this.timeoutMicrosecondsToMclks(range_config_timeout_us, macro_period_us))
    );

    // "Update Macro Period for Range B VCSEL Period"
    macro_period_us = this.calcMacroPeriod(this.r8(C.RANGE_CONFIG__VCSEL_PERIOD_B));

    // "Update MM Timing B timeout"
    // (See earlier comment about MM Timing A timeout.)
    this.w16(C.MM_CONFIG__TIMEOUT_MACROP_B, this.encodeTimeout(this.timeoutMicrosecondsToMclks(1, macro_period_us)));

    // "Update Range Timing B timeout"
    this.w16(
        C.RANGE_CONFIG__TIMEOUT_MACROP_B,
        this.encodeTimeout(this.timeoutMicrosecondsToMclks(range_config_timeout_us, macro_period_us))
    );

    // VL53L1_calc_timeout_register_values() end

    console.log(`[VL53L1X] Setting timingBudget = '${timingBudget}us'`);
};

/**
 * Set the distance mode of the sensor
 * @param {string} mode any of `short`, `medium` or `long` (default)
 */
VL53L1X.prototype.setDistanceMode = function(mode) {
    // save existing timing budget
    var timingBudget = this.getMeasurementTimingBudget();
    console.log(`[VL53L1X] timingBudget is set to '${timingBudget}us'`);

    var timingConfig;
    var dynamicConfig;
    switch (mode) {
        case 'short':
            // from VL53L1_preset_mode_standard_ranging_short_range()
            timingConfig = [0x07, 0x05, 0x38];
            dynamicConfig = [0x07, 0x05, 6, 6];

            break;

        case 'medium':
            // from VL53L1_preset_mode_standard_ranging()
            timingConfig = [0x0b, 0x09, 0x78];
            dynamicConfig = [0x0b, 0x09, 10, 10];

            break;

        case 'long': // long
            // from VL53L1_preset_mode_standard_ranging_long_range()
            timingConfig = [0x0f, 0x0d, 0xb8];
            dynamicConfig = [0x0f, 0x0d, 14, 14];
            break;

        default:
            // unrecognized mode - do nothing
            throw Error(`[VL53L1X] Unknown distanceMode (${mode})`);
    }
    console.log(`[VL53L1X] distanceMode = '${mode}'`);

    this.w8(C.RANGE_CONFIG__VCSEL_PERIOD_A, timingConfig[0]);
    this.w8(C.RANGE_CONFIG__VCSEL_PERIOD_B, timingConfig[1]);
    this.w8(C.RANGE_CONFIG__VALID_PHASE_HIGH, timingConfig[2]);

    // dynamic config
    this.w8(C.SD_CONFIG__WOI_SD0, dynamicConfig[0]);
    this.w8(C.SD_CONFIG__WOI_SD1, dynamicConfig[1]);
    this.w8(C.SD_CONFIG__INITIAL_PHASE_SD0, dynamicConfig[2]); // tuning parm default
    this.w8(C.SD_CONFIG__INITIAL_PHASE_SD1, dynamicConfig[3]); // tuning parm default

    // reapply timing budget
    this.setMeasurementTimingBudget(timingBudget);

    // save mode so it can be returned by getDistanceMode()
    distance_mode = mode;

    return true;
};

/**
 * Start continuous ranging measurements, with the given inter-measurement
 * @param {number} interMeasurementPeriod time between measurements in ms
 */
VL53L1X.prototype.startContinuous = function(interMeasurementPeriod) {
    this.w32(C.SYSTEM__INTERMEASUREMENT_PERIOD, interMeasurementPeriod * this.osc_calibrate_val);

    this.w8(C.SYSTEM__INTERRUPT_CLEAR, 0x01); // sys_interrupt_clear_range
    this.w8(C.SYSTEM__MODE_START, 0x40); // mode_range__timed

    console.log('[VL53L1X] continuous measurements started');
};

/**
 * Stop continuous measurements
 */
VL53L1X.prototype.stopContinuous = function() {
    this.w8(C.SYSTEM__MODE_START, 0x80); // mode_range__abort

    // VL53L1_low_power_auto_data_stop_range() begin

    this.calibrated = false;

    // "restore vhv configs"
    if (this.saved_vhv_init != 0) {
        this.w8(C.VHV_CONFIG__INIT, this.saved_vhv_init);
    }
    if (this.saved_vhv_timeout != 0) {
        this.w8(C.VHV_CONFIG__TIMEOUT_MACROP_LOOP_BOUND, this.saved_vhv_timeout);
    }

    // "remove phasecal override"
    this.w8(C.PHASECAL_CONFIG__OVERRIDE, 0x00);

    // VL53L1_low_power_auto_data_stop_range() end
};

VL53L1X.prototype.setupManualCalibration = function() {
    // "save original vhv configs"
    this.saved_vhv_init = this.r8(C.VHV_CONFIG__INIT);
    this.saved_vhv_timeout = this.r8(C.VHV_CONFIG__TIMEOUT_MACROP_LOOP_BOUND);

    // "disable VHV init"
    this.w8(C.VHV_CONFIG__INIT, this.saved_vhv_init & 0x7f);

    // "set loop bound to tuning param"
    this.w8(C.VHV_CONFIG__TIMEOUT_MACROP_LOOP_BOUND, (this.saved_vhv_timeout & 0x03) + (3 << 2)); // tuning parm default (LOWPOWERAUTO_VHV_LOOP_BOUND_DEFAULT)

    // "override phasecal"
    this.w8(C.PHASECAL_CONFIG__OVERRIDE, 0x01);
    this.w8(C.CAL_CONFIG__VCSEL_START, this.r8(C.PHASECAL_RESULT__VCSEL_START));
};

VL53L1X.prototype.updateDSS = function() {
    var spadCount = this.results.dss_actual_effective_spads_sd0;

    if (!spadCount) {
        console.log('[VL53L1X] Warning: spadCount == 0');
        this.w16(C.DSS_CONFIG__MANUAL_EFFECTIVE_SPADS_SELECT, 0x8000);
        return;
    }

    var totalRatePerSpad =
        this.results.peak_signal_count_rate_crosstalk_corrected_mcps_sd0 + this.results.ambient_count_rate_mcps_sd0;

    if (totalRatePerSpad > 0xffff) {
        totalRatePerSpad = 0xffff;
    }

    totalRatePerSpad <<= 16;

    totalRatePerSpad /= spadCount;

    var requiredSpads = (C.TargetRate << 16) / totalRatePerSpad;

    if (requiredSpads > 0xffff) {
        requiredSpads = 0xffff;
    }

    if (!requiredSpads) {
        console.log('[VL53L1X] Warning: requiredSpads == 0');
        this.w16(C.DSS_CONFIG__MANUAL_EFFECTIVE_SPADS_SELECT, 0x8000);
        return;
    }

    this.w16(C.DSS_CONFIG__MANUAL_EFFECTIVE_SPADS_SELECT, requiredSpads & 0xffff);
};

/**
 * Read the distance in mm
 * Note: This function hast a better performance than `readMeasurement().distance`.
 * @returns {number} distance in mm
 */
VL53L1X.prototype.getDistance = function() {
    var range = this.results.final_crosstalk_corrected_range_mm_sd0;

    // "apply correction gain"
    return Math.round((range * 2011) / 2048);
};

VL53L1X.prototype.getRangingData = function() {
    var distance = this.getDistance();

    var status;

    switch (this.results.rangeStatus) {
        case 17: // MULTCLIPFAIL
        case 2: // VCSELWATCHDOGTESTFAILURE
        case 1: // VCSELCONTINUITYTESTFAILURE
        case 3: // NOVHVVALUEFOUND
            // from SetSimpleData()
            status = 'HardwareFail';
            break;

        case 13: // USERROICLIP
            // from SetSimpleData()
            status = 'MinRangeFail';
            break;

        case 18: // GPHSTREAMCOUNT0READY
            status = 'SynchronizationInt';
            break;

        case 5: // RANGEPHASECHECK
            status = 'OutOfBoundsFail';
            break;

        case 4: // MSRCNOTARGET
            status = 'SignalFail';
            break;

        case 6: // SIGMATHRESHOLDCHECK
            status = 'SignalFail';
            break;

        case 7: // PHASECONSISTENCY
            status = 'WrapTargetFail';
            break;

        case 12: // RANGEIGNORETHRESHOLD
            status = 'XtalkSignalFail';
            break;

        case 8: // MINCLIP
            status = 'RangeValidMinRangeClipped';
            break;

        case 9: // RANGECOMPLETE
            // from VL53L1_copy_sys_and_core_this.results_to_range_this.results()
            if (this.results.stream_count == 0) {
                status = 'RangeValidNoWrapCheckFail';
            } else {
                status = 'RangeValid';
            }
            break;

        default:
            status = 'None';
    }

    var signalRate = this.results.peak_signal_count_rate_crosstalk_corrected_mcps_sd0 / 128;
    var ambientRate = this.results.ambient_count_rate_mcps_sd0 / 128;
    var effectiveSpadRtnCount = this.results.dss_actual_effective_spads_sd0 / 256;

    return {
        status,
        distance,
        signalRate,
        ambientRate,
        effectiveSpadRtnCount
    };
};

VL53L1X.prototype.readResults = function() {
    while ((this.r8(C.GPIO__TIO_HV_STATUS) & 0x01) !== 0) {
        // wait for results
    }

    var d = new DataView(this.r(C.RESULT__RANGE_STATUS, 17).buffer);

    this.results.rangeStatus = d.getInt8(0);
    this.results.stream_count = d.getInt8(2);
    this.results.dss_actual_effective_spads_sd0 = d.getUint16(3);
    this.results.ambient_count_rate_mcps_sd0 = d.getUint16(7);
    this.results.final_crosstalk_corrected_range_mm_sd0 = d.getUint16(13);
    this.results.peak_signal_count_rate_crosstalk_corrected_mcps_sd0 = d.getUint16(15);
};

VL53L1X.prototype.getMeasurementTimingBudget = function() {
    var macro_period_us = this.calcMacroPeriod(this.r8(C.RANGE_CONFIG__VCSEL_PERIOD_A));

    var range_config_timeout_us = this.timeoutMclksToMicroseconds(
        this.decodeTimeout(this.r16(C.RANGE_CONFIG__TIMEOUT_MACROP_A)),
        macro_period_us
    );

    return 2 * range_config_timeout_us + C.MinTimingGuard;
};

VL53L1X.prototype.timeoutMclksToMicroseconds = function(timeout_mclks, macro_period_us) {
    return (timeout_mclks * macro_period_us + 0x800) >> 12;
};

VL53L1X.prototype.decodeTimeout = function(reg_val) {
    return ((reg_val & 0xff) << (reg_val >> 8)) + 1;
};

VL53L1X.prototype.read = function() {
    this.readResults();

    if (!this.calibrated) {
        this.setupManualCalibration();
        this.calibrated = true;
    }

    this.updateDSS();

    this.w8(C.SYSTEM__INTERRUPT_CLEAR, 0x01);
};

/**
 * Read a measurement.
 * Note: The module should be continuously reading (by default)
 * @returns {Object} Object with the properties `status`, `distance`,
 *     `signalRate`, `ambientRate`, `effectiveSpadRtnCount`
 *
 * @example
 *   {
 *     "status": "RangeValid",
 *     "distance": 1821,
 *     "signalRate": 6.96875,
 *     "ambientRate": 0.171875,
 *     "effectiveSpadRtnCount": 215.5625
 *   }
 */
VL53L1X.prototype.readMeasurement = function() {
    this.read();
    return this.getRangingData();
};

VL53L1X.prototype.readDistance = function() {
    this.read();
    return this.getDistance();
};

/**
 * Provided for backward compatibility with the module VL53L0X
 */
VL53L1X.prototype.performSingleMeasurement = VL53L1X.prototype.readMeasurement;

/// Export function
exports.connect = function(i2c, options) {
    return new VL53L1X(i2c, options);
};
