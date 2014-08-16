<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
MOSFETs
=====================

* KEYWORDS: MOSFET,Transitor

![Several MOSFETs on an Espruino board](onboard.jpg)

A MOSFET (Metal Oxide-Semiconductor Field Effect Transistor) is a semiconductor device that can be used as a solid state switch. These are useful for controlling loads that draw more current, or require higher voltage, than a GPIO pin can supply. MOSFETs have three pins, Source, Drain, and Gate. The source is connected to ground (or the positive voltage, in a p-channel MOSFET), the drain is connected to the load, and the gate is connected to a GPIO pin on the Espruino. The *voltage* on the gate determines whether current can flow from the drain to the load - no current flows to or from the gate (unlike a bipolar junction transistor) - this means that if the gate is allowed to float, the FET may turn on, or off, in response to ambient electrical fields. Therefor, it is recommended that a pulldown resistor be placed between the gate and the drain. In their on state, modern MOSFETs have very low resistance. 

N-channel vs P-channel
----------------------

In an N-channel MOSFET, the source is connected to ground, the drain to the load, and the FET will turn on when a positive voltage is applied to the gate. N-channel mosfets are easier to manufactur, and hence cheaper, easier to work with, and have higher performance. 

In a P-channel MOSFET, the source is connected to a positive voltage, and the FET will turn on when the voltage on the gate is below the source voltage. This means that if you want to use a P-channel mosfet to switch voltages higher than 5V, you'll need another transistor (of some sort) to turn it on and off.


Selection of MOSFETs
--------------------

Unless otherwise noted, the below discussion assumes use of an N-channel MOSFET. 

`Gate-to-Sourch voltage (Vgs)` One of the most important specs is the voltage required to turn the FET completely on. This is not the threshold voltage - that's the voltage at which it starts to turn on. In the datasheet for a MOSFET, a graph will typically be included showing on-state properties at various gate voltages. Since the Espruino can only output 3.3V, make sure that a line is shown for that voltage or less, and that the performance is acceptable. 

While many of us would prefer to use through-hole parts, unfortunately, it is difficult or impossible to find MOSFETs in through-hole packages that are spec'ed for use at a gate voltage of less than 4.5v. Sometimes, those can be used with a 3.3v gate drive, particularly for non-demanding applications - but it's hard to know ahead of time if they will. Luckily, the common SOT23 surface mount package fits well on the SMD prototyping area on the Espruino.

`Continuous Current` Make sure that the continuous current rating of the part is sufficient to power the load - many parts have both a peak current and continuous current rating, and naturally, the former is the headline spec. 

`Drain-Source Voltage (Vds)` This is the maximum voltage that the MOSFET can switch. 

`Maximum Gate-Source Voltage (Vgs)` This is the maximum voltage that can be applied on the gate. This is particularly relevant in the case of a p-channel mosfet switching a fairly high voltage, when you pull the voltage down with another transistor or FET.


Connection
------------------

N-Channel:
![N-Channel MOSFET](nchmosfet.jpg)


P-Channel: 
![P-Channel MOSFET](pchmosfet.jpg)

note the 10k resistors between the gates and sources. 
