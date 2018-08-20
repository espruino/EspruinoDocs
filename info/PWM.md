<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Pulse Width Modulation
===================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/PWM. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Peripheral,Peripherals,Pulse Width Modulation,PWM,Pulse,Analog,Built-In

[Pulse Width Modulation](http://en.wikipedia.org/wiki/Pulse-width_modulation) allows you to create an 'average' analog value using only a digital output. It does this by outputting a square wave, where the pulse is high for the a certain proportion of the time. If you want a 'real' analog output, see [[DAC]].

In Espruino, you can perform Pulse Width Modulation using the following function:

```
analogWrite(PIN, value)
```

eg. ```analogWrite(A0, 0.2)``` (Pulse high 20% of the time, low 80%)

**Note:** Not all pins are capable of PWM. See the [[Reference]] for your board and look for ```PWM```. Some pins are also capable of proper Analog [[DAC]] outputs and for these, analogWrite will use the DAC by default.

To force Espruino to use PWM (instead of the DAC) or to specify a certain frequency, use:

```
analogWrite(PIN, value, { freq : my_freq_in_hz } )
```

Using PWM
---------------

* APPEND_USES: PWM
