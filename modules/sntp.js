/* Copyright (c) 2017 Standa Opichal. See the file LICENSE for copying permission. */
/*
 Stripped down version of https://github.com/hueniverse/sntp
 */

/**
*/
const dgram = require('dgram');

const internals = {};
const ignore = function() {};

const errors = {
    'ISR': 'Invalid server response',
    'WOT': 'Wrong originate timestamp != sent timestamp',
    'CNS': 'Could not send entire message',
    'Timeout': 'Timeout receiving response'
};

function sntpTime(options, callback) {

    const settings_host = options.host || 'pool.ntp.org';
    const settings_port = options.port || 123;
    const settings_timeout = options.timeout || 1000;
    const parser = options.parser || parseNtpMessage;

    // Declare variables used by callback

    let timeoutId = 0;
    let sent = 0;

    // Ensure callback is only called once

    let finished = false;
    const finish = function(err, result) {
        if (finished) return;
        finished = true;

        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = 0;
        }

        socket.removeAllListeners();
        socket.on('error', ignore);
        socket.close();

        callback(err ? new Error(err) : null, result);
    };

    // Create UDP socket

    const socket = dgram.createSocket('udp4');

    socket.on('error', finish);

    // Listen to incoming messages

    socket.on('message', function(buffer) {
        buffer = E.toArrayBuffer(buffer);

        const received = Date.now();

        const message = parser(buffer);
        if (!message) {
            return finish('ISR', { buffer: buffer });
        }

        if (message.T1 !== sent) {
            return finish('WOT', message);
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

        const T1 = message.T1;
        const T2 = message.T2;
        const T3 = message.T3;
        const T4 = message.T4 = received;

        message.d = (T4 - T1) - (T3 - T2);
        message.t = ((T2 - T1) + (T3 - T4)) / 2;

        finish(null, message);
    });

    // Set timeout

    if (settings_timeout) {
        timeoutId = setTimeout(function() {

            timeoutId = 0;
            finish('Timeout');
        }, settings_timeout);
    }

    // Construct NTP message

    const message = new Uint8Array(48);
    const dv = new DataView(message.buffer);
    message[0] = (0 << 6) + (4 << 3) + (3 << 0);   // Set version number to 4 and Mode to 3 (client)
    sent = Date.now();
    fromMsecs(sent, dv, 40);             // Set transmit timestamp (returns as originate)
    sent = toMsecs(dv, 40);              // Remember the rounded value

    // Send NTP request
    socket.send(E.toString(message), settings_port, settings_host, function(err, bytes) {
        if (err || bytes !== 48) {
            finish(err || 'CNS');
        }
    });
}



function parseNtpMessage(buffer) {
    if (buffer.length !== 48) {
        return;
    }

    const version = ((buffer[0] & 0x38) >> 3);
    const mode = (buffer[0] & 0x7);
    const stratum = buffer[1];

    const dv = new DataView(buffer);
    const originateTimestamp = toMsecs(dv, 24);
    const receiveTimestamp = toMsecs(dv, 32);
    const transmitTimestamp = toMsecs(dv, 40);

    // Validate
    if (version === 4 &&
        stratum <= 15 /* this.stratum != 'reserved' */ &&
        mode === 4 /* this.mode === 'server' */ &&
        originateTimestamp &&
        receiveTimestamp &&
        transmitTimestamp) {

        return {
            T1: originateTimestamp,
            T2: receiveTimestamp,
            T3: transmitTimestamp
        }
    }
}


function parseVerbose(buffer) {
    const message = new NtpMessage(buffer);
    if (message.isValid) {
        message.T1 = message.originateTimestamp;
        message.T2 = message.receiveTimestamp;
        message.T3 = message.transmitTimestamp;
        return message;
    }
}

const NtpMessage = function (buffer) {
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

    this.referenceTimestamp = toMsecs(dv, 16);

    // Originate timestamp

    this.originateTimestamp = toMsecs(dv, 24);

    // Receive timestamp

    this.receiveTimestamp = toMsecs(dv, 32);

    // Transmit timestamp

    this.transmitTimestamp = toMsecs(dv, 40);

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


function toMsecs(dv, offset) {

    let seconds = dv.getUint32(offset);
    let fraction = dv.getUint32(offset + 4);
    return (seconds - 2208988800 + (fraction / Math.pow(2, 32))) * 1000;
}


function fromMsecs(ts, dv, offset) {

    const seconds = Math.floor(ts / 1000) + 2208988800;
    const fraction = Math.round((ts % 1000) / 1000 * Math.pow(2, 32));
    dv.setUint32(offset, seconds);
    dv.setUint32(offset + 4, fraction);
}


// Offset singleton

internals.last = {
    offset: 0,
    expires: 0,
    host: '',
    port: 0
};


function sntpOffset(options, callback) {

    const now = Date.now();
    const clockSyncRefresh = options.clockSyncRefresh || 24 * 60 * 60 * 1000;  // Daily

    if (internals.last.offset &&
        internals.last.host === options.host &&
        internals.last.port === options.port &&
        now < internals.last.expires) {

        setTimeout(function() { return callback(null, internals.last.offset); });
        return;
    }

    sntpTime(options, function(err, time) {

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
}


// Now singleton

internals.now = {
    intervalId: 0
};


function start(options, callback) {

    if (internals.now.intervalId) {
        setTimeout(callback);
        return;
    }

    sntpOffset(options, function() {

        internals.now.intervalId = setInterval(function() {

            sntpOffset(options, ignore);
        }, options.clockSyncRefresh || 24 * 60 * 60 * 1000); // Daily

        return callback();
    });
}


function stop() {

    if (!internals.now.intervalId) {
        return;
    }

    clearInterval(internals.now.intervalId);
    internals.now.intervalId = 0;
}


function isLive() {

    return !!internals.now.intervalId;
}


function now() {

    const now = Date.now();
    if (!isLive() ||
        now >= internals.last.expires) {

        return now;
    }

    return now + internals.last.offset;
}

exports.errors = errors;
exports.parseVerbose = parseVerbose;

exports.time = sntpTime;
exports.offset = sntpOffset;

exports.start = start;
exports.stop = stop;
exports.isLive = isLive;
exports.now = now;
