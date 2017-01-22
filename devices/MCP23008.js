/* Copyright (c) 2015 Spence Konde, Pur3 Ltd. See the file LICENSE for copying permission. */
/* See MCP23xxx.md for more info */
exports.connect = function(i2c,rst,i2ca) {    
    return new MCP23008(i2c,rst,i2ca);
};
function MCP23008(i2c,rst, i2ca) {
  if (rst) {
    rst.write(0);
  }
  this.i2c = i2c;
  this.i2ca = (i2ca===undefined) ? 32:32+i2ca;
  if (rst) {
      this.rst=rst;
      this.rst.write(1);
  }
  this.n=255;
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
}
MCP23008.prototype.s=function(r,d){this.i2c.writeTo(this.i2ca,r,d);};
MCP23008.prototype.r=function(r){this.i2c.writeTo(this.i2ca,r);return this.i2c.readFrom(this.i2ca,1);};
MCP23008.prototype.m=function(bv,mode) {
  if (["input","output","input_pullup"].indexOf(mode)<0) throw "Pin mode "+mode+" not available";
  this.s(0,mode=='output'?(this.n&=~bv):(this.n |=bv));
  this.s(6,mode=='input_pullup'?(this.pu|=bv):(this.pu&=~bv));
};

MCP23008.prototype.write=function(pin,val) {
    var bv=1<<pin;
    this.olat&=~bv;
    this.s(9,this.olat|=(bv*val));
};
MCP23008.prototype.writePort=function(val) {
    this.olat=val;
    this.s(9,this.olat);
}; 
MCP23008.prototype.read=function(pin) {
    return (this.r(9)[0]&(1<<pin))>>pin;
}; 
MCP23008.prototype.readPort=function() {
    return (this.r(9)[0]);
}; 
MCP23008.prototype.mode=function(pin,mode) {this.m(1<<pin,mode);};
function PEP (b,p){
    this.b=b;
    this.p=p;
}
PEP.prototype.set=function(){this.p.s(9,this.p.olat|=this.b);};
PEP.prototype.reset=function(){this.p.s(9,this.p.olat&=~(this.b));};
PEP.prototype.write=function(v){this.p.s(9,(v?this.p.olat|=this.b:this.p.olat&=~(this.b)));};
PEP.prototype.read=function(){return (this.p.r(9)[0]&this.b)?1:0;};
PEP.prototype.mode=function(m){this.p.m(this.b,m);};
