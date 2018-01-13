<!--- Copyright (c) 2015 bartmichu, Pur3 Ltd. See the file LICENSE for copying permission. -->
Analog RGB LED Control 
======================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/RGBLed. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,LED,Light,Color,RGB

Using RGB LEDs with Espruino is straightforward and you don't really need any extra modules - you can interact with them directly using the ```digitalWrite()``` and ```analogWrite()``` functions.

On the other hand, if you want to start quickly with operations like strobing or changing the color in a familiar way then you may want to use this module instead.

There is only one thing to remember: on the board use either [[DAC]] or [[PWM]] output pins.

Examples
---------------

Create a LED instance with red on C7, green on C8 and blue on C9. By default it is on and the color is ```"#ffffff"```

```
var led = require("RGBLed").connect([C7, C8, C9])
```

If you want the LED to be off by default then pass falsey value as a second argument:

```
var led = require("RGBLed").connect([C7, C8, C9], false)
```

If you want, you can also specify initial color:

```
var led = require("RGBLed").connect([C7, C8, C9], true, "#00ff00")
```

Start blinking every second:

```
led.strobe(1000)
```

Change the color:

```
led.setColor("0000FF")
```

Stop blinking and leave LED on:

```
led.on()
```

Module reference
---------------

`require("RGBLed").connect(pins, initialState, initialColor)` - The initialisation function has three parameters, but only the first one is required.

* pins (Array) - Three pins, for Red, Green, and Blue
* initialState (Boolean) - Optional. LED is on by default but you can change it with this parameter.
* initialColor (String) - Optional. Initial color is set to "#FFFFFF" but you can change it with this parameter.

`function on()` - Turn the Led on using previous color value. Stops the interval operation, if any.

`function off()` - Turn the Led off and save its color value for later use. Stops the interval operation, if any.

`function toggle()` - Toggle the current state. If Led is on then turn it off, if off then turn it on.

`function getState()` - Return current state.

`function setColor(color)` - Set the Led color specified as hexadecimal color value (#RRGGBB). Leading hash sign is optional. Doesn't change LED's state, so if it was off then it will stay off.

`function strobe(ms)` - Strobe the Led on/off in phases over time specified in milliseconds (defaults to 100ms). This is an interval operation and can be stopped by calling ```on()``` or ```off()``` function.
