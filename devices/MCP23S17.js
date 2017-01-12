/* Copyright (c) 2015 Spence Konde, Pur3 Ltd. See the file LICENSE for copying permission. */
/* See MCP23xxx.md for more info */
exports.connect = function(spi,cs,rst,ad) {
    return new MCP23S17(spi,cs,rst,ad);
};
function MCP23S17(spi,cs,rst,ad) {
  if(rst) {
      rst.write(0);
  }
  this.spi = spi;
  this.ad=(ad?(ad<<1)+64:64);
  this.cs=cs;
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
MCP23S17.prototype.s=function(r,d){this.spi.write([this.ad,r,d&255,d>>8],this.cs);};
MCP23S17.prototype.r=function(r){return this.spi.send([this.ad+1,r,0,0],this.cs);};
MCP23S17.prototype.m=function(bv,mode) {
  if (["input","output","input_pullup"].indexOf(mode)<0) throw "Pin mode "+mode+" not available";
  this.s(0,mode=='output'?(this.n&=~bv):(this.n |=bv));
  this.s(12,mode=='input_pullup'?(this.pu|=bv):(this.pu&=~bv));
};

MCP23S17.prototype.write=function(pin,val) {
    var bv=1<<pin;
    this.olat&=~bv;
    this.s(18,this.olat|=(bv*val));
};
MCP23S17.prototype.writePort=function(val) {
    this.olat=val;
    this.s(18,this.olat);
};
MCP23S17.prototype.read=function(pin) {
	var ret=this.r(18);
    return ((ret[0]+(ret[1]<<8))&(1<<pin))>>pin;
};
MCP23S17.prototype.readPort=function() {
	var ret=this.r(18);
    return (ret[0]+(ret[1]<<8));
};
MCP23S17.prototype.mode=function(pin,mode) {this.m(1<<pin,mode);};
function PEP (b,p){
    this.b=b;
    this.p=p;
}
PEP.prototype.set=function(){this.p.s(18,this.p.olat|=this.b);};
PEP.prototype.reset=function(){this.p.s(18,this.p.olat&=~(this.b));};
PEP.prototype.write=function(v){this.p.s(18,(v?this.p.olat|=this.b:this.p.olat&=~(this.b)));};
PEP.prototype.read=function(){var bv = (this.b>255?this.b>>8:this.b);return (this.p.r(18)[(this.b>255?1:0)]&bv)?1:0;};
PEP.prototype.mode=function(n){this.p.m(this.b,n);};
