<!--- Copyright (c) 2014 Sacha Gloor. See the file LICENSE for copying permission. -->
xBee radio module
===============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/XBee-API1. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,xBee,Wireless,API Firmeware,API Mode 1

Summary
-------

```
Serial1.setup(38400,{rx:B7,tx:B6,bytesize:8,parity:none,stopbits:1});
myxbee=require('XBee-API1').connect(Serial1);
```

functions:

*  `XBee-API1.AT(command,value,function(re,data) {} )`
*  `XBee-API1.TX(addr64,addr16,options,data,function(re,data) {} )`
*  `XBee-API1.RX(function(data) {} )`


xBee Frame Types implemented
----------------------------

* `08` => AT Command
* `88` => AT Command respond
* `10` => Transmit request
* `8B` => Transmit Status
* `90` => RX Packet

Creating an xbee object
-----------------------

Initialize a serial object and pass it to the xbee object

```
Serial1.setup(38400,{rx:B7,tx:B6,bytesize:8,parity:none,stopbits:1});
myxbee=require('XBee-API1').connect(Serial1);
```


function XBee-API1.AT
---------------------

###Call type:
`function XBee-API1.AT(command,value,function(re,data) {} )`
    
### Description:
    
Submits an AT Command. 
    
### Parameters:

`command` is the AT command without the "AT" prefix

`value` array of bytes. When empty the function reads the current value, otherwise it will be written

`function` the callback function. Called on timeout, or on success.
on sucess, the value of 're' will be true and data contains an array with the returned data.

Example of the data array:

```
{
"cmd":"VR",
"status":0,
"data":[35,167]
}
```
        
### Return: 

No return value (undefined)
    
### Examples:
  
Read out an AT parameter:

```
myxbee.AT('VR',[],function(re,data) {
    console.log(re);
    if (re===true) {
        console.log(data);
    }
});
```

Sets the NI to "MyBee":

```
value=new Uint8Array(5);
value.set('MyBee');
myxbee.AT('NI',value,function(re,data) {
    console.log(re);
    if (re===true) {
        console.log(data);
    }
});
```

function XBee-API1.TX
---------------------

### Call type:
`function XBee-API1.TX(addr64,addr16,options,data,function(re,data) {} )`
    
### Description:
    
Sends data to another xBee radio. 
    
### Parameters:

`addr64` 64 Bit address
`addr16` 16 Bit address

`options` See xBee API documentation, default 0x00

`data` Data to send

`function` the callback function. Called on timeout, or on success.
on sucess, the value of 're' will be true and data contains an array with the returned data.

Example of the data array:

```
{
"destination":[0,0],
"retrycount":0,"delivery_status":0,"discovery_status":0
}
```
        
### Return: 

No return value (undefined)
    
### Example:
```
    addr64=new Uint8Array(8);
    addr64.set([0x00,0x13,0xA2,0x00,0x40,0xA1,0xF1,0xE0]); // Destination 64 Bit address
    addr16=new Uint8Array(2);// Destination 16 bit address
    addr16.set([0x48,0xA0]);
    txdata=new Uint8Array(5);
    txdata.set('abcde');

    myxbee.TX(addr64,addr16,0,txdata,function(re,data) {
    console.log(re);
    if (re===true) {
        console.log(data);
      }
    });
```

function XBee-API1.RX
---------------------

### Call type:
`function XBee-API1.RX(function(data) {} )`
    
### Description:
    
Register a callback function to receive data from other radios. 
    
### Parameters:
    
`function` the callback function. Called when data is received.

Example of the data array:
```
{
"addr64":new Uint8Array([0,19,162,0,64,161,241,224]),  // 64 Bit address of the sender radio
"addr16":new Uint8Array([72,160]),                     // 16 Bit address of the sender radio
"option":1,                                           // Options, see xBee API documentation
"data":new Uint8Array([70,114,105,101,110,100,115])   // The data itself
}
```
        
### Return: 

No return value (undefined)
    
### Example:

```
    myxbee.RX(function(data) {
        console.log(data);
    });
```
