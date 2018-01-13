<!--- Copyright (c) 2017 Pavel Sokolov (pavel@sokolov.me). See the file LICENSE for copying permission. --->
OneWireTempManager
=====================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/OneWireTempManager. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: OneWire,1-Wire,DS18B20,Temperature

Module designed to server pull of DS18B20 1-Wire temperature sensors connected to Espruino pins.

### Base usage.

 ```
 var manager=require("OneWireTempManager").create([A0,new OneWire(A1)];
 manager.start();
 ```

By default manager will print temperature values to console. 
You can setup custom callback:

 ```
/**
 * @param {DS18B20} sensor
 * @param {float} temp
 */ 
 manager.callBack = function(sensor,temp) {
     console.log("Temp on " + sensor.sCode + ": " + temp);
 };
 ```
  
### Customizing DS18B20 instance.
  
You can customize any settings of the sensor (like resolution):
  
  ```
  /**
   * @param {DS18B20} sensor
   */
  manager.configureSensor = function(sensor){
      sensor.setRes(12);
  };  
  ```

### Constants.

All constants should be modified **before** calling manager.start(). 

| Constant                            | Description |
| ----------------------------------- | -------- |
| manager.C.SCAN_PERIOD    | 1-wire bus scan period. Default is 5 secons. |
| manager.C.POLL_PERIOD    | Temperature sensors poll period. Default is 1 second. |
