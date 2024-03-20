/* Copyright (c) 2024 Lars Toft Jacobsen (boxed.dk), Gordon Williams, Stephen Hart. See the file LICENSE for copying permission. */
/* Simple MQTT protocol wrapper for Espruino sockets. */

/** 'private' constants */
var C = {
  PROTOCOL_LEVEL: 4,  // MQTT protocol level
  DEF_PORT      : 1883, // MQTT default server port
  DEF_KEEP_ALIVE: 60   // Default keep_alive (s)
};

/** Control packet types */
var TYPE = {
  CONNECT    : 1,
  CONNACK    : 2,
  PUBLISH    : 3,
  PUBACK     : 4,
  PUBREC     : 5,
  PUBREL     : 6,
  PUBCOMP    : 7,
  SUBSCRIBE  : 8,
  SUBACK     : 9,
  UNSUBSCRIBE: 10,
  UNSUBACK   : 11,
  PINGREQ    : 12,
  PINGRESP   : 13,
  DISCONNECT : 14
};

var pakId = Math.floor(Math.random() * 65534);

/**
 Return Codes
 http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc385349256
 **/
var RETURN_CODES = {
  0: 'ACCEPTED',
  1: 'UNACCEPTABLE_PROTOCOL_VERSION',
  2: 'IDENTIFIER_REJECTED',
  3: 'SERVER_UNAVAILABLE',
  4: 'BAD_USER_NAME_OR_PASSWORD',
  5: 'NOT_AUTHORIZED'
};

/** MQTT constructor */
function MQTT(server, options) {
  this.server = server;
  options = options || {};
  this.port = options.port || C.DEF_PORT;
  this.client_id = options.client_id || mqttUid();
  this.keep_alive = options.keep_alive || C.DEF_KEEP_ALIVE;
  this.clean_session = options.clean_session || true;
  this.username = options.username;
  this.password = options.password;
  this.client = false;
  this.connected = false;
  /* if keep_alive is less than the ping interval we need to use
    a shorter ping interval, otherwise we'll just time out! */
  this.ping_interval =
    this.keep_alive < this.C.PING_INTERVAL ? (this.keep_alive - 5) : this.C.PING_INTERVAL;
  this.protocol_name = options.protocol_name || "MQTT";
  this.protocol_level = createEscapedHex(options.protocol_level || C.PROTOCOL_LEVEL);
}

/** 'public' constants here */
MQTT.prototype.C = {
  DEF_QOS        : 0,    // Default QOS level
  CONNECT_TIMEOUT: 10000, // Time (ms) to wait for CONNACK
  PING_INTERVAL  : 40    // Server ping interval (s)
};

/* Utility functions ***************************/

var fromCharCode = String.fromCharCode;

/** MQTT string (length MSB, LSB + data) */
function mqttStr(s) {
  return fromCharCode(s.length >> 8, s.length & 255) + s;
}


/** MQTT packet length formatter - algorithm from reference docs */
function mqttPacketLength(length) {
  var encLength = '';
  do {
    var encByte = length & 127;
    length = length >> 7;
    // if there are more data to encode, set the top bit of this byte
    if (length > 0) {
        encByte += 128;
    }
    encLength += fromCharCode(encByte);
  } while (length > 0);
  return encLength;
}

/** MQTT packet length decoder - algorithm from reference docs */
function mqttPacketLengthDec(length) {
  var bytes = 0;
  var decL = 0;
  var lb = 0;
  do {
    lb = length.charCodeAt(bytes);
    decL |= (lb & 127) << (bytes++*7);
  } while ((lb & 128) && (bytes < 4))
  return {"decLen": decL, "lenBy": bytes};
}

/** MQTT standard packet formatter */
function mqttPacket(cmd, variable, payload) {
  return fromCharCode(cmd) + mqttPacketLength(variable.length + payload.length) + variable + payload;
}

/** Generate random UID */
var mqttUid = (function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  return function () {
    return s4() + s4() + s4();
  };
})();

/** Generate PID */
function mqttPid() {
  pakId = pakId > 65534 ? 1 : ++pakId;
  return fromCharCode(pakId >> 8) + fromCharCode(pakId & 0xFF);
}

/** Get PID from message */
function getPid(data) {
  return data.substr(0,2);
}

/** PUBLISH control packet */
function mqttPublish(topic, message, qos, flags) {
  var cmd = TYPE.PUBLISH << 4 | (qos << 1) | flags;
  var variable = mqttStr(topic);
  // Packet id must be included for QOS > 0
  if (qos > 0) {
    variable += mqttPid();
    return mqttPacket(cmd, variable, message);
  } else {
    return mqttPacket(cmd, variable, message);
  }
}

/** SUBSCRIBE control packet */
function mqttSubscribe(topic, qos) {
  var cmd = TYPE.SUBSCRIBE << 4 | 2;
  return mqttPacket(cmd,
    mqttPid(),
    mqttStr(topic) +
    fromCharCode(qos));
}

/** UNSUBSCRIBE control packet */
function mqttUnsubscribe(topic) {
  var cmd = TYPE.UNSUBSCRIBE << 4 | 2;
  return mqttPacket(cmd,
    mqttPid(),
    mqttStr(topic));
}

/** Create escaped hex value from number */
function createEscapedHex(number) {
  return fromCharCode(parseInt(number.toString(16), 16));
}

// Handle a single packet of data
MQTT.prototype.packetHandler = function(data) {
  // if we had some data left over from last
  // time, add it on
  if (this.partData) {
    data = this.partData + data;
    this.partData = '';
  }
  // Figure out packet length...
  var dLen = mqttPacketLengthDec(data.substr(1, 5));
  var pLen = dLen.decLen + dLen.lenBy + 1;
  // less than one packet?
  if (data.length < pLen) {
    this.partData = data;
    return;
  }
  // Get the data for this packet
  var pData = data.substr(dLen.lenBy + 1, dLen.decLen);
  // more than one packet? re-emit it so we handle it later
  if (data.length > pLen)
    this.client.emit('data', data.substr(pLen));
  // Now handle this MQTT packet
  var cmd = data.charCodeAt(0);
  var type = cmd >> 4;
  if (type === TYPE.PUBLISH) {
    var qos = (cmd & 0x6) >> 1;
    var topic_len = pData.charCodeAt(0) << 8 | pData.charCodeAt(1);
    var msg_start = 2 + topic_len + (qos?2:0); // skip message ID if QoS!=0
    var parsedData = {
      topic  : pData.substr(2, topic_len),
      message: pData.substr(msg_start, pData.length - msg_start),
      dup    : (cmd & 0x8) >> 3,
      qos    : qos,
      pid    : qos?pData.substr(2+topic_len,2):0,
      retain : cmd & 0x1
    };
    if(parsedData.qos)
      this.client.write(fromCharCode(((parsedData.qos == 1)?TYPE.PUBACK:TYPE.PUBREC) << 4) + "\x02" + parsedData.pid);
    this.emit('publish', parsedData);
    this.emit('message', parsedData.topic, parsedData.message);
  } else if (type === TYPE.PUBACK) {
    this.emit('puback', data.charCodeAt(2) << 8 | data.charCodeAt(3));
  } else if (type === TYPE.PUBREC) {
    this.client.write(fromCharCode(TYPE.PUBREL << 4 | 2) + "\x02" + getPid(pData));
  } else if (type === TYPE.PUBREL) {
    this.client.write(fromCharCode(TYPE.PUBCOMP << 4) + "\x02" + getPid(pData));
  } else if (type === TYPE.PUBCOMP) {
    this.emit('pubcomp', data.charCodeAt(2) << 8 | data.charCodeAt(3));
  } else if (type === TYPE.SUBACK) {
    if(pData.length > 0) {
      if(pData[pData.length - 1] == 0x80) {
        //console.log("Subscription failed");
        this.emit('subscribed_fail');
      } else {
        //console.log("Subscription succesfull");
        this.emit('subscribed');
      }
    }
  } else if (type === TYPE.UNSUBACK) {
    //console.log("Unsubscription succesful.");
    this.emit('unsubscribed');
  } else if (type === TYPE.PINGREQ) {
    this.client.write(fromCharCode(TYPE.PINGRESP << 4) + "\x00");
  } else if (type === TYPE.PINGRESP) {
    this.emit('ping_reply');
  } else if (type === TYPE.CONNACK) {
    if (this.ctimo) clearTimeout(this.ctimo);
    this.ctimo = undefined;
    this.partData = '';
    // pData may not be long enough to include a reason (that's fine!), in which
    // case in new firmwares pData.charCodeAt(3)==NaN, so we do 0|
    var returnCode = 0|pData.charCodeAt(3);
    if (RETURN_CODES[returnCode] === 'ACCEPTED') {
      this.connected = true;
      // start pinging
      if (this.pintr) clearInterval(this.pintr);
      this.pintr = setInterval(this.ping.bind(this), this.ping_interval * 1000);
      // emit connected events
      this.emit('connected');
      this.emit('connect');
    } else {
      var mqttError = "Connection refused, ";
      this.connected = false;
      if (returnCode > 0 && returnCode < 6) {
        mqttError += RETURN_CODES[returnCode];
      } else {
        mqttError += "unknown return code: " + returnCode + ".";
      }
      this.emit('error', mqttError);
    }
  } else {
    this.emit('error', "MQTT unsupported packet type: " + type);
    //console.log("[MQTT]" + data.split("").map(function (c) { return c.charCodeAt(0); }));
  }
};

/* Public interface ****************************/

/** Establish connection and set up keep_alive ping */
MQTT.prototype.connect = function (client) {
  var mqo = this;
  var onConnect = function () {
    mqo.client = client;
    // write connection message
    client.write(mqo.mqttConnect(mqo.client_id));
    // handle connection timeout if too slow
    mqo.ctimo = setTimeout(function () {
      mqo.ctimo = undefined;
      mqo.emit('disconnected');
      mqo.disconnect();
    }, mqo.C.CONNECT_TIMEOUT);
    // Incoming data
    client.on('data', mqo.packetHandler.bind(mqo));
    // Socket closed
    client.on('end', function() {
      mqo._scktClosed();
    });
  };
  if (client) {
    onConnect();
  } else {
    try {
      client = require("net").connect({host: mqo.server, port: mqo.port}, onConnect);
    } catch (e) {
      this.client = false;
      this.emit('error', e.message);
      this.emit('disconnected');
    }
  }
};

/** Called internally when the connection closes  */
MQTT.prototype._scktClosed = function () {
  if (this.connected) {
    this.connected = false;
    this.client = false;
    if (this.pintr) clearInterval(this.pintr);
    if (this.ctimo) clearTimeout(this.ctimo);
    this.pintr = this.ctimo = undefined;
    this.emit('disconnected');
    this.emit('close');
  }
};

/** Disconnect from server */
MQTT.prototype.disconnect = function () {
  if (!this.client) return;
  try {
    this.client.write(fromCharCode(TYPE.DISCONNECT << 4) + "\x00");
  } catch(e) {
    return this._scktClosed();
  }
  this.client.end();
  this.client = false;
};

/** Publish message using specified topic.
  opts = {
    retain: bool // the server should retain this message and send it out again to new subscribers
    dup : bool   // indicate the message is a duplicate because original wasn't ACKed (QoS > 0 only)
  }
*/
MQTT.prototype.publish = function (topic, message, opts) {
  if (!this.client) return;
  opts = opts || {};
  try {
    this.client.write(mqttPublish(topic, message.toString(), opts.qos || this.C.DEF_QOS, (opts.retain?1:0) | (opts.dup?8:0)));
  } catch (e) {
    this._scktClosed();
  }
};

/** Subscribe to topic (filter) */
MQTT.prototype.subscribe = function (topics, opts) {
  if (!this.client) return;
  opts = opts || {};

  var subs = [];
  if ('string' === typeof topics) {
    topics = [topics];
  }
  if (Array.isArray(topics)) {
    topics.forEach(function (topic) {
      subs.push({
        topic: topic,
        qos  : opts.qos || this.C.DEF_QOS
      });
    }.bind(this));
} else {
    Object
      .keys(topics)
      .forEach(function (k) {
        subs.push({
            topic: k,
            qos  : topics[k]
        });
      });
  }

  subs.forEach(function (sub) {
      this.client.write(mqttSubscribe(sub.topic, sub.qos));
  }.bind(this));
};

/** Unsubscribe to topic (filter) */
MQTT.prototype.unsubscribe = function (topic) {
  if (!this.client) return;
  this.client.write(mqttUnsubscribe(topic));
};

/** Send ping request to server */
MQTT.prototype.ping = function () {
  if (!this.client) return;
  try {
    this.client.write(fromCharCode(TYPE.PINGREQ << 4) + "\x00");
  } catch (e) {
    this._scktClosed();
  }
};

/* Packet specific functions *******************/

/** Create connection flags */
MQTT.prototype.createFlagsForConnection = function (options) {
  var flags = 0;
  flags |= ( this.username ) ? 0x80 : 0;
  flags |= ( this.username && this.password ) ? 0x40 : 0;
  flags |= ( options.clean_session ) ? 0x02 : 0;
  return createEscapedHex(flags);
};

/** CONNECT control packet
 Clean Session and Userid/Password are currently only supported
 connect flag. Wills are not
 currently supported.
 */
MQTT.prototype.mqttConnect = function (clean) {
  var cmd = TYPE.CONNECT << 4;
  var flags = this.createFlagsForConnection({
    clean_session: clean
  });

  var keep_alive = fromCharCode(this.keep_alive >> 8, this.keep_alive & 255);

  /* payload */
  var payload = mqttStr(this.client_id);
  if (this.username) {
    payload += mqttStr(this.username);
    if (this.password) {
      payload += mqttStr(this.password);
    }
  }

  return mqttPacket(cmd,
    mqttStr(this.protocol_name)/*protocol name*/ +
    this.protocol_level /*protocol level*/ +
    flags +
    keep_alive,
    payload);
};

/* Exports *************************************/

/** This is 'exported' so it can be used with `require('MQTT.js').create(server, options)` */
exports.create = function (server, options) {
  return new MQTT(server, options);
};

exports.connect = function (options) {
  var mqtt = new MQTT(options.host, options);
  mqtt.connect();
  return mqtt;
};
