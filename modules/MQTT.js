/* Copyright (c) 2014 Lars Toft Jacobsen (boxed.dk), Gordon Williams. See the file LICENSE for copying permission. */
/*
Simple MQTT protocol wrapper for Espruino sockets.
*/

/** 'private' costants */
var C = {
  PACKET_ID      : 1, // Bad...fixed packet id
  PROTOCOL_LEVEL : 4,  // MQTT protocol level
  DEF_PORT        : 1883, // MQTT default server port
  DEF_KEEP_ALIVE  : 60,   // Default keep_alive (s)
};

/** Control packet types */
var TYPE = {
  CONNECT     :  1,
  CONNACK     :  2,
  PUBLISH     :  3,
  PUBACK      :  4,
  PUBREC      :  5,
  PUBREL      :  6,
  PUBCOMP     :  7,
  SUBSCRIBE   :  8,
  SUBACK      :  9,
  UNSUBSCRIBE : 10,
  UNSUBACK    : 11,
  PINGREQ     : 12,
  PINGRESP    : 13,
  DISCONNECT  : 14
};

/**
 Return Codes
 http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc385349256
 **/
var RETURN_CODES = {
  ACCEPTED                      : 0,
  UNACCEPTABLE_PROTOCOL_VERSION : 1,
  IDENTIFIER_REJECTED           : 2,
  SERVER_UNAVAILABLE            : 3,
  BAD_USER_NAME_OR_PASSWORD     : 4,
  NOT_AUTHORIZED                : 5
};

/** MQTT constructor */
function MQTT(server, options) {
  this.server = server;
  var options = options || {};
  this.port = options.port || C.DEF_PORT;
  this.client_id = options.client_id || mqttUid();
  this.keep_alive = options.keep_alive || C.DEF_KEEP_ALIVE;
  this.clean_session = options.clean_session || true;
  this.username = options.username;
  this.password = options.password;
  this.client = false;
  this.connected = false;
  this.ping_interval =
    this.keep_alive < this.C.PING_INTERVAL ? (this.keep_alive - 5) : this.C.PING_INTERVAL;
  this.protocol_name = options.protocol_name || "MQTT";
  this.protocol_level = createEscapedHex( options.protocol_level || C.PROTOCOL_LEVEL );
}

/** 'public' constants here */
MQTT.prototype.C = {
  DEF_QOS         : 0,    // Default QOS level
  CONNECT_TIMEOUT : 5000, // Time (s) to wait for CONNACK
  PING_INTERVAL   : 40    // Server ping interval (s)
};

/* Utility functions ***************************/

var fromCharCode = String.fromCharCode;

/** MQTT string (length MSB, LSB + data) */
function mqttStr(s) {
  return fromCharCode(s.length>>8, s.length&255)+s;
};

/** MQTT packet length formatter - algorithm from reference docs */
function mqttPacketLength(length) {
    var encLength = '';
    do {
      var encByte = length & 127;
      length = length >> 7;
      // if there are more data to encode, set the top bit of this byte
      if ( length > 0 ) {
         encByte += 128;
      }
      encLength += fromCharCode(encByte);
    } while ( length > 0 )
    return encLength;
}

/** MQTT standard packet formatter */
function mqttPacket(cmd, variable, payload) {
  return fromCharCode(cmd) + mqttPacketLength(variable.length+payload.length) + variable + payload;
}

/** PUBLISH packet parser - returns object with topic and message */
function parsePublish(data) {
  if (data.length>=4 && typeof data!="undefined") {
    var cmd = data.charCodeAt(0);
    var rem_len = data.charCodeAt(1);
    var var_len = data.charCodeAt(2) << 8 | data.charCodeAt(3);
    return { topic: data.substr(4, var_len),
             message: data.substr(4+var_len, rem_len-var_len),
             dup: (cmd & 0b00001000) >> 3,
             qos: (cmd & 0b00000110) >> 1,
             retain: cmd & 0b00000001
           };
  }
  else {
    return undefined;
  }
}

/** Generate random UID */
var mqttUid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
    return s4() + s4() + s4();
  };
})();

/** PUBLISH control packet */
function mqttPublish(topic, message, qos) {
  var cmd = TYPE.PUBLISH << 4 | (qos << 1);
  var pid = fromCharCode(C.PACKET_ID<<8, C.PACKET_ID&255);
  // Packet id must be included for QOS > 0
  var variable = (qos === 0) ? mqttStr(topic) : mqttStr(topic)+pid;
  return mqttPacket(cmd, variable, message);
}

/** SUBSCRIBE control packet */
function mqttSubscribe(topic, qos) {
  var cmd = TYPE.SUBSCRIBE << 4 | 2;
  var pid = fromCharCode(C.PACKET_ID<<8, C.PACKET_ID&255);
  return mqttPacket(cmd,
           pid/*Packet id*/,
           mqttStr(topic)+
           fromCharCode(qos)/*QOS*/);
}

/** UNSUBSCRIBE control packet */
function mqttUnsubscribe(topic) {
  var cmd = TYPE.UNSUBSCRIBE << 4 | 2;
  var pid = fromCharCode(C.PACKET_ID<<8, C.PACKET_ID&255);
  return mqttPacket(cmd,
           pid/*Packet id*/,
           mqttStr(topic));
}

/** Create escaped hex value from number */
function createEscapedHex( number ){
  return fromCharCode(parseInt( number.toString(16) , 16));
}

/* Public interface ****************************/

/** Establish connection and set up keep_alive ping */
MQTT.prototype.connect = function(client) {
  var mqo = this;
  var onConnect = function() {
    console.log('Client connected');
    client.write(mqo.mqttConnect(mqo.client_id));

    // Disconnect if no CONNACK is received
    mqo.ctimo = setTimeout(function() {
      mqo.ctimo = undefined;
      mqo.disconnect();
    }, mqo.C.CONNECT_TIMEOUT);

    // Set up regular keep_alive ping
    mqo.pintr = setInterval(function() {
      // console.log("Pinging MQTT server");
      mqo.ping();
    }, mqo.ping_interval*1000);

    // Incoming data
    client.on('data', function(data) {
      var type = data.charCodeAt(0) >> 4;

      if(type === TYPE.PUBLISH) {
        var parsedData = parsePublish(data);
        if (parsedData!==undefined) {
          mqo.emit('publish', parsedData);
          mqo.emit('message', parsedData.topic, parsedData.message);
        }
      }
      else if(type === TYPE.PUBACK) {
        // implement puback
      }
      else if(type === TYPE.SUBACK) {
        // implement suback
      }
      else if(type === TYPE.UNSUBACK) {
        // implement unsuback
      }
      else if(type === TYPE.PINGREQ) {
        // silently reply to pings
        client.write(TYPE.PINGRESP+"\x00"); // reply to PINGREQ
      }
      else if(type === TYPE.PINGRESP) {
        mqo.emit('ping_reply');
      }
      else if(type === TYPE.CONNACK) {
        if (mqo.ctimo) clearTimeout(mqo.ctimo);
        mqo.ctimo = undefined;
        var returnCode = data.charCodeAt(3);
        if(returnCode === RETURN_CODES.ACCEPTED) {
          mqo.connected = true;
          console.log("MQTT connection accepted");
          mqo.emit('connected');
          mqo.emit('connect');
        }
        else {
          var mqttError = "Connection refused, ";
          switch(returnCode) {
              case RETURN_CODES.UNACCEPTABLE_PROTOCOL_VERSION:
                  mqttError += "unacceptable protocol version.";
                  break;
              case RETURN_CODES.IDENTIFIER_REJECTED:
                  mqttError += "identifier rejected.";
                  break;
              case RETURN_CODES.SERVER_UNAVAILABLE:
                  mqttError += "server unavailable.";
                  break;
              case RETURN_CODES.BAD_USER_NAME_OR_PASSWORD:
                  mqttError += "bad user name or password.";
                  break;
              case RETURN_CODES.NOT_AUTHORIZED:
                  mqttError += "not authorized.";
                  break;
              default:
                  mqttError += "unknown return code: " + returnCode + ".";
          }
          console.log(mqttError);
          mqo.emit('error', mqttError);
        }
      }
      else {
        console.log("MQTT unsupported packet type: "+type);
        console.log("[MQTT]"+data.split("").map(function(c) { return c.charCodeAt(0); }));
      }
    });

    client.on('end', function() {
      if (mqo.connected) {
        mqo.connected = false;
        console.log('MQTT client disconnected');
        if (mqo.pintr) clearInterval(mqo.pintr);
        mqo.pintr = undefined;
        mqo.emit('disconnected');
        mqo.emit('close');
      }
    });

    mqo.client = client;
  };
  if (client) { onConnect(); }
  else {
    client = require("net").connect({host : mqo.server, port: mqo.port}, onConnect);
    // TODO: Reconnect on timeout
  }
};

/** Disconnect from server */
MQTT.prototype.disconnect = function() {
  this.client.write(fromCharCode(TYPE.DISCONNECT<<4)+"\x00");
  this.client.end();
  this.client = false;
  this.connected = false;
};

/** Publish message using specified topic */
MQTT.prototype.publish = function(topic, message, qos) {
  var _qos = qos || this.C.DEF_QOS;
  this.client.write(mqttPublish(topic, message.toString(), _qos));
};

/** Subscribe to topic (filter) */
MQTT.prototype.subscribe = function(topics, opts, callback) {
  if (!opts) { opts = { qos: this.C.DEF_QOS }; }
  if ('number' === typeof opts) { opts = { qos: opts }; }

  var subs = [];
  if ('string' === typeof topics) {
    topics = [topics];
  }
  if (Array.isArray(topics)) {
    topics.forEach(function (topic) {
      subs.push({
        topic: topic,
        qos: opts.qos
      });
    });
  } else {
    Object
      .keys(topics)
      .forEach(function (k) {
        subs.push({
          topic: k,
          qos: topics[k]
        });
      });
  }

  subs.forEach(function(sub){
    // TODO: Multiple topics in single subscribe packet
    this.client.write(mqttSubscribe(sub.topic, sub.qos));
  }.bind(this));

  if ('function' === typeof callback) { callback(); }
};

/** Unsubscribe to topic (filter) */
MQTT.prototype.unsubscribe = function(topic) {
  this.client.write(mqttUnsubscribe(topic));
};

/** Send ping request to server */
MQTT.prototype.ping = function() {
  this.client.write(fromCharCode(TYPE.PINGREQ<<4)+"\x00");
};

/* Packet specific functions *******************/

/** Create connection flags

*/
MQTT.prototype.createFlagsForConnection = function( options ){
  var flags = 0;
  flags |= ( this.username )? 0x80 : 0;
  flags |= ( this.username && this.password )? 0x40 : 0;
  flags |= ( options.clean_session )? 0x02 : 0;
  return createEscapedHex( flags );
};

/** CONNECT control packet
    Clean Session and Userid/Password are currently only supported
    connect flag. Wills are not
    currently supported.
*/
MQTT.prototype.mqttConnect = function(clean) {
  var cmd = TYPE.CONNECT << 4;
  var flags = this.createFlagsForConnection({
    clean_session: clean
  });

  var keep_alive = fromCharCode(this.keep_alive>>8, this.keep_alive&255);

  /* payload */
  var payload = mqttStr(this.client_id);
  if( this.username ){
    payload += mqttStr( this.username );
    if( this.password ){
      payload += mqttStr( this.password );
    }
  }

  return mqttPacket(cmd,
           mqttStr( this.protocol_name )/*protocol name*/+
           this.protocol_level /*protocol level*/+
           flags+
           keep_alive,
           payload);
};

/* Exports *************************************/

/** This is 'exported' so it can be used with `require('MQTT.js').create(server, options)` */
exports.create = function (server, options) {
  return new MQTT(server, options);
};

exports.connect = function(options) {
  var mqtt = new MQTT(options.host, options);
  mqtt.connect();
  return mqtt;
};
