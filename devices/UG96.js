/* Copyright (c) 2017, STMicroelectronics, Gordon Williams, Tobias Schwalm - See the file LICENSE for copying permission. */
/*
  Largely inspired from SIM900 modem library
  Library for interfacing to the UG96 modem (Quectel).
  Uses the 'NetworkJS' library to provide a JS endpoint for HTTP.
*/

/* supported features

 - debug messages, 4 views :
 no debug, view in the module, view on the AT channel, full debug

 - Flow control, as Espruino implementation :
 Espruino sets the CTS pin
 whenever it is ready to receive data or whenever it is too busy to receive

 - full modem initialization :
   AT synchronization,
   SIM card detection,
   signal measurement,
   automatic operator selection

 - TCP Client working in Direct Push mode, up to 12 sockets

 - GeoLocalisation by base station
*/


/* Not supported features
 - TCP Client working in Buffer Access Mode
 - TCP Server
 - UDP Service
 - multiple PDP contexts
*/

/*
Sample code :

function QuectelStart(debug_quectel, debug_at) {
  debug_quectel = debug_quectel || false;
  debug_at = debug_at || false;

  // RTS, CTS settings
  pinMode(D11, "input", true);
  pinMode(D12, "output", true);

  Serial3.setup(115200, { rx: D9, tx : D8, cts: D12 });

  resetOptions = {
   rst: "A8",
   pwrkey: "A6",
   rst_active_level: 1,
   pwrkey_active_level: 0,
  };
  gprs = require('UG96').connect(Serial3, resetOptions, function(err) {
    log("connectCB entered...");
    if (err) throw err;
    setTimeout(doConnect,30000);
  });

  gprs.debug(debug_quectel, debug_at);

  gprs.initflowctrl(true);
}

function doConnect() {
  gprs.connect(APN, USERNAME, PASSWORD, function(err) {
    log("gprs.connectCB entered...");
    if (err) throw err;
    gprs.getIP(print);

    ...

  });
}

*/

var at;
var busy = false;


/* socks may have the following states:
undefined       : unused
true            : connected and ready
Wait            : waiting for connection (client), or for data to be sent
tobeclosed      : closed (either locally request or remotly or both)
                  but not yet closed because of data still in the pipe.
*/
var socks = [];

/*
each socket has its string buffer
where remote data are written (receipt of data from the modem)
and from where the local upper layer take the data
*/
var sockData = ["","","","","","","","","","","",""];
var MAXSOCKETS = 12;

/* physical turn on & reset pins */
var rst;
var rst_active_level;
var pwrkey;
var pwrkey_active_level;
var flowcontrol = false;

/* Geolocalisation variables :  longitude,latitude */
var longlat = "";
/* Geolocaliation state (running or not) */
var geoPos = false;

// by default, without setting, debug in the module is disabled
var dbg = false;

var ccid;

/* modem may have the following initialization states */
var AtInitSequence = {
  AT_SYNCHRO: 0,
  AT_RSP_FORMAT: 1,
  AT_ECHO_OFF: 2,
  AT_CPIN: 3,
  AT_SHOW_SIM_ID: 4,
  AT_RADIO_ON: 5,
  AT_QUERY_SIGNAL_QUALITY: 6,
  AT_PS_ATTACHMENT: 7,
  AT_AUTOMATIC_OPERATOR_SELECTION: 8,
  AT_LIST_CURRENT_OPERATORS: 9,
  AT_CURRENT_OPERATOR: 10,
  AT_HW_FLOW_CONTROL: 11,
};

/* TimeOut Id for the send procedure */
var idWaitingPrompt = 0;
var idWaitingModemRsp = 0;

function log(msg) {
  console.log(msg);
}
function dbglog(msg) {
  if (dbg) console.log(msg);
}

/*
openSocket is triggered at the socket creation, as earlier as possible.
Nevertheless, this function can be delayed to enter in secure mode (since using of encrypted keys can take time in mbed )
In case of failure with Error code "socket connect failed", try and repeat 5 times the openSocket
*/
function openSocket(sckt, host, port, counter) {
  if (busy) {
    dbglog("Opening is not yet possible, busy state on socket " + sckt);
    if (counter < 5) {
      setTimeout(function cb(){log("opening later..."); openSocket(sckt, host, port, counter+1);}, 500);
    } else {
      dbglog("Force the closure of socket " + sckt);
      socks[sckt] = "tobeclosed";
    }
  } else if (at.isBusy()) {
    dbglog("Opening is not yet possible, AT busy state on socket " + sckt);
    if (counter < 5) {
      setTimeout(function cb(){log("opening later..."); openSocket(sckt, host, port, counter+1);}, 500);
    } else {
      dbglog("Force the closure of socket " + sckt);
      socks[sckt] = "tobeclosed";
    }
  } else {
  dbglog('AT+QIOPEN=1,'+sckt+',"TCP",'+JSON.stringify(host)+','+port+',0,1');

  at.cmd('AT+QIOPEN=1,'+sckt+',"TCP",'+JSON.stringify(host)+','+port+',0,1\r\n',15000, function cb(d) {
    if (d=="OK") {
      //dbglog("AT+QIOPEN OK on socket" +sckt);
      // waiting for +QIOPEN: <connectID>,<err>
      return cb;
    } else if (d=='+QIOPEN: '+sckt+",0") {
      dbglog(d);
      dbglog("AT+QIOPEN completed with socket: " + sckt);
      socks[sckt] = true;
      return "";
    } else if (d=='+QIOPEN: '+sckt+",565") {
      dbglog("AT+QIOPEN failure DNS parse failed...");
      if (counter < 5) {
        setTimeout(function cb(){log("repeat opening the socket ..."); openSocket(sckt, host, port,(counter+1));}, 1000);
      } else {
        dbglog("Force the closure of socket " + sckt);
        socks[sckt] = "tobeclosed";
      }
      return "";
    } else if (d=='+QIOPEN: '+sckt+",566") {
      dbglog("AT+QIOPEN failure could not connect socket ...");
        if (counter < 5) {
          setTimeout(function cb(){log("repeat opening the socket ..."); openSocket(sckt, host, port,(counter+1));}, 3000);
        } else {
          dbglog("Force the closure of socket " + sckt);
          socks[sckt] = "tobeclosed";
        }
      return "";
    } else if (d=='+QIOPEN: '+sckt+",563") {
      dbglog("AT+QIOPEN socket identity has been used..., socket is:" + sckt);
      socks[sckt] = "tobeclosed";
      return "";
    } else {
      dbglog("AT+QIOPEN failed on socket:" + sckt);
      /*if (dbg) {
        at.cmd("AT+QIGETERROR\r\n",1000, function cb(d) {
          dbglog(d);
        });
      }*/
      //dbglog("Force the closure of socket " + sckt);
      socks[sckt] = "tobeclosed";
      return "";
    }
  });
  }
}

/*
Closesocket is run because of 2 triggers :
- either from a local trigger (http layer on the target)
- or from a remote trigger (host on network)

Closing is done for active socket which are not sending
-	check socket exists, verify the socket state is not "undefined"
- closing cannot bypass sending

Closing is possible if the AT media is free
- check if a AT communication is on-going

At the end, socket is either closed (successful) or waiting to be closed.
In this last case, either a new closing is initiated (remote if first attemps was local, local if first attemps was remote)
or triggered from this module when data buffer is emptied
- Mark this socket as tobeclosed, will be closed when data buffer emptied
*/
function closeSocket(socket, counter) {
  if(socks[socket]) {
    if ((sockData[socket].length > 0) && (counter < 5)) {
      log("socket " + socket + " is emptying...");
      setTimeout(function cb(){log("closing later..."); closeSocket(socket, (counter+1));}, 500);
	} else if (busy) {
      dbglog("at register currenly programmed");
      if (counter < 5) {
        setTimeout(function cb(){log("closing later..."); closeSocket(socket, (counter+1));}, 500);
      } else {
        dbglog("several busy situation on socket " + socket);
        socks[socket] = undefined;
      }
    } else if (at.isBusy()){
      dbglog("AT busy");
      if (counter < 5) {
        setTimeout(function cb(){log("closing again..."); closeSocket(socket, (counter+1));}, 500);
      } else {
        dbglog("several AT busy situation on socket " + socket);
        socks[socket] = undefined;
      }
    } else {
      dbglog("sending AT+QICLOSE for socket " + socket);
      at.cmd('AT+QICLOSE='+socket+"\r\n",2000, function cb(d) {

        /* case processing with no response (timeOut) */
        if (d===undefined) {
          if (counter < 5) {
            setTimeout(function cb(){log("closing again..."); closeSocket(socket, (counter+1));}, 500);
          } else {
            dbglog("cannot properly close socket " + socket);
           socks[socket] = undefined;
          }
          return "";
        }

        /* case processing with a response */
        //dbglog(d);
        if (d=="OK") {
          dbglog("socket " + socket + " is properly closed");
          socks[socket] = undefined;
          return "";
        } else {
          //dbglog("cannot close now socket " + socket +",error=" + d);
          dbglog("socket " + socket + " is not yet closed");
          //socks[socket] = "tobeclosed";
          //socks[socket] = undefined;
          return cb;
        }
      });
    }
  } else {
    dbglog("socket already closed");
  }
}

/*
abortWaiting frees the registering (preventive)
*/
function abortWaitingPrompt(socket) {
  dbglog("Abort waiting prompt (for sending data) on socket " + socket);
  busy = false;
  idWaitingPrompt = 0;
  if (idWaitingModemRsp) {
    clearTimeout(idWaitingModemRsp);
    idWaitingModemRsp = 0;
    at.unregisterLine('SEND OK');
    at.unregisterLine('SEND FAIL');
    at.unregisterLine('ERROR');
  }
  at.unregister('>');
  socks[socket]="tobeclosed";
}

function abortWaitingModemRsp(socket) {
  dbglog("Abort waiting modem response (sending data) on socket " + socket);
  busy = false;
  idWaitingModemRsp = 0;
  at.unregisterLine('SEND OK');
  at.unregisterLine('SEND FAIL');
  at.unregisterLine('ERROR');
  socks[socket]="tobeclosed";
}

var netCallbacks = {
  create: function(host, port) {
    var sckt = 0;

    /* Create a socket and return its index, host is a string, port is an integer.
    If host isn't defined, create a server socket */
    if (host===undefined) {
      dbglog("WARNING: this has not been fully ported for UGxx");
      sckt = MAXSOCKETS;
      socks[sckt] = "Wait";
      sockData[sckt] = "";
      at.cmd("AT+CIPSERVER=1,"+port+"\r\n", 10000, function(d) {
        if (d=="OK") {
          socks[sckt] = true;
        } else {
          socks[sckt] = undefined;
          throw new Error("CIPSERVER failed");
        }
      });
      return MAXSOCKETS;
    } else {
      while (socks[sckt]!==undefined) sckt++; // find free socket
      if (sckt>=MAXSOCKETS) //throw new Error('No free sockets.')
	  {
        dbglog("WORKAROUND closing the socket: " + sckt);
        sckt--;
        closeSocket(sckt, 0);
	  }

      socks[sckt] = "Wait";
      sockData[sckt] = "";

      if (port == 443) {
        dbglog("delaying the TLS socket opening");
        setTimeout(function cb(){openSocket(sckt, host, port,0);}, 3000);
      } else {
        openSocket(sckt, host, port,0);
      }

      dbglog("(create) sckt " + sckt + " state = " + socks[sckt]);
    }
    return sckt; // jshint ignore:line
  },
  /* Close the socket. returns nothing */
  close: function(sckt) {
    dbglog("(local) Closing of the socket: " + sckt);
    closeSocket(sckt, 0);
  },
  /* Accept the connection on the server socket. Returns socket number or -1 if no connection */
  accept: function(sckt) {
    dbglog("Accept Socket "+sckt);
    for (var i=0;i<MAXSOCKETS;i++) {
      if (sockData[i] && socks[i]===undefined) {
        //dbglog("Socket accept "+i+" "+JSON.stringify(sockData[i]),socks[i]);
        socks[i] = true;
        return i;
      }
    }
    return -1;
  },
  /* Receive data. Returns a string (even if empty).
  If non-string returned, socket is then closed */
  recv: function(sckt, maxLen) {
    if (at.isBusy() || socks[sckt]=="Wait") return "";
    if (sockData[sckt]) {
      var r;

      if (sockData[sckt].length > maxLen) {
        r = sockData[sckt].substr(0,maxLen);
        sockData[sckt] = sockData[sckt].substr(maxLen);
      } else {
        r = sockData[sckt];
        sockData[sckt] = "";
      }
      return r;
    }
    if (!socks[sckt]) return -1; // close it
    // No more data in pipe and status closing, so request close
    if (socks[sckt]=="tobeclosed") return -1; // request closing
    return "";
  },
  /* Send data. Returns the number of bytes sent - 0 is ok.
  Less than 0 as a request to close the socket */
  send: function(sckt, data) {
    if (busy || at.isBusy() || socks[sckt]=="Wait") return 0;
    if (socks[sckt]=="tobeclosed") return -1; // request closing
    if (!socks[sckt]) return -1; // error - close it
    if (data.length > 1460) { dbglog("data too big"); return -1; } // error - close it

    busy = true;

    idWaitingModemRsp = setTimeout(function(){abortWaitingModemRsp(sckt)},6000);
    idWaitingPrompt = setTimeout(function(){abortWaitingPrompt(sckt)},5000);

    at.register('>', function() {
      dbglog("Prompt coming, sending data ...");
      at.unregister('>');
      clearTimeout(idWaitingPrompt);
      idWaitingPrompt = 0;
      dbglog("writing data amount of " +data.length);
      at.write(data);
      return "";
    });

	/* wait for the modem response */
    at.registerLine('SEND OK', function() {
      dbglog("UGxx - SEND OK");
      at.unregisterLine('SEND OK');
      at.unregisterLine('SEND FAIL');
      at.unregisterLine('ERROR');
      clearTimeout(idWaitingModemRsp);
      idWaitingModemRsp = 0;
      busy = false;
      return "";
    });

	/* connection has been established but sending buffer is full */
	/* wait for the modem response */
     at.registerLine('SEND FAIL', function(sckt) {
      dbglog("UGxx - SEND FAIL");
      at.unregisterLine('SEND OK');
      at.unregisterLine('SEND FAIL');
      at.unregisterLine('ERROR');
      clearTimeout(idWaitingModemRsp);
      idWaitingModemRsp = 0;
      busy = false;
      socks[sckt]="tobeclosed";
      return "";
    });

	/* connection has not been established, abnormally closed, or parameter is incorrect */
     at.registerLine('ERROR', function(sckt) {
      dbglog("UGxx - ERROR communication");
      if (idWaitingPrompt)
      {
        at.unregister('>');
        clearTimeout(idWaitingPrompt);
        idWaitingPrompt = 0;
      }
      at.unregisterLine('SEND OK');
      at.unregisterLine('SEND FAIL');
      at.unregisterLine('ERROR');
      clearTimeout(idWaitingModemRsp);
      idWaitingModemRsp = 0;
      busy = false;
      socks[sckt]="tobeclosed";
      return "";
    });

    dbglog("AT+QISEND="+sckt+","+data.length);

    // Just write some data, don't wait for a response
    at.write('AT+QISEND='+sckt+','+data.length+'\r\n');
    dbglog("(send) sckt " + sckt + " state = " + socks[sckt]);
    dbglog("send " + data.length);
    return data.length;
  }
};

/*
Handle +QUIRC incoming data from modem previously configured in direct push mode

Typical expected format : +QIURC:"recv",<connectID>,<currentrecvlength><CR><LF><data>

 Several cases :
 - case 1 : receipt of something where end of line is missing
+QIURC: "recv"

- case 2 : receipt of something where line is smaller than expected
+QIURC: "recv",0,259\r\nHTTP/1.1 "

- case 3 : receipt of something where line is greater than expected
+QIURC: "recv",0,263\r\ndata\r\n+QIURC: "closed",0\r\n

*/
function receiveHandler(line) {
  // colon equal -1 when end of line is missing (case 1)
  var colon = line.indexOf("\r\n");

  // no <CR><LF> or line too short
  if (colon<0) {
	  return line; // not enough data here at the moment
  }

  var parms = line.substring(15,colon).split(",");

  // trick here is to converted string into integer
  parms[1] = 0|parms[1];

  // len :  length of the remaining characters beyond the first line
  var len = line.length-(colon+2);

  if (len>=parms[1]) {
    // we have everything
    if (socks[parms[0]] == true) {
      sockData[parms[0]] += line.substr(colon+2,parms[1]);
    }
    return line.substr(colon+parms[1]+3); // return anything else
  } else {
	 // still some to get - use getData to request a callback
	 sockData[parms[0]] += line.substr(colon+2,len);
   at.getData(parms[1]-len, function(data) { sockData[parms[0]] += data; });
   return "";
  }
}

/*
When TCP socket service is closed by remote peer or network error, this function is entered

Typical expected format : +QIURC: "recv",<connectID><CR><LF>

First search for <CR><LF> index in the line to locate the end
Note <CR> is enough (no need to wait for <LF>) : this will immediatly closes the socket

2 options
- Not enough data may not have been received at this moment so that line is simply returned.
- Enough data may finally be received then search for the <connectID>
<connectID> is the socket index to close.

Note the trick to convert string into integer with this instruction :
parms[1] = 0|parms[1];
*/
function closehandler(line) {
  dbglog("closehandler:" + line);

  var colon = line.indexOf("\r\n");

  if (colon<0) {
    dbglog("not enough data " + line);

    var colon = line.indexOf("\r");
    if (colon<0) {
      dbglog("definitively not enough data " + line);
      return line;
    }
  }
  var parms = line.substring(0,colon).split(",");

  parms[1] = 0|parms[1];

  closeSocket(parms[1], 0);
  return ""
}

function pdpdeacthandler(line) {
  dbglog("pdpdeacthandler:" + line);
  at.cmd("AT+QIDEACT=1\r\n",1000, function(d) {
    dbglog(d);
    // reset internal state
    for (var i=0;i<MAXSOCKETS;i++) {
        socks[i] = undefined;
        sockData[i] = "";
    }
  });

  return ""
}

// Dust QIND URC
// it conveyed
//  +QIND: SMS DONE SMS initialization finished
//  +QIND: PB DONE Phonebook initialization finished
function QindHandler(line) {
  dbglog('QindHandler in: ' + line);

  //return "";

  var colon = line.indexOf("\r\n");
  var endstr = line.substr(colon,line.length);
  log(line.substr(colon,line.length));
  //re_inject other commands
  return endstr;
}

// Dust QSIM URC
// it gives SIM technology
//	+QUSIM: 0 Use SIM card
//  +QUSIM: 1 Use USIM card
function QusimHandler(line) {
  dbglog('QusimHandler in: ' + line);

  //return "";

  var colon = line.indexOf("\r\n");
  var endstr = line.substr(colon,line.length);
  log(line.substr(colon,line.length));
  //re_inject other commands
  return endstr;
}

// Dust CFUN URC
function CfunHandler(line) {
  dbglog('CfunHandler in: ' + line);

  // return "";

  var colon = line.indexOf("\r\n");
  var endstr = line.substr(colon,line.length);
  log(line.substr(colon,line.length));
  //re_inject other commands
  return endstr;
}

// Dust CFUN URC (not currently managed in this version)
// It means : "ME initialization is successful"
function RdyHandler(line) {
  dbglog('RdyHandler in: ' + line);

  // return "";

  var colon = line.indexOf("\r\n");
  var endstr = line.substr(colon,line.length);
  log(line.substr(colon,line.length));
  //re_inject other commands
  return endstr;
}

// Manage POWERED DOWN URC
// This is received when the modem has stored its data
// and deregistered(for instance saving of registered PLMN)
// Manage the pins so that modem is physically off
function PoweredDownHandler(line) {
  dbglog('PowerDownHandler in: ' + line);

  log("Modem is entering in power down");
  digitalWrite(pwrkey, pwrkey_active_level);

  return "";
}

var gprsFuncs = {
  receiveHandler: receiveHandler,
  "debug" : function(dbg_gprs = false, dbg_at = false) {
  dbg = dbg_gprs;
  // Return some debug data, but also enable debug mode.
  // Debug mode prints out what is sent and received
  if (dbg_at)  at.debug();
   return {
      socks:socks,
      sockData:sockData
    };
  },
  // initialise the modem
  // - Send AT command several times to synchronise with modem (autobaud feature)
  // - Set echo mode to OFF
  // - Check SIM card is accessible and ready (not pin protected of blocked)
  // - Show SIM ID (ICCID) for debug purposes
  // - query signal quality for information on the radio conditions
  // - Attemp a PS attachment or enter in an automatic mode searching for PLMNs
  "init": function(callback) {
	var atSync = 0;
    var attRetry = 0;
    var s = AtInitSequence.AT_SYNCHRO;
    var signal_quality_report = false;

    var cb = function(r) {
      switch(s) {
        case AtInitSequence.AT_SYNCHRO:

          dbglog("debug AT_SYNCHRO :" +r);

          if(r === 'AT') {
            // wait for OK
            return cb;
          }
          else
          {
            if(r === 'OK') {
              log("Synchronisation with module passed");

              s = AtInitSequence.AT_RSP_FORMAT;
              at.cmd("ATV1\r\n",1000,cb);
            }   else {
              s = AtInitSequence.AT_SYNCHRO;
              atSync++;
              dbglog("AT sync failed: " +r);

              if (atSync <= 10) {
                setTimeout(function(){at.cmd('AT\r\n', 1000, cb);},500);
              }
                else {
                  dbglog("No OK return after 10 times");
                  dbglog("Check the module is power on");
                  callback('Error in AT sync: ' + r);
              }
            }
          }
          break;
        case AtInitSequence.AT_RSP_FORMAT:

          dbglog("debug AT_RSP_FORMAT :" +r);

          /* Case processing with a response */
          if(r === 'OK') {
            // remove the echo
            s = AtInitSequence.AT_ECHO_OFF;
            at.cmd("ATE0\r\n",1000,cb);
          } else if(r === 'ATV1') {
            // wait for OK
            return cb;
          } else if(r) {
            callback('Error in ATV1: ' + r);
          }

          /* case processing with no response */
          if (r===undefined) {
           dbglog("Cannot set TA response format");
           callback('ATV1 time-out !!!');
          }
          break;

        case AtInitSequence.AT_ECHO_OFF:

          dbglog("debug AT_ECHO_OFF :" +r);

          /* Case processing with a response */
          if(r === 'IIIIATE0' ||
           r === 'IIII' + String.fromCharCode(255) + 'ATE0' ||
           (r && r.trim()=="ATE0")) {

            // wait for OK
            return cb;
          } else if(r === 'OK') {
            dbglog("ATE0 passed: " +r);
            if (flowcontrol) {
              s = AtInitSequence.AT_HW_FLOW_CONTROL;
              at.cmd('AT+IFC=2,2\r\n', 2000, cb);
            } else {
              s = AtInitSequence.AT_CPIN;
              at.cmd('AT+CPIN?\r\n', 5000, cb);
            }
          } else if (r === 'atE0') {
            dbglog("UGxx returns " + r);
            s = AtInitSequence.AT_CPIN;
            at.cmd('AT+CPIN?\r\n', 5000, cb);
          } else if(r) {
            callback('Error in ATE0: ' + r);
          }

          /* case processing with no response */
          if (r===undefined) {
            dbglog('ATE0 time-out !!!');
            s = AtInitSequence.AT_CPIN;
            at.cmd('AT+CPIN?\r\n', 5000, cb);
          }
          break;

        case AtInitSequence.AT_HW_FLOW_CONTROL:

          dbglog("debug AT_HW_FLOW_CONTROL :" +r);

          /* Case processing with a response */
          if(r === 'OK') {
            dbglog("HW flow control establismnent succeeded");

            s = AtInitSequence.AT_CPIN;
            at.cmd('AT+CPIN?\r\n', 5000, cb);

          } else {
            callback('HW flow control establismnent failed');
            s = AtInitSequence.AT_CPIN;
            at.cmd('AT+CPIN?\r\n', 5000, cb);
          }
          break;

        case AtInitSequence.AT_CPIN:

          dbglog("debug AT_CPIN :" +r);

          /* Case processing with a response */
          if(r === '+CPIN: READY') {
            // wait for OK
            return cb;
          } else if (r === 'OK') {
            s = AtInitSequence.AT_SHOW_SIM_ID;
            at.cmd('AT+QCCID\r\n', 2000, cb);
          } else if(r) {
            callback('Error in CPIN: ' + r);
          }

          /* case processing with no response */
          if (r===undefined) {
           dbglog("SIM cannot be read, SIM is either protected, blocked or not accessible");
           callback('AT+CPIN time-out !!!');
          }
          break;

        case AtInitSequence.AT_SHOW_SIM_ID:

          dbglog("debug AT_SHOW_SIM_ID :" +r);

          /* Case processing with a response */
          if (r&&r.substr(0,7)=="+QCCID:") {
            dbglog("SIM ID :" +r);

            ccid = r.substring(8,r.length-1);

            // wait for OK
            return cb;
          } else if (r === 'OK') {
            s = AtInitSequence.AT_RADIO_ON;
            // Set the modem with full functionality
            at.cmd('AT+CFUN=1\r\n', 15000, cb);
          } else if(r) {
            callback('Error in QCCID: ' + r);
          }

          /* case processing with no response */
          if (r===undefined) {
            callback('AT+QCCID time-out !!!');
          }
          break;

        case AtInitSequence.AT_RADIO_ON:

          dbglog("debug AT_RADIO_ON :" +r);

          /* Case processing with a response */
          if (r === 'OK') {
            s = AtInitSequence.AT_QUERY_SIGNAL_QUALITY;
            // check the signal quality in the field
            at.cmd('AT+CSQ\r\n', 2000, cb);
          } else if(r) {
            callback('Error in CFUN: ' + r);
          }

          /* case processing with no response */
          if (r===undefined) {
            callback('AT+CFUN time-out !!!');
          }
          break;

        case AtInitSequence.AT_QUERY_SIGNAL_QUALITY:

          dbglog("debug AT_QUERY_SIGNAL_QUALITY :" +r);

          /* Case processing with a response */
          if (r&&r.substr(0,5)=="+CSQ:") {
            // check signal is detectable before attempting attachment
            if (r&&r.substr(0,11)=="+CSQ: 99,99") {
              dbglog("Signal not known or not detectable yet");
              signal_quality_report = false;
            } else {
              signal_quality_report = true;

              var rssi = r.substring(6,r.length).split(",");
              rssi[0] = 0|rssi[0];

              var quality_level_dbm = -113 + 2*rssi[0];

              log("quality_level_dbm = " + quality_level_dbm + "dBm");

              // comment on quality signal for user to be done here
            }

            // wait for OK
            return cb;
          } else if (r === 'OK') {
            if (signal_quality_report) {
              s = AtInitSequence.AT_PS_ATTACHMENT;
              // check if we're on network
              dbglog('PS attachment is starting. It may take until a minute, please wait ... ');
              setTimeout(function(){at.cmd('AT+CGATT=1\r\n', 75000, cb);},5000);
            } else {
              // start and wait for the next quality signal report sequence
             setTimeout(function(){at.cmd('AT+CSQ\r\n', 2000, cb);},1000);
            }
          } else if(r) {
				callback('Error in QCCID: ' + r);
          }

          /* case processing with no response */
          if (r===undefined) {
            callback('AT+CSQ time-out !!!');
          }

		  break;

        case AtInitSequence.AT_PS_ATTACHMENT:

          dbglog("debug AT_PS_ATTACMENT :" +r);

          if(r === 'OK') {
            log("PS attachment succeeded");
            s = AtInitSequence.AT_CURRENT_OPERATOR;
            at.cmd('AT+COPS?\r\n', 20000, cb);
          } else if(r) {
            attRetry = attRetry +1;
            dbglog('Error in CGATT: ' + r + " - retry: " + attRetry);
            // CGATT has probably been called too early: let's give 3 (re)tries before concluding we do have an unrecoverable PS registration failure
            // First we will force the modem to search a network and register (regardless of PS service)
            if(1==attRetry) {
              dbglog("Trying an automatic registration first. It may take until 3 minutes, please wait ...");
              s = AtInitSequence.AT_AUTOMATIC_OPERATOR_SELECTION;
              setTimeout(function(){at.cmd('AT+COPS=0\r\n', 180000, cb);},2000);
            } else if(attRetry<4) {
              dbglog("Retrying CGATT with retry " + attRetry);
              s = AtInitSequence.AT_PS_ATTACHMENT;
              dbglog('PS attacment is attempting again. It may take until a minute, please wait ... ');
              setTimeout(function(){at.cmd('AT+CGATT=1\r\n', 75000, cb);},2000*attRetry);
            } else {callback('Unrecoverable Error, PS attachment failed: ' + r);}
          }
          break;

        case AtInitSequence.AT_AUTOMATIC_OPERATOR_SELECTION:
          // We do not check the return code, instead we ask for the COPS status
          dbglog("COPS returns: " + r);
          s = AtInitSequence.AT_LIST_CURRENT_OPERATORS;
          setTimeout(function(){at.cmd('AT+COPS?\r\n', 10000, cb);},5000);
          break;

        case AtInitSequence.AT_LIST_CURRENT_OPERATORS:
          // Let's do a blind retry of CGATT in 30sec from now (let's give time to the modem to handle the 3GPP re-attempts)
          dbglog(r + " - Now retrying PS attachment");
          s = AtInitSequence.AT_PS_ATTACHMENT;
          setTimeout(function(){at.cmd('AT+CGATT=1\r\n', 30000, cb);},30000);
          break;

        case AtInitSequence.AT_CURRENT_OPERATOR:

          dbglog("debug AT_CURRENT_OPERATOR :" +r);

          /* Case processing with a response */
          if(r === 'OK') {
            callback(null);
          }
          else if (r&&r.substr(0,6)=="+COPS:") {
            log("currently selected operator :" +r);
            // wait for OK
            return cb;
          } else if(r) {
            callback('Error in COPS? ' + r);
          }

          /* case processing with no response */
          if (r===undefined) {
            callback('AT+COPS? time-out !!!');
          }
          break;

      }
    };
    /* repeat AT SYNC: Send AT every 500ms, if receive OK, SYNC success, if no OK return after sending AT 10 times, SYNC fail */
    setTimeout(function(){at.cmd('AT\r\n', 1000, cb);},500);
  },
  "reset": function(callback) {
    function reset_pulse(callback) {
      digitalWrite(rst, rst_active_level);
      setTimeout(function() {
        digitalWrite(rst, !rst_active_level);
        setTimeout(function() {
          gprsFuncs.init(callback);
        }, 6000);
      }, 200);
    };

    function pwrkey_pulse(callback) {
      digitalWrite(pwrkey, pwrkey_active_level);
      setTimeout(function() {
        digitalWrite(pwrkey, !pwrkey_active_level);
        setTimeout(function() {
            if(rst) {
              reset_pulse(callback);
            } else {
              gprsFuncs.init(callback);
            }
        }, 5000);
      }, 200);
    };

    // reset state
    for (var i=0;i<MAXSOCKETS;i++) {
        socks[i] = undefined;
        sockData[i] = "";
    }
    if (rst === undefined && pwrkey===undefined) return gprsFuncs.init(callback);
    dbglog("Here we go trhough reset sequence");
    // ensure reset is not active
    if (rst) digitalWrite(rst, !rst_active_level);
    // there is either pwr_key or reset, if pwrkey start with it,
    // then use reset if present
    if (pwrkey) {
        pwrkey_pulse(callback);
    } else {
        reset_pulse(callback);
    }
    log("Cellular module initialization started, please wait ...");
  },
  "getVersion": function(callback) {
    at.cmd("AT+GMR\r\n", 1000, function(d) {
      callback(null,d);
    });
  },
  "connect": function(apn, username, password, callback) {
    var s = 0;
    var cb = function(r) {
      switch(s) {
        case 0:
          dbglog("connect callback after PDP context configuration");
          if(r === 'OK') {
            s = 1;

            dbglog("PDP context successfully configured");
            at.cmd('AT+QIACT=1\r\n', 30000, cb);
          } else if(r) {
            callback('Error in ' + s + ': ' + r);
          }
          if (r===undefined) {
            dbglog("PDP context activation failed, timeout...");
          }
          break;

        case 1:
          dbglog("connect callback after PDP context activation");
          if(r === 'OK') {
            log("PDP context successfully activated");
            callback(null);
          }
          else if(r) {
            callback('Error in ' + s + ': ' + r);
          } else {
            callback(null);
          }
          break;
      }
    };
    dbglog("in the connect function: AT+QICSGP stage");
    at.cmd('AT+QICSGP=1,1,"'+apn + '", "' + username + '", "' + password + '"\r\n', 30000, cb);
  },
  "initflowctrl" : function(flowcontrol_modem = false) {
    flowcontrol = flowcontrol_modem;
  },
  "getIP": function(callback) {
    var ip = "";
    var cb = function(r) {
      dbglog("AT+CGPADDR callback: " + r);
      if (r===undefined) {
        dbglog("timeout : any IP address allocated ...");
          callback(null,ip);
      } else if (r==='OK') {
        callback(null,ip);
        log("IP address allocated, modem is ready to use");
      }
      else {
        ip = ip +r;
        dbglog(r);
        return cb;
      }
    };

    dbglog("getIP is AT+CGPADDR");
    at.cmd('AT+CGPADDR=1\r\n', 30000, cb);
  },
  "geoLocGet": function(callback) {
    log("Getting geolocalization data");
    callback(longlat);
  },
  "geoLocStart": function(period) {
    log("Starting GeoLocalization");
    if (period < 10000) log("unpredictive behaviour with period not greater than 10 s !");
    geoPos = true;

    var cb = function(r) {
        if (r===undefined) {
          dbglog("GeoLocalization timeout");
          longlat = "";
        } else if (r==='OK') {
          log("GeoLocalization acquisition done : " + longlat);
        } else if (r&&r.substr(0,10)=="+QCELLLOC:") {
          var pos_last = r.length;
          var pos_space = r.indexOf(" ");
          longlat = r.substring(1+pos_space,pos_last);

          dbglog(longlat);

          /* wait for OK */
          return cb;
        } else {
          longlat = "";
          log("Geolocalization error : " + r);
        }
      if (geoPos) {
        /* new trigger */
        setTimeout(function(){at.cmd('AT+QCELLLOC=1\r\n', 2000, cb);},period);
      }
    };

    at.cmd('AT+QCELLLOC=1\r\n', 2000, cb);
  },
  "geoLocStop": function() {
    log("Stopping GeoLocalization");

    geoPos = false;

    longlat = "";
  },
  "turnOff": function() {

    log("Turning Off the modem");

    var cb = function(r) {
      if (r==='OK') {
        log("Please wait, disconnecting and saving data. It may last until 60 s");

        /* wait for POWERED DOWN and manage it in the URCs table */
        /* other URCs can be received before the modem has terminated its shut down */
      } else {
        log("Turn off error : " + r);
      }
    };
    // Normal power down
    at.cmd('AT+QPOWD=1\r\n', 2000, cb);
  },
  "getCCID": function() {
    return ccid;
  },
};

resetOptions = {
 rst: undefined,
 pwrkey: undefined,
 rst_active_level: 1,
 pwrkey_active_level: 1,
};

/*
This is the 'exported' (named function)
it can be used with :
require('UG96.js').connect(Serial, resetOptions, function(err) { log("connecting..."); });

This sets the pins to turn on, reset the module.
This loads the submodules required to work with.

This manages QIURC (Quectel Incoming Unsolicited Result Code)
- URC of Incoming Data
- URC of Connection Closed
- URC of PDP Deactivation

This Manage URC (Unsolicited Result Code) with no conditional triggers
(UGxx AT Commands Manual, Table 12: Summary of URC )

this reset the modem
*/
exports.connect = function(usart, resetOptions, connectedCallback) {
  resetOptions = resetOptions || {};
  rst = resetOptions.rst || undefined;
  pwrkey = resetOptions.pwrkey || undefined;
  rst_active_level = resetOptions.rst_active_level || 0;
  pwrkey_active_level = resetOptions.pwrkey_active_level || 0;

  gprsFuncs.at = at = require('AT').connect(usart);
  require("NetworkJS").create(netCallbacks);

  at.register("+QIURC: \"recv\"", receiveHandler);
  at.register("+QIURC: \"closed\"", closehandler);
  at.register("+QIURC: \"pdpdeact\"", pdpdeacthandler);

  at.register("+QIND:", QindHandler);
  at.register("+QUSIM:", QusimHandler);
  at.register("+CFUN:", CfunHandler);
  at.register("RDY", RdyHandler);
  at.register("POWERED DOWN", PoweredDownHandler);

  gprsFuncs.reset(connectedCallback);
  return gprsFuncs;
};
