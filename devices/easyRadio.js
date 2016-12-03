/* Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */

function onERData(d) {
  if (this.inCommand) this.rxBuf += d;
  else this.dataCallback(d);
}

function ER(ser, dataCallback) {
  this.ser = ser;
  this.rxBuf = "";
  this.dataCallback = dataCallback;
  this.inCommand = false;
  ser.on('data', onERData.bind(this));
}

/// Send the given command and call the callback when a result is received
ER.prototype.cmd = function(cmd, callback) {
  this.rxBuf = "";
  this.send(cmd);
  this.inCommand = true;
  var eric = this;
  // wait for a reply
  setTimeout(function() {
    var i = eric.rxBuf.indexOf(cmd);
    if (i>=0) {
      if (i>0) eric.dataCallback(eric.rxBuf.substr(0,i)); // any new data?
      eric.rxBuf = "";
      eric.ser.write("ACK");
      setTimeout(function() {
        eric.inCommand = false;
        if (callback) callback(null,eric.rxBuf);
        eric.rxBuf = "";
      }, 200);
    } else {
      eric.inCommand = false;
      if (callback) 
        callback("Command failed, expecting "+JSON.stringify(cmd)+", got "+JSON.stringify(eric.rxBuf));
      eric.rxBuf = "";
    }    
  }, 100);
};

/// Send data down the RF link
ER.prototype.send = function(data) { 
  if (this.inCommand) throw new Error("Already sending command");
  this.ser.write(data); 
};
/// Call callback(err, firmware_version)
ER.prototype.getFirmwareVersion = function(callback) { this.cmd("ER_CMD#T3",callback); };
/// Call callback(err, serial_number)
ER.prototype.getSerial = function(callback) { this.cmd("ER_CMD#L8?",callback); };
/// Write byte 'data' to eeprom at addr between 0 and 255, call callback when done
ER.prototype.eepromWrite = function(addr, data, callback) { 
  this.cmd("ER_CMD#L4"+((addr|256).toString(16).substr(-2)+(data|256).toString(16).substr(-2)).toUpperCase(),callback); 
};
/// Write a byte from eeprom at addr between 0 and 255, call callback(err,data)
ER.prototype.eepromRead = function(addr, callback) { 
  this.cmd("ER_CMD#L4"+(addr|256).toString(16).substr(-2).toUpperCase()+"?",function(err,d) {
    callback(err, parseInt(d,16));
  }); 
};
/// Set frequency (0..9) in 100kHz increments over the base (eg. 5 = 434Mhz + 0.5Mhz), and call callback when done
ER.prototype.setChannel = function(pwr, callback) { 
  this.cmd("ER_CMD#C"+(0|E.clip(pwr,0,9)),callback); 
};
/// Set group ID to a number between 1 and 65535 (set to 0 to disable), and call callback when done
ER.prototype.setGroupID = function(grp, callback) { 
  this.cmd("ER_CMD#L7"+(65536|grp).toString(16).substr(-4),callback); 
};
/// Call callback(err, group_id)
ER.prototype.getGroupID = function(callback) { 
  this.cmd("ER_CMD#L7?",function(err,d) {
    callback(err, parseInt(d,16));
  }); 
};
/// Call callback(err, temperature)
ER.prototype.getTemperature = function(callback) { 
  this.cmd("ER_CMD#T7",function(err,d) {
    callback(err, parseFloat(d));
  }); 
};

exports.connect = function(serial, dataCallback) {
  return new ER(serial, dataCallback);
};
