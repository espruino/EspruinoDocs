/* Copyright (c) 2022 Joe Teglasi. License: MIT */

/**
 * 
 * @file tracer.js
 * @description A simple logging utility that prefixes log messages with timestamps and log levels. Inspired by https://github.com/baryon/tracer. 
 * @module tracer
 * @example
 * const logger = require('tracer.js')('myfile.js');
 * logger.info('This is an info message');
 * // output: YYYY-MM-DDTHH:mm:ss.sss <INFO> myfile.js: This is an info message
 */

/**
 * @function getDateTime
 * @description Returns the current date and time in ISO format.
 * @returns {string} The current date and time in ISO format.
 */


function getDateTime() {
    return new Date().toLocalISOString();
}

/**
 * @external Serial
 * @class
 * @description See https://www.espruino.com/Reference#Serial
 * @method inject
 * @param {string} text The string to inject into the Serial interface.
 * @returns {void}
 */

/**
 * @function tracer
 * @description A simple logging utility that prefixes log messages with timestamps, source file name, and log levels.
 * @param {string} file_name The name of the currently executing file, to include it in log messages
 * @param {Serial} [serial] An optional Serial object to inject log messages into, e.g. LoopbackB. Useful for streaming logs
 * @returns {Object} An object containing logging methods: log, info, debug, warn, and error.
 */

const tracer = function (file_name, serial) {
    return ["log", "info", "debug", "warn", "error"].reduce(function (logger, method) {
        logger[method] = function () {
            const log_text = `${getDateTime()} <${method.toUpperCase()}> ${file_name}: ` + Object.values(arguments).map(function (x) { return (typeof x === "object") ? JSON.stringify(x) : x }).join(" ");
            console.log(log_text);
            serial && serial.inject(log_text+'\n');
        };
        return logger;
    }, {});
};
module.exports = tracer;

