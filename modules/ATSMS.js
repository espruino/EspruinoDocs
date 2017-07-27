/* Copyright (c) 2017 Gordon Williams. See the file LICENSE for copying permission. */
/* Simple SMS send/receive library */

/** This initialises the modem on the specified serial port. 
'options' is not currently used.

Once initialised, new messages will fire a `message`
event. You must then call `.list` to get unread messages.
*/
function ATSMS(serial, options) {
  var sms = this;
  this.serial = serial;
  this.at = require("AT").connect(serial);  
  this.at.registerLine("+CMTI: ", function(d) {
    sms.emit("message", d.substr(7));
    return "";
  });
}

/** Initialise the modem
Calls `callback(null)` on success, or callback(err_msg) on failure */
ATSMS.prototype.init = function(callback) {
  var at = this.at;
  this.at.cmd("ATE0\r\n",3000,function cb(d) {
    if (d=="ATE0") return cb;    
    if (d!="OK") callback("ATE0 ERROR "+d);
    at.cmd("AT+CMGF=1\r\n",1000,function(d) {
      if (callback) callback(d=="OK"?null:("CMGF ERROR "+d));
    });
  });
};

/** Send a text message, for example `sms.send('+441234567890','Hello world!', callback)`. 
Calls `callback(null)` on success, or callback(err_msg) on failure */
ATSMS.prototype.send = function(number, text, callback) {
  var at = this.at;  
  at.register('>', function() {
    at.unregister('>');
    at.write(text+"\x1A\r");
    return "";
  });
  at.cmd('AT+CMGS="'+number+'"\r\n',10000,function cb(d) {      
    at.unregister('>');
    if (d && d.substr(0,5)=="+CMGS") return cb;
    if (callback) callback(d=="OK"?null:("CMGS ERROR "+d));
  });
};

/** List SMSs. Index is either "ALL","REC READ" or "REC UNREAD".

Returns a callback(null, list) on success,
where list is an array of:

  {
    "index": 12,
    "isRead": true/false,
    "oaddr": "phone_number",
    "oname": "",
    "date": "17/07/24 16:15:34+04",
    "text": "text of message"
   }

Or callback(error_message) on failure */
ATSMS.prototype.list = function(index, callback) {
  var at = this.at;
  var list = [];
  var currItem;
  at.cmd('AT+CMGL="'+index+'"\r\n',10000,function cb(d) {
    // Handle the text that comes after message record
    if (currItem!==undefined && d!==undefined) {
      var numeric = false;
      if ((d.length&3)==0) {
        numeric = true;
        for (var i=0;i<d.length;i+=4) {
          var n = parseInt(d.substr(i,4),16);
          if (!isNaN(n)) {
            currItem.text += String.fromCharCode(n);
          } else {
            numeric = false;
            break;
          }
        }
      }
      if (!numeric) currItem.text=d;
      currItem = undefined;
      return cb;
    }
    // Handle message record
    if (d && d.substr(0,7)=="+CMGL: ") {
      try {
        var rec = JSON.parse("["+d.substr(7)+"]");
        currItem = {
          index : rec[0],
          isRead : rec[1]=="REC READ",
          oaddr : rec[2],
          oname : rec[3],
          time : rec[4],
          text : "",
        };
        list.push(currItem);
      } catch (e) { }
      return cb;
    }
    if (callback) callback(d=="OK"?null:("CMGL ERROR "+d), list);
  });
};

/** Delete a text message. Use the index from `sms.list`. 
Calls `callback(null)` on success, or callback(err_msg) on failure */
ATSMS.prototype.delete = function(index, callback) {
  this.at.cmd("AT+CMGD="+index+"\r\n",1000,function cb(d) {
    if (callback) callback(d=="OK"?null:("CMGD ERROR "+d));
  });
};

exports = ATSMS;
