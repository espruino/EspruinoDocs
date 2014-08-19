<!--- Copyright (c) 2013 Spence Konde. See the file LICENSE for copying permission. -->
MOSFETs
=====================

* KEYWORDS: MOSFET,Transitor

![Several MOSFETs on an Espruino board](onboard.jpg)

A MOSFET (Metal Oxide-Semiconductor Field Effect Transistor) is a semiconductor device that can be used as a solid state switch. These are useful for controlling loads that draw more current, or require higher voltage, than a GPIO pin can supply. MOSFETs have three pins, Source, Drain, and Gate. The source is connected to ground (or the positive voltage, in a p-channel MOSFET), the drain is connected to the load, and the gate is connected to a GPIO pin on the Espruino. The *voltage* on the gate determines whether current can flow from the drain to the load - no current flows to or from the gate (unlike a bipolar junction transistor) - this means that if the gate is allowed to float, the FET may turn on, or off, in response to ambient electrical fields. Therefor, it is recommended that a pulldown resistor be placed between the gate and the drain. In their on state, modern MOSFETs have very low resistance. 

N-channel vs P-channel
----------------------

In an N-channel MOSFET, the source is connected to ground, the drain to the load, and the FET will turn on when a positive voltage is applied to the gate. N-channel mosfets are easier to manufactur, and hence cheaper, easier to work with, and have higher performance. 

In a P-channel MOSFET, the source is connected to a positive voltage, and the FET will turn on when the voltage on the gate is below the source voltage. This means that if you want to use a P-channel mosfet to switch voltages higher than 5V, you'll need another transistor (of some sort) to turn it on and off.

Enhancement vs Depletion mode
----------------------

In an enhancement mode MOSFET, when Vgs = 0, the MOSFET is off, and can be turned on by applying a positive (negative, for p-channel) voltage to the gate, relative to the source. This is the most common kind, and is easiest to use as a switch with the Espruino.

In a depletion mode MOSFET, when Vgs = 0, the MOSFET is on, and a negative (positive for p-channel) voltage must be applied to the gate to turn it off. 


Selection of MOSFETs
--------------------

Unless otherwise noted, the below discussion assumes use of an N-channel enhancement mode MOSFET. 

`Gate-to-Source voltage (Vgs)` One of the most important specs is the voltage required to turn the FET completely on. This is not the threshold voltage - that's the voltage at which it first starts to turn on. Since the Espruino can only output 3.3v, for the simplest connection, we need a part that provides good performance with a 3.3v gate drive. In the datasheet for a MOSFET, a graph will typically be included showing on-state properties at various gate voltages. The key specification here will typically be given as a graph of the the drain current (Id) vs drain-source voltage (Vds - this is the voltage drop across the MOSFET), with several lines for different gate voltages. Make sure that, at the current your load requires, the voltage drop is acceptable with a 3.3v gate drive. 

Unfortunately, there are not many MOSFETs available in convenient through-hole packages that will work with a 3.3v gate drive. The [IRF3708PBF](http://www.irf.com/product-info/datasheets/data/irfr3708pbf.pdf) is a good choice in the large TO-220 package - it's current handling capacity is sufficient for almost any purpose, even at 3.3v on the gate. There is also a very wide variety of low-voltage MOSFETs available in surface mount packages with excellent specs, often at very low prices. The popular SOT-23 package can be soldered onto the Espruino's SMD prototyping area as shown in the included pictures - note that the traces between the SMD pads and the pins on the Espruino are fairly thin, so this should not be used for currents much over an amp. 

`Continuous Current` Make sure that the continuous current rating of the part is sufficient for the load - many parts have both a peak current and continuous current rating, and naturally, the former is often the headline spec. 

`Drain-Source Voltage (Vds)` This is the maximum voltage that the MOSFET can switch. 

`Maximum Gate-Source Voltage (Vgs)` This is the maximum voltage that can be applied on the gate. This is particularly relevant in the case of a p-channel mosfet switching a fairly high voltage, when you pull the voltage down with another transistor or FET.


Connection
------------------

N-Channel:
![N-Channel MOSFET](nchmosfet.jpg)


P-Channel: 
![P-Channel MOSFET](pchmosfet.jpg)

note the 10k resistors between the gates and sources. 
