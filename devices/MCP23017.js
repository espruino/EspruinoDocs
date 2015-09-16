/* Copyright (c) 2015 Spence Konde, Pur3 Ltd. See the file LICENSE for copying permission. */
/* See MCP23xxx.md for more info */
exports.connect = function(i2c,rst,i2ca) {    
    return new MCP23017(i2c,rst,i2ca);
};
function MCP23017(i2c,rst, i2ca) {
  if (rst) {
    rst.write(0);
  }
  this.i2c = i2c;
  this.i2ca = (i2ca===undefined) ? 32:32+i2ca;
  if (rst) {
      this.rst=rst;
      this.rst.write(1);
  }
  this.n=65535; //IODIR register, 1 = input
  this.pu=0;
  this.olat=0;
  this.A0=new PEP(1,this);
  this.A1=new PEP(2,this);
  this.A2=new PEP(4,this);
  this.A3=new PEP(8,this);
  this.A4=new PEP(16,this);
  this.A5=new PEP(32,this);
  this.A6=new PEP(64,this);
  this.A7=new PEP(128,this);
  this.B0=new PEP(256,this);
  this.B1=new PEP(512,this);
  this.B2=new PEP(1024,this);
  this.B3=new PEP(2048,this);
  this.B4=new PEP(4096,this);
  this.B5=new PEP(8192,this);
  this.B6=new PEP(16384,this);
  this.B7=new PEP(32768,this);
}
MCP23017.prototype.s=function(r,d){this.i2c.writeTo(this.i2ca,r,[d&255,d>>8]);};
MCP23017.prototype.r=function(r){this.i2c.writeTo(this.i2ca,r);return this.i2c.readFrom(this.i2ca,2);};
MCP23017.prototype.m=function(bv,mode) {
  if (["input","output","input_pullup"].indexOf(mode)<0) throw "Pin mode "+mode+" not available";
  this.s(0,mode=='output'?(this.n&=~bv):(this.n |=bv));
  this.s(12,mode=='input_pullup'?(this.pu|=bv):(this.pu&=~bv));
};

MCP23017.prototype.write=function(pin,val) {
    var bv=1<<pin;
    this.olat&=~bv;
    this.s(18,this.olat|=(bv*val));
};
MCP23017.prototype.writePort=function(val) {
    this.olat=val;
    this.s(18,this.olat);
}; 
MCP23017.prototype.read=function(pin) {
	var ret=this.r(18);
    return ((ret[0]+(ret[1]<<8))&(1<<pin))>>pin;
}; 
MCP23017.prototype.readPort=function() {
	var ret=this.r(18);
    return (ret[0]+(ret[1]<<8));
}; 
MCP23017.prototype.mode=function(pin,mode) {this.m(1<<pin,mode);};
function PEP (b,p){
    this.b=b;
    this.p=p;
}
PEP.prototype.set=function(){this.p.s(18,this.p.olat|=this.b);};
PEP.prototype.reset=function(){this.p.s(18,this.p.olat&=~(this.b));};
PEP.prototype.write=function(v){this.p.s(18,(v?this.p.olat|=this.b:this.p.olat&=~(this.b)));};
PEP.prototype.read=function(){var bv = (this.b>255?this.b>>8:this.b);return (this.p.r(18)[(this.b>255?1:0)]&bv)?1:0;};
PEP.prototype.mode=function(n){this.p.m(this.b,n);};
