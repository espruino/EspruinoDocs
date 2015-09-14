/* Copyright (c) 2014 Lars Toft Jacobsen (boxed.dk). See the file LICENSE for copying permission. */
/*
Simple MQTT protocol wrapper for Espruino sockets.
*/

/** 'private' costants */
var C = {
  PACKET_ID      : 1, // Bad...fixed packet id
  PROTOCOL_LEVEL : 4  // MQTT protocol level
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

/** MQTT constructor */ 
function MQTT(server, options) {
  this.server = server;
  var options = options || {};
  this.port = options.port || this.C.DEF_PORT;
  this.client_id = options.client_id || this.mqttUid();
  this.keep_alive = options.keep_alive || this.C.DEF_KEEP_ALIVE;
  this.clean_session = options.clean_session || true;
  this.username = options.username;
  this.password = options.password;
  this.client = false;
  this.connected = false;
  this.ping_interval = 
    this.keep_alive < this.C.PING_INTERVAL ? (this.keep_alive - 5) : this.C.PING_INTERVAL;
  this.protocol_name = options.protocol_name || "MQTT";
  this.protocol_level = this.createEscapedHex( options.protocol_level || C.PROTOCOL_LEVEL );
}

/** 'public' constants here */
MQTT.prototype.C = {
  DEF_QOS         : 0,    // Default QOS level
  DEF_PORT        : 1883, // MQTT default server port
  DEF_KEEP_ALIVE  : 60,   // Default keep_alive (s)
  CONNECT_TIMEOUT : 5000, // Time (s) to wait for CONNACK 
  PING_INTERVAL   : 40    // Server ping interval (s)
};

/* Utility functions ***************************/

/** MQTT string (length MSB, LSB + data) */
MQTT.prototype.mqttStr = function(s) {
  return String.fromCharCode(s.length>>8, s.length&255)+s;
};

/** MQTT standard packet formatter */
MQTT.prototype.mqttPacket = function(cmd, variable, payload) {
  return String.fromCharCode(cmd, variable.length+payload.length)+variable+payload;
};

/** PUBLISH packet parser - returns object with topic and message */
MQTT.prototype.parsePublish = function(data) {
  if (data.length > 5 && typeof data !== undefined) {
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
};

/** Generate random UID */
MQTT.prototype.mqttUid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
    return s4() + s4() + s4();
  };
})();

/** Create escaped hex value from number */
MQTT.prototype.createEscapedHex = function( number ){
  return String.fromCharCode(parseInt( number.toString(16) , 16));
};

/* Public interface ****************************/

/** Establish connection and set up keep_alive ping */
MQTT.prototype.connect = function(client) {
  var mqo = this;
  var onConnect = function() {
    console.log('Client connected');
    client.write(mqo.mqttConnect(mqo.client_id));

    // Disconnect if no CONNACK is received
    mqo.ctimo = setTimeout(function() {
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
        mqo.emit('publish', mqo.parsePublish(data));
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
        clearTimeout(mqo.ctimo);
        if(data.charCodeAt(3) === 0) {
          mqo.connected = true;
          console.log("MQTT connection accepted");
          mqo.emit('connected');
        }
        else {
          console.log("MQTT connection error");
        }
      }
      else {
        console.log("MQTT unsupported packet type: "+type);
        console.log("[MQTT]"+data.split("").map(function(c) { return c.charCodeAt(0); }));
      }
    });

    client.on('end', function() {
      console.log('MQTT client disconnected');
      clearInterval(mqo.pintr);
      mqo.emit('disconnected');
    });
    
    mqo.client = client;
  };
  if (client) onConnect();
  else client = require("net").connect({host : mqo.server, port: mqo.port}, onConnect);
};

/** Disconnect from server */
MQTT.prototype.disconnect = function(topic, message) {
  this.client.write(String.fromCharCode(TYPE.DISCONNECT<<4)+"\x00");
  this.client.end();
  this.client = false;
  this.connected = false;
};

/** Publish message using specified topic */
MQTT.prototype.publish = function(topic, message, qos) {
  var _qos = qos || this.C.DEF_QOS;
  this.client.write(this.mqttPublish(topic, message, _qos));
};

/** Subscribe to topic (filter) */
MQTT.prototype.subscribe = function(topic, qos) {
  var _qos = qos || this.C.DEF_QOS;
  this.client.write(this.mqttSubscribe(topic, _qos));
};

/** Unsubscribe to topic (filter) */
MQTT.prototype.unsubscribe = function(topic) {
  this.client.write(this.mqttUnsubscribe(topic));
};

/** Send ping request to server */
MQTT.prototype.ping = function() {
  this.client.write(String.fromCharCode(TYPE.PINGREQ<<4)+"\x00");
};

/* Packet specific functions *******************/

/** Create connection flags 

*/
MQTT.prototype.createFlagsForConnection = function( options ){
  var flags = 0;
  flags |= ( this.username )? 0x80 : 0; 
  flags |= ( this.username && this.password )? 0x40 : 0; 
  flags |= ( options.clean_session )? 0x02 : 0;
  return this.createEscapedHex( flags );
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

  var keep_alive = String.fromCharCode(this.keep_alive>>8, this.keep_alive&255);

  /* payload */
  var payload = this.mqttStr(this.client_id); 
  if( this.username ){
    payload += this.mqttStr( this.username );
    if( this.password ){
      payload += this.mqttStr( this.password );
    }
  }

  return this.mqttPacket(cmd, 
           this.mqttStr( this.protocol_name )/*protocol name*/+
           this.protocol_level /*protocol level*/+
           flags+
           keep_alive,
           payload);
};

/** PUBLISH control packet */
MQTT.prototype.mqttPublish = function(topic, message, qos) {
  var cmd = TYPE.PUBLISH << 4 | (qos << 1);
  var pid = String.fromCharCode(C.PACKET_ID<<8, C.PACKET_ID&255);
  // Packet id must be included for QOS > 0
  var variable = (qos === 0) ? this.mqttStr(topic) : this.mqttStr(topic)+pid;
  return this.mqttPacket(cmd, variable, message);
};

/** SUBSCRIBE control packet */
MQTT.prototype.mqttSubscribe = function(topic, qos) {
  var cmd = TYPE.SUBSCRIBE << 4 | 2;
  var pid = String.fromCharCode(C.PACKET_ID<<8, C.PACKET_ID&255);
  return this.mqttPacket(cmd,
           pid/*Packet id*/,
           this.mqttStr(topic)+
           String.fromCharCode(qos)/*QOS*/);
};

/** UNSUBSCRIBE control packet */
MQTT.prototype.mqttUnsubscribe = function(topic) {
  var cmd = TYPE.UNSUBSCRIBE << 4 | 2;
  var pid = String.fromCharCode(C.PACKET_ID<<8, C.PACKET_ID&255);
  return this.mqttPacket(cmd,
           pid/*Packet id*/,
           this.mqttStr(topic));
};

/* Exports *************************************/

/** This is 'exported' so it can be used with `require('MQTT.js').create(server, options)` */
exports.create = function (server, options) {
  return new MQTT(server, options);
};
