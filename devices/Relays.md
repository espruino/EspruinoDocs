<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Relays
=====

* KEYWORDS: Relay,Switch

[Relays](http://en.wikipedia.org/wiki/Relay) are electrically operated switches. A small current passing through one side will operate a physical switch. This means that you can control almost anything with a relay that you would turn on and off with a physical switch (batteries, motors, even mains-powered electic lights).

Pretty much all relays are electromagnetic - this means that there is a coil of wire inside that creates a magnetic field that operates a switch. When this coil is turned off it creates [Back EMF](http://en.wikipedia.org/wiki/Counter-electromotive_force) which can cause damage to your Espruino unless it is protected (with a diode). The Espruino Board will also supply a **maxiumum** current of 25mA on each pin, which is too small to make a lot of relays work unless you provide some simple form of amplification. This is covered [in many places](http://makezine.com/2009/02/02/connecting-a-relay-to-arduino/) so we won't go into it here.

**However** many companies supply 'relay modules' that contain one or more relays, screw terminals, and the circuitry needed to drive them easily from Espruino. These can be controlled simply by connecting GND, VBAT (5V), and any signal pin from Espruino.


Buying
-----

You can buy relays from any electrical component supplier. However, as discussed above, we'd suggest that you don't connect a relay directly to Espruino.

Instead, think of buying a Relay Module. These are available from many places, but [eBay](http://www.ebay.com/sch/i.html?_nkw=relay+module+5v) is probably the easiest. Look for 'Relay Module 5V' to ensure that you get one that can be powered from a simple 5V power source. In addition to the big block on the PCB that is the relay, look for smaller black chip (not a transistor). This probably means that there is an opto-isolator on board, which provides better isolation than a normal transisitor.
