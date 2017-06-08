var WIFI_BOOT = A13;
var WIFI_CHPD = A14;
var WIFI_SERIAL = Serial2;
digitalWrite(WIFI_CHPD, 0); // make sure WiFi starts off

var MODE = { CLIENT : 1, AP : 2 };
var ENCR_FLAGS = ["open","wep","wpa_psk","wpa2_psk","wpa_wpa2_psk"];

var wifiMode = 0;
var at;
var socks = [];
var sockData = ["","","","",""];
var MAXSOCKETS = 5;

/*
`socks` can have the following states:

undefined         : unused
true              : connected and ready
"DataClose"       : closed on esp8266, but with data still in sockData
"Wait"            : waiting for connection (client), or for data to be sent
"WaitClose"       : We asked to close it, but it hasn't been opened yet
"Accept"          : opened by server, waiting for 'accept' to be called
*/

// -----------------------------------------------------------------------------------
var netCallbacks = {
  create : function(host, port) {
    /* Create a socket and return its index, host is a string, port is an integer.
    If host isn't defined, create a server socket */  
    if (host===undefined) {
      sckt = MAXSOCKETS;
      socks[sckt] = "Wait";
      sockData[sckt] = "";
      at.cmd("AT+CIPSERVER=1,"+port+"\r\n", 10000, function(d) {
        if (d=="OK") {
          socks[sckt] = true;
        } else {
          socks[sckt] = undefined;
          setTimeout(function() {
            throw new Error("CIPSERVER failed ("+(d?d:"Timeout")+")");
          }, 0);
        }
      });
      return MAXSOCKETS;
    } else {  
      var sckt = 0;
      while (socks[sckt]!==undefined) sckt++; // find free socket
      if (sckt>=MAXSOCKETS) return -7; // SOCKET_ERR_MAX_SOCK
      socks[sckt] = "Wait";
      sockData[sckt] = "";
      at.cmd('AT+CIPSTART='+sckt+',"TCP",'+JSON.stringify(host)+','+port+'\r\n',10000, function cb(d) {
        if (d!="OK") socks[sckt] = -6; // SOCKET_ERR_NOT_FOUND
      });
    }
    return sckt;
  },
  /* Close the socket. returns nothing */
  close : function(sckt) {    
    if (socks[sckt]=="Wait")
      socks[sckt]="WaitClose";
    else if (socks[sckt]!==undefined) {
      // socket may already have been closed (eg. received 0,CLOSE)
      if (socks[sckt]<0)
        socks[sckt] = undefined;
      else
      // we need to a different command if we're closing a server
        at.cmd(((sckt==MAXSOCKETS) ? 'AT+CIPSERVER=0' : ('AT+CIPCLOSE='+sckt))+'\r\n',1000, function(d) {
          socks[sckt] = undefined;
        });
    }
  },
  /* Accept the connection on the server socket. Returns socket number or -1 if no connection */
  accept : function(sckt) {
    // console.log("Accept",sckt);
    for (var i=0;i<MAXSOCKETS;i++)
      if (socks[i]=="Accept") {
        //console.log("Socket accept "+i,JSON.stringify(sockData),JSON.stringify(socks));
        socks[i] = true;
        return i;
      }
    return -1;
  },
  /* Receive data. Returns a string (even if empty).
  If non-string returned, socket is then closed */
  recv : function(sckt, maxLen) {    
    if (at.isBusy() || socks[sckt]=="Wait") return "";
    if (sockData[sckt]) {
      var r;
      if (sockData[sckt].length > maxLen) {
        r = sockData[sckt].substr(0,maxLen);
        sockData[sckt] = sockData[sckt].substr(maxLen);
      } else {
        r = sockData[sckt];
        sockData[sckt] = "";
        if (socks[sckt]=="DataClose")
          socks[sckt] = undefined;
      }
      return r;
    }
    if (socks[sckt]<0) return socks[sckt]; // report an error
    if (!socks[sckt]) return -1; // close it
    return "";
  },
  /* Send data. Returns the number of bytes sent - 0 is ok.
  Less than 0  */
  send : function(sckt, data) {
    if (at.isBusy() || socks[sckt]=="Wait") return 0;
    if (socks[sckt]<0) return socks[sckt]; // report an error 
    if (!socks[sckt]) return -1; // close it
    //console.log("Send",sckt,data);
   
    var cmd = 'AT+CIPSEND='+sckt+','+data.length+'\r\n';
    at.cmd(cmd, 10000, function cb(d) {       
      if (d=="OK") {
        at.register('> ', function() {
          at.unregister('> ');
          at.write(data);          
          return "";
        });
        return cb;
      } else if (d=="Recv "+data.length+" bytes") {
        // all good, we expect this 
        return cb;
      } else if (d=="SEND OK") {
        // we're ready for more data now
        if (socks[sckt]=="WaitClose") netCallbacks.close(sckt);
        socks[sckt]=true;
      } else {
        socks[sckt]=undefined; // uh-oh. Error.      
        at.unregister('> '); 
      }
    });
    // if we obey the above, we shouldn't get the 'busy p...' prompt
    socks[sckt]="Wait"; // wait for data to be sent
    return data.length;
  }
};


//Handle +IPD input data from ESP8266
function ipdHandler(line) {
  var colon = line.indexOf(":");
  if (colon<0) return line; // not enough data here at the moment
  var parms = line.substring(5,colon).split(",");
  parms[1] = 0|parms[1];
  var len = line.length-(colon+1);
  if (len>=parms[1]) {
   // we have everything
   sockData[parms[0]] += line.substr(colon+1,parms[1]);
   return line.substr(colon+parms[1]+1); // return anything else
  } else { 
   // still some to get
   sockData[parms[0]] += line.substr(colon+1,len);
   return "+IPD,"+parms[0]+","+(parms[1]-len)+":"; // return IPD so we get called next time    
  }
}
// -----------------------------------------------------------------------------------

function changeMode(callback, err) {
  if (err) return callback(err);
  at.cmd("AT+CWMODE="+wifiMode+"\r\n", 1000, function(cwm) {
    if (cwm!="no change" && cwm!="OK" && cwm!="WIFI DISCONNECT")
      callback("CWMODE failed: "+(cwm?cwm:"Timeout"));
    else      
      callback(null);
  });
}

function sckOpen(ln) {
  //console.log("CONNECT", JSON.stringify(ln));
  socks[ln[0]] = socks[ln[0]]=="Wait" ? true : "Accept";
}
function sckClosed(ln) {
  //console.log("CLOSED", JSON.stringify(ln));
  socks[ln[0]] = sockData[ln[0]]!="" ? "DataClose" : undefined;
}

function turnOn(mode, callback) {
  var wasOff = wifiMode == 0;
  wifiMode |= mode;
  if (wasOff) {
    WIFI_SERIAL.setup(115200, { rx: A3, tx : A2 });
    at = require("AT").connect(WIFI_SERIAL);  
    at.register("+IPD", ipdHandler);
    at.registerLine("0,CONNECT", sckOpen);
    at.registerLine("1,CONNECT", sckOpen);
    at.registerLine("2,CONNECT", sckOpen);
    at.registerLine("3,CONNECT", sckOpen);
    at.registerLine("4,CONNECT", sckOpen);
    at.registerLine("0,CLOSED", sckClosed);
    at.registerLine("1,CLOSED", sckClosed);
    at.registerLine("2,CLOSED", sckClosed);
    at.registerLine("3,CLOSED", sckClosed);
    at.registerLine("4,CLOSED", sckClosed);  
    exports.at = at;
    require("NetworkJS").create(netCallbacks);
    at.cmd("\r\nAT+RST\r\n", 10000, function cb(d) {
      if (d=="ready" || d=="Ready.") setTimeout(function() { 
        at.cmd("ATE0\r\n",1000,function cb(d) { // turn off echo    
          if (d=="ATE0") return cb;
          if (d=="OK") {
            at.cmd("AT+CIPMUX=1\r\n",1000,function(d) { // turn on multiple sockets
              if (d!="OK") callback("CIPMUX failed: "+(d?d:"Timeout"));
              else changeMode(callback);
            });
          }
          else callback("ATE0 failed: "+(d?d:"Timeout"));
        });
      }, 500);
      else if (d===undefined) callback("No 'ready' after AT+RST");
      else return cb;
    });

    digitalWrite(WIFI_BOOT, 1); // out of boot mode
    digitalWrite(WIFI_CHPD, 1); // turn on wifi
  } else {
    changeMode(callback);
  }  
}

function turnOff(mode) {
  wifiMode &= ~mode;
  if (!wifiMode) {
    WIFI_SERIAL.removeAllListeners();
    at = undefined;
    exports.at = undefined;
    digitalWrite(WIFI_CHPD, 0); // turn off Wifi
    socks = []; // force close of all sockets
  } else {
    changeMode(function(){}, null);
  }
}

/** Power on the ESP8266 and connect to the access point 
      apName is the name of the access point
      options can contain 'password' which is the AP's password
      callback is called when a connection is made */
exports.connect = function(apName, options, callback) {
  var apKey = "";
  if (options.password!==undefined) apKey=options.password;
  turnOn(MODE.CLIENT, function(err) {
    if (err) return callback(err);
    at.cmd("AT+CWJAP="+JSON.stringify(apName)+","+JSON.stringify(apKey)+"\r\n", 20000, function cb(d) {
      if (["WIFI DISCONNECT","WIFI CONNECTED","WIFI GOT IP","+CWJAP:1"].indexOf(d)>=0) return cb;
      if (d!="OK") setTimeout(callback,0,"WiFi connect failed: "+(d?d:"Timeout"));
      else setTimeout(callback,0,null);
    });
  });  
};

/** Disconnect from the WiFi network and power down the
ESP8266. */
exports.disconnect = function() {
  turnOff(MODE.CLIENT);
};

/** Get the IP and MAC address when connected to an AP and call 
`callback(err, { ip : ..., mac : ...})`. If err isn't null,
it contains a string describing the error. This doesn't work
when only in AP mode (the IP address is always 192.168.4.1) */
exports.getIP = function(callback) {
  var ip = {}; 
  at.cmd("AT+CIFSR\r\n", 1000, function cb(d) { 
    if (d===undefined) { callback("Timeout"); return; }
    else if (d.substr(0,12)=="+CIFSR:STAIP") ip.ip = d.slice(14,-1);
    else if (d.substr(0,13)=="+CIFSR:STAMAC") ip.mac = d.slice(15,-1);
    else if (d=="OK") { callback(null, ip); return; }
    return cb; 
  });
};

/* Create a WiFi access point allowing stations to connect.
     ssid - the AP's SSID
     options.password - the password - must be at least 8 characters (or 10 if all numbers)
     options.authMode - "open", "wpa2", "wpa", "wpa_wpa2"
     options.channel - the channel of the AP
*/
exports.startAP = function(ssid, options, callback) {  
  options = options||{};
  if (!options.password || options.password.length<8) throw new Error("Password must be at least 8 characters");
  var enc = options.password?"3":"0"; // wpa2 or open
  if (options.authMode) {
    enc={
      "open":0,
      "wpa":2,
      "wpa2":3,
      "wpa_wpa2":4
    }[options.authMode];
    if (enc===undefined) throw new Error("Unknown authMode "+options.authMode);
  }
  if (options.channel===undefined) options.channel=5;

  turnOn(MODE.AP, function(err) {
    if (err) return callback(err);
    at.cmd("AT+CWSAP="+JSON.stringify(ssid)+","+JSON.stringify(options.password)+","+options.channel+","+enc+"\r\n", 5000, function(cwm) {
      if (cwm!="OK") callback("CWSAP failed: "+(cwm?cwm:"Timeout"));
      else callback(null);        
    });
  });
};

/* Stop being an access point and disable the AP operation mode. 
   AP mode can be re-enabled by calling startAP. */
exports.stopAP = function() {
  turnOff(MODE.AP);
};


/* Scan for access points, and call the callback(err, result) with 
   an array of {ssid, authMode, rssi, mac, channel} */
exports.scan = function(callback) {
  var aps = [];
  turnOn(MODE.CLIENT, function(err) {
    if (err) return callback(err);
    at.cmdReg("AT+CWLAP\r\n", 5000, "+CWLAP:",
      function(d) {
        var ap = d.slice(8,-1).split(",");
        aps.push({ ssid : JSON.parse(ap[1]),
                   authMode: ENCR_FLAGS[ap[0]],
                   rssi: parseInt(ap[2]),
                   mac : JSON.parse(ap[3]),
                   channel : JSON.parse(ap[4]) });
      },
      function(d) { callback(null, aps); }
    );
  });
};

/** This function returns some of the internal state of the WiFi module, and can be used for debugging */
exports.debug = function() {
  return {
    wifiMode : wifiMode,
    socks : socks,
    sockData : sockData
  };
};

