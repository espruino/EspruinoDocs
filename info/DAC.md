<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Digital to Analog Converter
=======================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/DAC. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Peripheral,Peripherals,Analog,DAC,D2A,Built-In

**Note:** Very few pins (usually only 2) are capable of Analog Output, and some boards don't have any. See the [[Reference]] for your board and look for ```DAC```.

Analog outputs are easy to write in Espruino:

```analogWrite(A4, 0.5)```

This writes an analog value to A4, which should be **0.5*3.3v = 1.65v**

Note that if you use ```analogWrite``` on a pin that is not capable of analog outputs but that can handle [[PWM]], Espruino will automatically use [[PWM]] to create an analog value on that pin instead.


Using Analog Outputs
------------------------

* APPEND_KEYWORD: DAC
