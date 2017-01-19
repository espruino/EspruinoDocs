/* Copyright (c) 2017 Pavel Sokolov (pavel@sokolov.me). See the file LICENSE for copying permission. */
/*
Module designed to poll DS18B20 OneWire temperature sensors on multiply pins.

Quick start:

var manager=require("OneWireTempManager").create([A0,new OneWire(A1)];
manager.start();

 */

///////////////////////////////////////////
// Dummy JSDOC definitions for to avoid IDEA warnings.
/**
 * @class OneWire
 * @property {String} pin
 */
/**
 * @class exports
 * @method create
 */
/**
 * @function require
 * @param {String}
 */
///////////////////////////////////////////

var ds18b20 = require("DS18B20");

var C = {
    DS18B20_CODE: 0x28 // DS18B20 code
};

/**
 * Class for handling JS
 * @param {String|String[]|OneWire|OneWire[]} v - OneWire pins or OneWire bus instances
 * @constructor
 */
var OneWireTempManager = function (v) {
    var i;

    /**@type OneWire[] */
    this.buses = [];

    /**@type DS18B20[] */
    this.sensors = []; //

    this.scanTimer = null;
    this.pollTimer = null;

    if (Array.isArray(v)){
        for (i=0; i<v.length; i++) this._addBusOrPin(v[i]);
    } else {
        this._addBusOrPin(v);
    }
};

OneWireTempManager.prototype.C = {
    SCAN_PERIOD: 5000, // Bus scan period to find new sensors
    POLL_PERIOD: 1000  // Sensors poll period
};

OneWireTempManager.prototype._addBusOrPin = function(p) {
    if (!(p instanceof OneWire)) p = new OneWire(p);
    this.buses.push(p);
};

/**
 * @param {String} pin
 * @returns {OneWire}
 * @private
 */
OneWireTempManager.prototype._getBus = function(pin){
    for (var i=0; i<this.buses.length; i++) {
        var bus = this.buses[i];
        if (String(bus.pin) == String(pin)) return bus;
    }
    throw new Error("_getBus:"+pin); // This should never happens.
};

/**
 * Scan for new sensors
 */
OneWireTempManager.prototype.scan = function () {
    var i,j;
    var now=[]; // Array with "{PIN}={ADDR}" strings
    var ths = this.sensors; // shortcut

    // Scan all bus
    for (i=0; i<this.buses.length; i++){
        var bus=this.buses[i];
        var devices=bus.search();
        for (j=0; j<devices.length; j++)
        {
            // Push found device if it is Temp sensor
            if (parseInt(devices[j].substr(0,2),16) == C.DS18B20_CODE) {
                now.push(bus.pin + "=" + devices[j]); // "{PIN}={ADDR}"
            }
        }
        //console.log("Scanned " + bus.pin + ", total devices: " + devices.length);
    }

    /**
     * Array diff function
     * @param {Array} a
     * @param {Array} b
     * @returns {Array.<T>|*}
     */
    var diff=function (a,b) {
        return b.filter(function(i) {return a.indexOf(i) < 0;});
    };

    /**
     * Hash function "{PIN}={ADDR}".
     * @param {DS18B20} s
     * @returns {string}
     */
    var hash=function(s){
      return s.bus.pin + "=" + s.sCode;
    };

    var old=[]; // Existing sensors
    for (i=0; i<ths.length; i++){
        old.push(hash(ths[i]));
    }
    var added = diff(old,now); // Devices which are added in this iteration
    var deleted = diff(now, old); // Devices which are deleted in this iteration
    var s;

    for (i=0; i<added.length; i++){
        s = added[i].split("="); // s[0] - PIN, s[1] - ADDR
        console.log("Add TS sensor: " + s[1] + " bus " + s[0]);
        var ts = ds18b20.connect(this._getBus(s[0]), s[1]);
        this.configureSensor(ts);
        ths.push(ts);
    }
    for (i=0; i<deleted.length; i++){
        s = deleted[i].split("="); // s[0] - PIN, s[1] - ADDR
        console.log("Del TS sensor: " + s[1] + " bus " + s[0]);
        for (j=0; j<ths.length; j++){
            if (hash(ths[j]) == deleted[i]) {
                ths.splice(j,1);
                break;
            }
        }
    }
    if (added.length || deleted.length) console.log("Total TS sensors: "+ths.length);
};

/**
 * Hook to make custom configuration of the sensor
 * @param {DS18B20} sensor
 */
OneWireTempManager.prototype.configureSensor = function(sensor){
};

/**
 * Poll existing sensors for temperature
 */
OneWireTempManager.prototype.poll = function () {
    var me=this;
    this.sensors.forEach(function(sensor){
        sensor.getTemp(me.callBack.bind(this,sensor))
    });
};

/**
 * @param {DS18B20} sensor
 * @param {float} temp
 */
OneWireTempManager.prototype.callBack = function(sensor, temp){
    console.log("Temp on " + sensor.sCode + ": " + temp);
};

/**
 * Start polling
 */
OneWireTempManager.prototype.start = function () {
    this.stop();

    // initial scan on start
    this.scan();
    this.poll();

    // set timers
    this.scanTimer = setInterval(this.scan.bind(this),this.C.SCAN_PERIOD);
    this.pollTimer = setInterval(this.poll.bind(this),this.C.POLL_PERIOD);
};

/**
 * Stop polling
 */
OneWireTempManager.prototype.stop = function () {
    if (this.scanTimer != null){
        clearInterval(this.scanTimer);
        this.scanTimer = null;
    }
    if (this.pollTimer != null) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
    }
};


exports.create = function (v) {
    return new OneWireTempManager(v);
};
