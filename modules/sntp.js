/* Copyright (c) 2017 Standa Opichal. See the file LICENSE for copying permission. */
/*
 Stripped down version of https://github.com/hueniverse/sntp
 */

/**
*/
const dgram = require('dgram');

const internals = {};
const ignore = function() {};

exports.time = function (options, callback) {

    if (arguments.length !== 2) {
        callback = arguments[0];
        options = {};
    }

    const settings = Object.assign({}, options);
    settings.host = settings.host || 'pool.ntp.org';
    settings.port = settings.port || 123;

    // Declare variables used by callback

    let timeoutId = 0;
    let sent = 0;

    // Ensure callback is only called once

    let finished = false;
    const finish = (err, result) => {
        //if (finished) return;
        finished = true;

        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = 0;
        }

        socket.removeAllListeners();
        socket.on('error', ignore);
        socket.close();
        return callback(err, result);
    };

    // Create UDP socket

    const socket = dgram.createSocket('udp4');

    socket.on('error', (err) => finish(err));

    // Listen to incoming messages

    socket.on('message', (buffer, rinfo) => {
        buffer = E.toArrayBuffer(buffer);

        const received = Date.now();

        const message = new internals.NtpMessage(buffer);
        if (!message.isValid) {
            return finish(new Error('Invalid server response'), message);
        }

        if (message.originateTimestamp !== sent) {
            console.log(new Error('Wrong originate timestamp ' + message.originateTimestamp +"!="+ sent), message);
            return; // finish(new Error('Wrong originate timestamp ' + message.originateTimestamp +"!="+ sent), message);
        }

        // Timestamp Name          ID   When Generated
        // ------------------------------------------------------------
        // Originate Timestamp     T1   time request sent by client
        // Receive Timestamp       T2   time request received by server
        // Transmit Timestamp      T3   time reply sent by server
        // Destination Timestamp   T4   time reply received by client
        //
        // The roundtrip delay d and system clock offset t are defined as:
        //
        // d = (T4 - T1) - (T3 - T2)     t = ((T2 - T1) + (T3 - T4)) / 2

        const T1 = message.originateTimestamp;
        const T2 = message.receiveTimestamp;
        const T3 = message.transmitTimestamp;
        const T4 = received;

        message.d = (T4 - T1) - (T3 - T2);
        message.t = ((T2 - T1) + (T3 - T4)) / 2;
        message.receivedLocally = received;

        return finish(null, message);
    });

    // Set timeout

    if (settings.timeout) {
        timeoutId = setTimeout(() => {

            timeoutId = 0;
            return finish(new Error('Timeout'));
        }, settings.timeout);
    }

    // Construct NTP message

    const message = new Uint8Array(48);
    const dv = new DataView(message.buffer);
    message[0] = (0 << 6) + (4 << 3) + (3 << 0);        // Set version number to 4 and Mode to 3 (client)
    sent = Date.now();
    internals.fromMsecs(sent, dv, 40);             // Set transmit timestamp (returns as originate)
    sent = internals.toMsecs(dv, 40);              // Remember the rounded value

    // Send NTP request
    socket.send(E.toString(message), settings.port, settings.host, (err, bytes) => {

        if (err ||
            bytes !== 48) {

            return finish(err || new Error('Could not send entire message'));
        }
    });
};


internals.NtpMessage = function (buffer) {
    var dv = new DataView(buffer);

    this.isValid = false;

    // Validate

    if (buffer.length !== 48) {
        return;
    }

    // Leap indicator

    const li = (buffer[0] >> 6);
    switch (li) {
        case 0: this.leapIndicator = 'no-warning'; break;
        case 1: this.leapIndicator = 'last-minute-61'; break;
        case 2: this.leapIndicator = 'last-minute-59'; break;
        case 3: this.leapIndicator = 'alarm'; break;
    }

    // Version

    const vn = ((buffer[0] & 0x38) >> 3);
    this.version = vn;

    // Mode

    const mode = (buffer[0] & 0x7);
    switch (mode) {
        case 1: this.mode = 'symmetric-active'; break;
        case 2: this.mode = 'symmetric-passive'; break;
        case 3: this.mode = 'client'; break;
        case 4: this.mode = 'server'; break;
        case 5: this.mode = 'broadcast'; break;
        case 0:
        case 6:
        case 7: this.mode = 'reserved'; break;
    }

    // Stratum

    const stratum = buffer[1];
    if (stratum === 0) {
        this.stratum = 'death';
    }
    else if (stratum === 1) {
        this.stratum = 'primary';
    }
    else if (stratum <= 15) {
        this.stratum = 'secondary';
    }
    else {
        this.stratum = 'reserved';
    }

    // Poll interval (msec)

    this.pollInterval = Math.round(Math.pow(2, buffer[2])) * 1000;

    // Precision (msecs)

    this.precision = Math.pow(2, buffer[3]) * 1000;

    // Root delay (msecs)

    this.rootDelay = 1000 * (dv.getUint32(4) / 0x10000);

    // Root dispersion (msecs)

    this.rootDispersion = 1000 * (dv.getUint32(8) / 0x10000);

    // Reference identifier

    this.referenceId = '';
    switch (this.stratum) {
        case 'death':
        case 'primary':
            this.referenceId = String.fromCharCode(buffer[12]) + String.fromCharCode(buffer[13]) + String.fromCharCode(buffer[14]) + String.fromCharCode(buffer[15]);
            break;
        case 'secondary':
            this.referenceId = '' + buffer[12] + '.' + buffer[13] + '.' + buffer[14] + '.' + buffer[15];
            break;
    }

    // Reference timestamp

    this.referenceTimestamp = internals.toMsecs(dv, 16);

    // Originate timestamp

    this.originateTimestamp = internals.toMsecs(dv, 24);

    // Receive timestamp

    this.receiveTimestamp = internals.toMsecs(dv, 32);

    // Transmit timestamp

    this.transmitTimestamp = internals.toMsecs(dv, 40);

    // Validate

    if (this.version === 4 &&
        this.stratum !== 'reserved' &&
        this.mode === 'server' &&
        this.originateTimestamp &&
        this.receiveTimestamp &&
        this.transmitTimestamp) {

        this.isValid = true;
    }

    return this;
};


internals.toMsecs = function (dv, offset) {

    let seconds = dv.getUint32(offset);
    let fraction = dv.getUint32(offset + 4);
    return (seconds - 2208988800 + (fraction / Math.pow(2, 32))) * 1000;
};


internals.fromMsecs = function (ts, dv, offset) {

    const seconds = Math.floor(ts / 1000) + 2208988800;
    const fraction = Math.round((ts % 1000) / 1000 * Math.pow(2, 32));
    dv.setUint32(offset, seconds);
    dv.setUint32(offset + 4, fraction);
};


// Offset singleton

internals.last = {
    offset: 0,
    expires: 0,
    host: '',
    port: 0
};


exports.offset = function (options, callback) {

    if (arguments.length !== 2) {
        callback = arguments[0];
        options = {};
    }

    const now = Date.now();
    const clockSyncRefresh = options.clockSyncRefresh || 24 * 60 * 60 * 1000;                    // Daily

    if (internals.last.offset &&
        internals.last.host === options.host &&
        internals.last.port === options.port &&
        now < internals.last.expires) {

        process.nextTick(() => callback(null, internals.last.offset));
        return;
    }

    exports.time(options, (err, time) => {

        if (err) {
            return callback(err, 0);
        }

        internals.last = {
            offset: Math.round(time.t),
            expires: now + clockSyncRefresh,
            host: options.host,
            port: options.port
        };

        return callback(null, internals.last.offset);
    });
};


// Now singleton

internals.now = {
    intervalId: 0
};


exports.start = function (options, callback) {

    if (arguments.length !== 2) {
        callback = arguments[0];
        options = {};
    }

    if (internals.now.intervalId) {
        process.nextTick(() => callback());
        return;
    }

    exports.offset(options, (ignoreErr, offset) => {

        internals.now.intervalId = setInterval(() => {

            exports.offset(options, ignore);
        }, options.clockSyncRefresh || 24 * 60 * 60 * 1000);                                // Daily

        return callback();
    });
};


exports.stop = function () {

    if (!internals.now.intervalId) {
        return;
    }

    clearInterval(internals.now.intervalId);
    internals.now.intervalId = 0;
};


exports.isLive = function () {

    return !!internals.now.intervalId;
};


exports.now = function () {

    const now = Date.now();
    if (!exports.isLive() ||
        now >= internals.last.expires) {

        return now;
    }

    return now + internals.last.offset;
};

