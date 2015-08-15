* KEYWORDS: Module,LED,Light,Color


Module reference
---------------

**Function on()** - Turn the Led on using previous color value. Stops the interval operation, if any.

**Function off()** - Turn the Led off, color value is saved for later use. Stops the interval operation, if any.

**Function toggle()** - Toggle the current state. If Led is on then turn it off, if off then turn it on.

**Function setColor(color)** - Set the Led color. If Led is on then it will be applied immediately.

Parameters:

* **color** - {String} RGB color specified as hexadecimal color value (#RRGGBB). Leading hash sign is optional.

**Function strobe(ms)** - Strobe the Led on/off in phases over specified time. This is an interval operation and can be stopped by calling .on() or .off()

Parameters:

* **ms** - {Number} Milliseconds. Defaults to 100ms.