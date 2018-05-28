<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
.NET Gadgeteer Modules
===================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/NET+Gadgeteer. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: NET,.NET,Gadgeteer
* USES: Only Espruino Board,Gadgeteer

Introduction
-----------

[.NET Gadgeteer](http://www.netmf.com/gadgeteer/) is a Microsoft prototyping platform that can be programmed in Microsoft .NET-based languages.

One of the main features is the use of 10 pin sockets to allow peripherals to be attached quickly and easily. The [Espruino Board](/Original) has enough space on the surface mount prototyping area to allow you to solder two of these connectors onto it.

There are a few different configurations of socket, but we're only going to deal with the SPI version here.

Wiring Up for [SPI](http://gadgeteer.codeplex.com/wikipage?title=Socket%20Type%20S)
---------------

We'd suggest you solder a gadgeteer connector onto the prototype area of the Espruino board, with the 'keyed' side nearest the buttons.

Then wire up as follows - you don't have to use these wirings, but we think they're the easiest to wire up while keeping the outside groups of pins available for other uses.

| Gadgeteer | Espruino |
|-----------|----------|
| 1 | 3.3v       |
| 2 | Bat (5v)   |
| 3 | A3 (GPIO)  |
| 4 | B11 (GPIO) |
| 5 | A2 (GPIO)  |
| 6 | B10 (GPIO) |
| 7 | A7 (MOSI)  |
| 8 | A6 (MISO)  |
| 9 | A5 (SCK)   |
| 10 | GND       |


Software
-------

You can't use .NET software directly though - unfortunately you'll have to re-write it for Espruino...

Using
----

* APPEND_USES: NET Gadgeteer
