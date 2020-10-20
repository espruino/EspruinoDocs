<!--- Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Puck.js FET
==============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Puck.js+FET. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Puck.js,FET
* USES: Puck.js,Web Bluetooth,BLE

[Puck.js](/Puck.js) version 2 contains an on-board FET. This allows you to control
medium current (up to 200mA) devices  direct from Puck.js, without external components.

How it works
------------

Puck.js has an on-board FET, connected to pin `D26` and `GND` (there's also a global
variable called `FET` in Espruino which is equal to `D26`).

![Puck.js FET](sch.png)

When pin `D26` is set high, the FET conducts (acting like a closed switch) and
connects the `FET` pin to `GND`. Anything connected between a power source and
the `FET` pin would then turn on.

Specs
-----

The FET used is a NTZD3154 ([datasheet](https://www.onsemi.com/pub/Collateral/NTZD3154N-D.PDF)).
It's a dual FET device, with the first FET used for the IR transmitter, and the second FET
available for your use.

It has the following specs:

* Max 20v drain to source (absolute maximum voltage that can be switched)
* Max 540mA current (350mA reverse voltage)
* 0.5 Ohm resistance when on

To power devices, you have two options:

### Power from Puck.js's battery

Puck.js's battery is a 3V CR2032 battery, which is roughly 220mAh - this
means there's not a huge amount of power available to power external devices,
but it may still be useful in some applications.

If your device draws too puck power it may well lower the voltage enough
to turn Puck.js off as soon as you turn the FET on with `FET.set()`!

To do this simply connect:

* `+` of your device to the `3V` pin of Puck.js
* `-` of your device to the `FET` pin of Puck.js

As an example you could connect a speaker between `FET` and `3V` and use the
following to make it beep:

```JS
function beep() {
  analogWrite(FET,0.01,{freq:1000});
  setTimeout(function() {
    FET.reset();
  },200);
}

beep();
```

**NOTE:** that if you're planning on using a Piezo speaker, you'll need a
resistor *across* the speaker. Piezos are like capacitors and will tend to
hold their charge unless they have something to discharge themselves.

### Power from External battery

Because the FET effectively just shorts the `FET` pin to `GND` we can use it
to switch higher voltages than Puck.js's battery *as long as the external voltage
is less than 20v*.

To do this connect:

* `+` of your device to the external battery's `+` terminal
* `-` of your device to the `FET` pin of Puck.js
* Puck.js `GND` to the external battery's `-` terminal

Now you can switch the external device on and off with `FET.write(1)` or `FET.write(0)`.

Warning!
--------

Electromagnetic devices (motors, solenoids, speakers, etc) let out big spikes
of electricity when they are disconnected from power. While Puck.js's FET
provides a certain level of protection (350mA) for this Back-EMF, if you're
trying to power anything of any size with the FET pin we'd suggest you add
your own diode across the pins of device that you're powering to help to
protect your Puck.js.
