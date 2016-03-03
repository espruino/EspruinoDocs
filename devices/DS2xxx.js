  /* Copyright (C) 2015 Spence Konde. See the file LICENSE for copying permission. */
  /*
This module interfaces with OneWire EEPROMs like the DS24B33.  

Usage: 

Setup onewire, then call:

var eeprom=require("DS2xxx").connect(onewire, pagesize, capacity, nopartial, device)

onewire is the OneWire bus object. 

pagesize is the page size for page writes, in bytes. 

capacity is the eeprom capacity, in kbits. 

nopartial is true for devices that cannot start a write except on a page boundary, otherwise undefined or false. 

device is the code identifying the device, or it's number in the search. Optional - if undefined, the first device will be assumed. 

eeprom.read(address,bytes,asStr)
Read the specified number of bytes. If asStr is true, it will return the value as a string. 

eeprom.write(address,data)
Write the specified data starting at the specified address. Writes that cross page boundaries are handled transparently.  

*/
exports.connect = function(ow, pgsz, cap,n,device) {
    return new DS2xxx(ow, pgsz, cap,n,device);
};
function DS2xxx(ow, pgsz, cap,n, device) {
    this.ow = ow;
    this.np=n;
    this.code=(device===undefined)?ow.search()[0]:(typeof device=="string"?device:ow.search[device]);
    this.pgsz=pgsz
    this.cap=cap<<7;
}
DS2xxx.prototype.s=function(cmd) {
    this.ow.select(this.code)
    this.ow.write(cmd,cmd.length==4); //We only want to leave power on when we do a page copy - that's the only time we send a 4 element array. 
}
DS2xxx.prototype.write= function (addr, data) {
    var m=addr%this.pgsz
    if(addr+data.length > this.cap) throw "Write exceeds size"; //CRITICAL to test for this, as writing to the addresses right after the normal address space can set the EEPROM read-only (forever)!
    if(typeof data=="object"){data=E.toString(data);}
    if(this.np&&(m)){ //if it's a device that doesn't support writes not starting at page boundary, and that's what we're doing 
        data=this.read((addr-m),m,1)+data; //read the data on the page before the target address;
        addr-=m; m=0; //and set the address to the start of the page; 
    }
    var idx=0;
    while (idx < data.length) {
        var l = data.length;
        if (l>(this.pgsz-(m))) {l=this.pgsz-(m); }// Writes must align on page boundaries, so if we don't start at one, account for that. 
        this.s([0x0F,addr&0xFF,addr>>8]); //write to spad with address
        this.ow.write(data.substr(idx,l));//write out the data
        this.s([0xAA]); //read spad.
        //room for improvement: Manufacturer recommends reading back the scratch pad completely, and verifying it aginast the data, before comitting it. 
        this.s(E.toUint8Array(0x55,this.ow.read(3))); 
        var et=getTime()+0.07; while (getTime() < et) {"";} //delay(7) - it says it needs 5, but let's not rush it.
        if (this.ow.read()==170) { //check for the indication of successful write - if not, we'll try again per datasheet. 
            // get ready for next iteration, if there is one
            idx+=l;
            addr+=l;m=0; //if write doesn't end on page boundary, the write is finished and m no longer matters, otherwise, it's aligned on page boundary and m=0;
        }
    }
    return data.length;
}
DS2xxx.prototype.read = function (addr, cnt) {
    this.s([0xF0,addr&0xFF,addr>>8]);//selec­t address
    var res = this.ow.read(cnt);
    return res;
}
