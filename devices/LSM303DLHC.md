<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
LSM303DLHC Accelerometer
======================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/LSM303DLHC. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: STM32F3DISCOVERY,Accelerometer,LSM303DLHC,I2C,Sensor

[Datasheet](/datasheets/LSM303DLHCL.pdf)

This is the accelerometer that is on the STM32F3DISCOVERY board.

Here is some simple code for the accelerometer in the LSM303DLHC chip on the STM32F3DISCOVERY board :

 
```JavaScript
I2C.prototype.writeAccReg = function(reg,val) {
  this.writeTo(0x32>>1, [reg,val]);
}

I2C.prototype.readAccReg = function(reg,count) {
  // ORing 0x80 auto-increments the register for each read  
  this.writeTo(0x32>>1, reg | 0x80);
  return this.readFrom(0x32>>1, count);
}
I2C.prototype.readAcc = function(reg,count) {
  var d = this.readAccReg(0x28, 6);
  // reconstruct 16 bit data
  var a = [d[0] | (d[1]<<8), d[2] | (d[3]<<8), d[4] | (d[5]<<8)];
  // deal with sign bit
  if (a[0]>32767) a[0]-=65536; 
  if (a[1]>32767) a[1]-=65536;
  if (a[2]>32767) a[2]-=65536;
  return a;
}
``` 

Note:
----

There is also a Magnetometer in the same package which can be accessed with I2C
I2C has 7 bit addresses (and Espruino right-aligns these). Some datasheets and devices choose to left-align the address - hence the use of '0x32>>1' rather than just '0x32'
On the LSM303DLHC accelerometer, ORing 0x80 with the register number (setting the top bit) will ensure that subsequent reads to the same address increment the register pointer.
You can then use the accelerometer just by typing:

 
```JavaScript
I2C1.setup({scl:B6, sda:B7}); // Setup I2C
I2C1.writeAccReg(0x20, 0x27); // turn Accelerometer on
I2C1.readAcc() // Return acceleration data
``` 

The final command will print something like:

 
```JavaScript
=[896,2816,16512]
```
 
Which is the acceleration in G * 16384 in each of the X, Y and Z axes.


Buying
-----

The LSM303DLHCL can be purchased from many places including:

* [digitalmeans.co.uk LSM303](https://digitalmeans.co.uk/shop/index.php?route=product/search&tag=lsm303)
