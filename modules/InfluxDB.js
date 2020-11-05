/* Copyright (c) 2017 Moncef AOUDIA. See the file LICENSE for copying permission. */
/*
 Simple InfluxDB wrapper for Espruino.
 */

/**
 * Create and setup an instance of INFLUXDB.
 * @param  {Object} influxDBParams JSON object with InfluxDB parameters.
 * @return {Object}
 */
exports.setup = function(influxDBParams) {
    return new INFLUXDB(influxDBParams);
}

/**
 * INFLUXDB
 * @param       {Object} influxDBParams JSON object with InfluxDB parameters.
 * @constructor
 */
function INFLUXDB(influxDBParams) {
    this.influxDBParams = influxDBParams;
}

/**
 * Send GET or POST request to InfluDB.
 * @param  {string} data request body one or multi lines (separator '\n').
 * @param  {string} httpCmd GET or POST only.
 * @param  {string} influxDBCmd write for POST and query for GET.
 * @param  {Function} callback with response
 */
INFLUXDB.prototype.process = function(data, httpCmd, influxDBCmd, callback) {

    var options = {
        host: this.influxDBParams.influxDBHost,
        port: this.influxDBParams.influxPort,
        path: "/" + influxDBCmd + "?db=" + this.influxDBParams.influxDBName + "&u=" + this.influxDBParams.influxUserName + "&p=" + this.influxDBParams.influxPassword,
        method: httpCmd,
        headers: {
            "User-Agent": this.influxDBParams.influxAgentName,
            "Accept": "*/*",
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": data.length,
        }
    };

    var response = "";

    var request = require("http").request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));

        res.on('data', function(data) {
            console.log('BODY: ' + data);
            response += data;
        });

    });

    request.on('error',
        function(e) {
            console.log('Error: ' + e.message);
            return false;
        });

    request.on('close', function(data) {
        if (!callback) return;
        if (httpCmd == 'POST') {
            callback(true);
        } else if (httpCmd === 'GET') {
            callback(response);
        } else {
            callback(false);
        }
    });

    request.write('');
    request.write(data);
    request.end();
}

/**
 * https://docs.influxdata.com/influxdb/v1.3/guides/writing_data/
 * Write data to influxDB.
 * @param  {string} data request body, one or multi lines (separator '\n').
 */
INFLUXDB.prototype.write = function(data, callback) {
    return this.process(data, 'POST', 'write', callback);
}

/**
 * https://docs.influxdata.com/influxdb/v1.3/guides/querying_data/
 * Send query to influxDB.
 * @param  {string} query influxDB request.
 */
INFLUXDB.prototype.query = function(query, callback) {
    return this.process(query, 'GET', 'query', callback);
}
