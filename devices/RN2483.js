/* Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */

function toHex(m) {
  m = E.toString(m);
  var hex = "";
  for (var i in m)
    hex += (m.charCodeAt(i)+256).toString(16).substr(-2);
  return hex;
}

function fromHex(d, startIdx) {
  var msg = "";
  for (var i=startIdx;i<d.length;i+=2)
    msg += String.fromCharCode(parseInt(d.substr(i,2),16));
  return msg;
}

/** Connect to a RN2483.
  First argument is the serial device, second is an
  object containing:

  {
    reset : pin // optional
    debug : true // optional
  }
*/
function RN2483(serial, options) {
  this.ser = serial;
  this.options = options||{};
  this.at = require("AT").connect(serial);
  if (this.options.debug) this.at.debug();
  this.macOn = true; // are we in LoRaWAN mode or not?
}

/// Reset, either via the reset line if defined, or by a serial command
RN2483.prototype.reset = function(callback) {
  if (this.options.reset) {
    this.options.reset.reset();
    this.options.reset.set();
  } else {
    this.at.cmd("sys reset\r\n",1000,callback);
  }
  if (callback) callback();
};

/// Call the callback with the RN2483's firmware version
RN2483.prototype.getVersion = function(callback) {
  this.at.cmd("sys get ver\r\n",1000,function(d) {
    if (!d) {callback();return;}
    d = d.split(" ");
    callback({
      type : d[0],
      version : d[1],
      date : d.slice(2).join(" ")
    });
  });
};

/** Call the callback with the current status as an object.
 Includes: EUI, VDD, appEUI, devEUI, band, dataRate, rxDelay1 and rxDelay2 */
RN2483.prototype.getStatus = function(callback) {
  var status = {};
  var at = this.at;

  (new Promise(function(resolve) {
    at.cmd("sys get hweui\r\n",500,resolve);
  })).then(function(d) {
    status.EUI = d;
    return new Promise(function(resolve) {
      at.cmd("sys get vdd\r\n",500,resolve);
    });
  }).then(function(d) {
    status.VDD = parseInt(d,10)/1000;
    return new Promise(function(resolve) {
      at.cmd("mac get appeui\r\n",500,resolve);
    });
  }).then(function(d) {
    status.appEUI = d;
    return new Promise(function(resolve) {
      at.cmd("mac get deveui\r\n",500,resolve);
    });
  }).then(function(d) {
    status.devEUI = d;
    return new Promise(function(resolve) {
      at.cmd("mac get band\r\n",500,resolve);
    });
  }).then(function(d) {
    status.band = d;
    return new Promise(function(resolve) {
      at.cmd("mac get dr\r\n",500,resolve);
    });
  }).then(function(d) {
    status.dataRate = d;
    return new Promise(function(resolve) {
      at.cmd("mac get rxdelay1\r\n",500,resolve);
    });
  }).then(function(d) {
    status.rxDelay1 = d;
    return new Promise(function(resolve) {
      at.cmd("mac get rxdelay2\r\n",500,resolve);
    });
  }).then(function(d) {
    status.rxDelay2 = d;
    return new Promise(function(resolve) {
      at.cmd("mac get rx2 868\r\n",500,resolve);
    });
  }).then(function(d) {
    status.rxFreq2_868 = d;
    callback(status);
  });
};

/** configure the LoRaWAN parameters
 devAddr = 4 byte address for this device as hex - eg. "01234567"
 nwkSKey = 16 byte network session key as hex - eg. "01234567012345670123456701234567"
 appSKey = 16 byte application session key as hex - eg. "01234567012345670123456701234567"
*/
RN2483.prototype.LoRaWAN = function(devAddr,nwkSKey,appSKey, callback)
{
  var at = this.at;
  (new Promise(function(resolve) {
    at.cmd("mac set devaddr "+devAddr+"\r\n",500,resolve);
  })).then(function(d) {
    return new Promise(function(resolve) {
      at.cmd("mac set nwkskey "+nwkSKey+"\r\n",500,resolve);
    });
  }).then(function(d) {
    return new Promise(function(resolve) {
      at.cmd("mac set appskey "+appSKey+"\r\n",500,resolve);
    });
  }).then(function(d) {
    return new Promise(function(resolve) {
      at.cmd("mac join ABP\r\n",2000,resolve);
    });
  }).then(function(d) {
    callback(d);
  });
};

/// Set whether the MAC (LoRaWan) is enabled or disabled
RN2483.prototype.setMAC = function(on, callback) {
  if (this.macOn==on) return callback();
  this.macOn = on;
  this.at.cmd("mac "+(on?"resume":"pause")+"\r\n",500,callback);
};

/// Transmit a message over the radio (not using LoRaWAN)
RN2483.prototype.radioTX = function(msg, callback) {
  var at = this.at;
  this.setMAC(false, function() {
    // convert to hex
    at.cmd("radio tx "+toHex(msg)+"\r\n",2000,callback);
  });
};

/// Transmit a message (using LoRaWAN)
RN2483.prototype.loraTX = function(msg, callback) {
  var at = this.at;
  this.setMAC(true, function() {
    // convert to hex
    at.cmd("mac tx uncnf 1 "+toHex(msg)+"\r\n",2000,callback);
    // check for mac_tx_ok in callback?
  });
};


/** Receive a message from the radio (not using LoRaWAN) with the given timeout
in miliseconds. If the timeout is reached, callback will be called with 'undefined' */
RN2483.prototype.radioRX = function(timeout, callback) {
  var at = this.at;
  this.setMAC(false, function() {
    at.cmd("radio set wdt "+timeout+"\r\n", 500, function() {
      at.cmd("radio rx 0\r\n", timeout+500, function cb(d) {
        if (d=="ok") return cb;
        if (d===undefined || d.substr(0,10)!="radio_rx  ") { callback(); return; }
        callback(fromHex(d,10));
      });
    });
  });
};

exports = RN2483;
