<!--- Copyright (c) 2015 Dennis Bemmann. See the file LICENSE for copying permission. -->
NeuroSky ThinkGear ASIC module
===========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Brain. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,NeuroSky,ThinkGear,TGAM,Brain,Mind Control,EEG

This module interfaces the NeuroSky ThinkGear ASIC module (TGAM) for use with Espruino.

The module returns the following information:

- signal quality
- attention value
- meditation value
- EEG power band values for the following brain waves as 24 bit unsigned integers:
  - delta
  - theta
  - low-alpha
  - high-alpha
  - low-beta
  - high-beta
  - low-gamma
  - mid-gamma
  
Currently only "normal output mode" of the TGAM is supported. When interfacing a TGAM
in "raw output mode", Brain.js should still correctly parse all received packets and
return the above values but ignore the raw data.

Usage:
------

1. Wire TGAM board to Espruino board

|  TGAM pin   | Espruino pin   |
|-------------|----------------|
|  `-`        | GND            |
|  `+`        | 3.3            | 
|  `T`        | Any Serial RX pin, for example A3  |

2. Write some code

```javascript
   // event handler that just dumps data
   function processBrainData(data) {
     console.log(data.field, data.value);
   }
   
   // initialize Brain module
   brain = require('Brain').connect(Serial2, A3, 9600);

   // hook up event handler
   brain.on('data', processBrainData);
```

**Disclaimer:** use at your own risk.

Useful links:
-----------

- TGAM Datasheet: http://www.seeedstudio.com/document/pdf/TGAM%20Datasheet.pdf
- TGAM Protocol: http://developer.neurosky.com/docs/doku.php?id=thinkgear_communications_protocol
