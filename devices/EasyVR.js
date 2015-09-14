/* Copyright (C) 2015 Spence Konde. See the file LICENSE for copying permission. */
  /*
This module interfaces with EasyVR voice recognition


onCom is called with two arguments, the option group, and the command returned. 

onTimeout is called with one argument, the option group. 

*/


exports.connect = function(serial,onCm,onTo,onEr) {
    return new EasyVR(serial,onCm,onTo,onEr);
};

function EasyVR(ser,onCm,onTo,onEr) {
  this.ser = ser;
  this.onCommand=onCm;
  this.onTimeout=onTo;
  this.onErr=onEr;
  this.ser.on('data',this.onData.bind(this));
  this.stop();
  this.vrstate=-1;
  this.stsr='o';
  this.rcvv="";
  this.tout=0;
  this.lstC='';
}

EasyVR.prototype.argchar=function(val) {
	if (val<-1 || val > 31) {throw "Bad arg";}
	return String.fromCharCode(0x41+val);
};

EasyVR.prototype.chararg=function(chr) {
	return chr.charCodeAt(0)-0x41;

}; 

EasyVR.prototype.onData=function(data) {
	//this=evr;
	
	//console.log("serial data watch: "+data);
	var rcv=data.charCodeAt(0);
	//console.log("serial data: "+rcv);
	if (rcv>0x60) {
		//console.log("status");
		//console.log("serial lookup: "+temp);
		if (this.sts_idx[data]["len"]) {
			this.stsr=data;
			this.ser.print(' ');
			//console.log("need to get data")
		} else {
		//	console.log("no data to get")
			this.sts_idx[data]["cb"].bind(this)();
		}
	} else {
		//console.log("data");
		this.rcvv+=data;
		if (this.rcvv.length>=this.sts_idx[this.stsr]["len"]){
		    //console.log("running callback "+this.sts_idx[this.stsr]["cb"]);
			this.sts_idx[this.stsr]["cb"].bind(this)();
			this.rcvv="";
			this.stsr='o';
		} else {
		    //console.log("need more data");
			this.ser.print(' ');
		}
	}

};
EasyVR.prototype.sts_idx={
	"o":{len:0,cb:function(){
		//console.log('STS_SUCCESS');
		//console.log(this.lstC);
		if (this.lstC=='o')  { 
			//console.log(this.vrstate);
			if (this.vrstate!=-1) {
				//console.log("kicking off recognize");
				this.sendCmd('d',this.vrstate);
			}
		}
	}},
	"t":{len:0,cb:function() {
		//console.log('STS_TIMEOUT');
		if (this.vrstate!=-1){
			//console.log("calling onTimeout callback");
			this.onTimeout(this.vrstate);
			this.vrstate=-1;
		}
	}},
	"v":{len:0,cb:function() {
		//console.log('STS_INVALID '+this.rcvv);
		if (this.vrstate!=-1){
			this.vrstate=-1;
		}
	}},
	"i":{len:0,cb:function() {
		//console.log('STS_INTERR '+this.rcvv);
		if (this.vrstate!=-1){
			this.vrstate=-1;
		}
	}},
	"e":{len:2,cb:function() {
		//console.log('STS_ERROR '+this.rcvv);
		if (this.vrstate!=-1){
			//console.log("calling onErr callback");
			var tem=this.vrstate;
			this.vrstate=-1;
			this.onErr(tem);
		}
	}},
	"s":{len:1,cb:function() {
		//console.log('STS_SIMILAR '+this.rcvv);
		if (this.vrstate!=-1){
			//console.log("calling onErr callback");
			var tem=this.vrstate;
			this.vrstate=-1;
			this.onErr(tem);
		}
	}},
	"r":{len:1,cb:function() {
		//console.log('STS_RESULT '+this.rcvv);
		if (this.vrstate!=-1){
			//console.log("calling onCommand");
			//console.log(r);
			var rt = this.onCommand(this.vrstate,this.chararg(this.rcvv));
			this.vrstate=-1;
			if (rt.type!==undefined) {
				this.setRecognize(rt.type,rt.timeout);
			}
		}
	}}
};


EasyVR.prototype.setRecognize=function(type,to) {
	if (this.tout) {
		clearTimeout(this.tout);
		this.tout=0;
	}
	this.vrstate=type;
	this.timeout(to);
};

EasyVR.prototype.sendCmd=function(cmd,arg) {
	//lastCmd=[cmd,arg];
	this.ser.print(cmd);
	//console.log("Sending command: "+cmd);
	this.lstC=cmd;
	//if (arg!==undefined){console.log("With arg: "+this.argchar(arg));this.ser.print(this.argchar(arg));}
	if (arg!==undefined){this.ser.print(this.argchar(arg));}
};

EasyVR.prototype.stop=function(){
	this.sendCmd('b');
};
EasyVR.prototype.timeout=function(arg) {
	this.sendCmd('o',arg);
};

EasyVR.prototype.setStrict=function(arg) {
	this.sendCmd('v',E.clip(arg,1,5));
};


/*
Commands:

b: Break (interrupt current operation)

s: Sleep (0-8 argument)

k: knob (set SI from 0 to 4)

v: SD level (strictness) from 1 to 5

i: set language (0-5)

o: set timeout (-1 to 31)

*/
