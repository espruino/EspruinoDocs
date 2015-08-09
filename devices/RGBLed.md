<!--- Copyright (c) 2015 Michał Bartkowiak. See the file LICENSE for copying permission. -->

* KEYWORDS: Module,LED,Light,Color


Module reference
---------------

**Function on()** - Turn the Led on, using previous color value.

**Function off()** - Turn the Led off. Color value is saved for later use.

**Function toggle()** - Toggle the current state. If Led in on then turn it off, if off then turn it on.

**Function setColor(color)** - Sets the Led color. If Led is on then it will be applied immediately.

Parameters:

* **color** - {String} RGB color specified as hexadecimal color value (#RRGGBB). Leading hash sign is optional.

