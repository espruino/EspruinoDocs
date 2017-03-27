<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
LIS302DL Accelerometer
====================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/LIS302DL. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: STM32F4DISCOVERY,Accelerometer,LIS302DL,SPI,Sensor

[Datasheet](/datasheets/LIS302DL.pdf)

This is the accelerometer that is on the STM32F4DISCOVERY board.

This code snippet reads a value from the accelerometer, and lights the 4 LEDs depending on the angle of the board.

```JavaScript
function onInit() {
  SPI1.send([0x20,0b01000111], E3);
}

var avrx=0.0, avry=0.0;
function getAcc() {
  var accx = SPI1.send([0xA9,0], E3)[1];
  var accy = SPI1.send([0xAB,0], E3)[1];
  if (accx>127) accx-=256;
  if (accy>127) accy-=256;
  avrx = 0.1*accx + 0.9*avrx;
  avry = 0.1*accy + 0.9*avry;
  digitalWrite(LED2, avrx > 64);
  digitalWrite(LED4, avrx < -64);
  digitalWrite(LED1, avry > 64);
  digitalWrite(LED3, avry < -64);
}
onInit();setInterval(getAcc, 10);
```
 
