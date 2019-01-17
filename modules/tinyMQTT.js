/* Copyright (c) 2015 Ollie Phillips. See the file LICENSE for copying permission. */
/* Stripped out MQTT module that does basic PUBSUB.
   Originally from https://github.com/olliephillips/tinyMQTT */

var _q;
function TMQ(server, optns){
	var opts = optns || {};
	this.svr = server;
	this.prt = opts.port || 1883;
	this.ka = opts.keep_alive || 60;
	this.usr = opts.username;
	this.pwd = opts.password;
	this.cn = false;
	this.ri = opts.reconnect_interval || 2000;
	_q = this;
};

var sFCC = String.fromCharCode;

function onDat(data) {
	var cmd = data.charCodeAt(0);
	if((cmd >> 4) === 3) {
		var var_len = data.charCodeAt(2) << 8 | data.charCodeAt(3);
		var msg = {
			topic: data.substr(4, var_len),
			message: data.substr(4+var_len, (data.charCodeAt(1))-var_len)
		};
		_q.emit('message', msg);
	}
};

function mqStr(str) {
	return sFCC(str.length >> 8, str.length&255) + str;
};

function mqPkt(cmd, variable, payload) {
	return sFCC(cmd, variable.length + payload.length) + variable + payload;
};

function mqCon(id){
	// Authentication?
	var flags = 0;
	var payload = mqStr(id);
	if(_q.usr && _q.pwd) {
		flags |= ( _q.usr )? 0x80 : 0;
		flags |= ( _q.usr && _q.pwd )? 0x40 : 0;
		payload += mqStr(_q.usr) + mqStr(_q.pwd);
	}
	flags = sFCC(parseInt(flags.toString(16), 16));
	return mqPkt(0b00010000,
		mqStr("MQTT")/*protocol name*/+
		"\x04"/*protocol level*/+
		flags/*flags*/+
		"\xFF\xFF"/*Keepalive*/, payload);
};

TMQ.prototype.connect = function(){
	var onConnected = function() {
		clearInterval(con);
		_q.cl.write(mqCon(getSerial()));
		_q.emit("connected");
		_q.cn = true;
		setInterval(function(){
			if(_q.cn)
				_q.cl.write(sFCC(12<<4)+"\x00");
		}, _q.ka<<10);
		_q.cl.on('data', onDat.bind(_q));
		_q.cl.on('end', function() {
			if(_q.cn)
				_q.emit("disconnected");
			_q.cn = false;
			delete _q.cl;
		});
		_q.removeAllListeners("connected");
	};
	if(!_q.cn) {
		var con = setInterval(function(){
			if(_q.cl) {
				_q.cl.end();
				delete _q.cl;
			}
			_q.cl = require("net").connect({host : _q.svr, port: _q.prt}, onConnected);
		}, _q.ri);
	}
};

TMQ.prototype.subscribe = function(topic) {
	_q.cl.write(mqPkt((8 << 4 | 2), sFCC(1<<8, 1&255), mqStr(topic)+sFCC(1)));
};

TMQ.prototype.publish = function(topic, data) {
	if(_q.cn) {
		_q.cl.write(mqPkt(0b00110001, mqStr(topic), data));
		_q.emit("published");
	}
};

TMQ.prototype.disconnect = function() {
	_q.cl.write(sFCC(14<<4)+"\x00");
};

// Exports
exports.create = function (svr, opts) {
	return new TMQ(svr, opts);
};
