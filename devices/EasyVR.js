/* Copyright (C) 2015 Spence Konde. See the file LICENSE for copying permission. */
  /*
This module interfaces with EasyVR voice recognition board/shield.
Set jumper to PC. 
Programming/training must be done using PC and the included software - support for that is not provided in this module. 

use EasyVR.setRecognize(list,timeout) to start listening for SD commands from the specified option group, with the specified timeout option. 

You must supply three callbacks: 

onCom is called with two arguments, the option group, and the command returned, when a command is recognized.  
onTimeout is called with one argument, the option group, when the command times out. 
onErr is called with one argument, the option group, when a speach recognition error occurs (usually that the command was close, but not close enough). 
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
	
	console.log("serial data watch: "+data);
	var rcv=data.charCodeAt(0);
	console.log("serial data: "+rcv);
	if (rcv>0x60) {
		console.log("status");
		var temp=this.sts_idx[data];
		//console.log("serial lookup: "+temp);
		if (temp[0]) {
			this.stsr=data;
			this.ser.print(' ');
		} else {
			eval(temp[1]);
		}
	} else {
		console.log("data");
		this.rcvv+=data;
		if (this.rcvv.length>=this.sts_idx[this.stsr][0]){
		    console.log("running callback "+this.sts_idx[this.stsr][1]);
			eval(this.sts_idx[this.stsr][1]);
			this.rcvv="";
			this.stsr='o';
		} else {
		    console.log("need more data");
			this.ser.print(' ');
		}
	}

};
EasyVR.prototype.sts_idx={
	"o":[0,"console.log('STS_SUCCESS');"],
	"t":[0,"console.log('STS_TIMEOUT');"],
	"v":[0,"console.log('STS_INVALID');"],
	"i":[0,"console.log('STS_INTERR');"],
	"e":[2,"console.log('STS_ERROR '+evr.rcvv);evr.onErr(evr.rcvv);"],
	"s":[1,"console.log('STS_SIMILAR '+evr.rcvv);evr.onErr(evr.rcvv);"],
	"r":[1,"console.log('STS_RESULT');"]
};


EasyVR.prototype.onResult=function(r) {
	console.log("onresult");
	console.log(r);
	var rt = this.onCommand(this.vrstate,r);
	if (rt.type!==undefined) {
		this.stop();
		this.setRecognize(rt.type,rt.timeout);
	}
};

EasyVR.prototype.setRecognize=function(type,to) {
	if (this.tout) {
		clearTimeout(this.tout);
		this.tout=0;
	}
	this.sts_idx.o[1]="evr.startRec("+type+","+to+");";
	this.timeout(to);
	if (to) {this.tout=setTimeout("eval(evr.sts_idx.t[1])",to*1000+1000);}
};
EasyVR.prototype.startRec=function(type,timeout){
	this.sts_idx.o[1]="";
	this.sts_idx.r[1]="evr.onResult(evr.chararg(evr.rcvv));";
	this.sts_idx.t[1]="evr.sts_idx.r[1]='';evr.sts_idx.t[1]='';evr.onTimeout(evr.vrstate);";
	this.sendCmd('d',type);
	this.vrstate=type;
};


EasyVR.prototype.sendCmd=function(cmd,arg) {
	//lastCmd=[cmd,arg];
	this.ser.print(cmd);
	console.log("Sending command: "+cmd);
	if (arg!==undefined){console.log("With arg: "+this.argchar(arg));this.ser.print(this.argchar(arg));}
};

EasyVR.prototype.stop=function(){
	this.sts_idx={
	"o":[0,"console.log('STS_SUCCESS');"],
	"t":[0,"console.log('STS_TIMEOUT');"],
	"v":[0,"console.log('STS_INVALID');"],
	"i":[0,"console.log('STS_INTERR');"],
	"e":[2,"console.log('STS_ERROR '+evr.rcvv);evr.onErr(evr.rcvv);"],
	"s":[1,"console.log('STS_SIMILAR '+evr.rcvv);evr.onErr(evr.rcvv);"],
	"r":[1,"console.log('STS_RESULT');"]
	};
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
