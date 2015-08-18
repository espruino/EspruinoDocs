* KEYWORDS: Module,LED,Light,Color,RGB

Using RGB LED with Espruino is straightforward and you don't really need any extra modules - you can interact with it directly using the ```digitalWrite()``` and ```analogWrite()``` functions.
On the other hand, if you want to start quickly with operations like strobing or changing the color in a familiar way then you may want to use this module instead.
There is only one thing to remember: on the board use either DAC or PWM output pins.

Examples
---------------

Create LED. By default it is on and the color is ```"#ffffff"```
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

**Constructor function** - Constructor function has three parameters, but only the first one is required.
```
RGBLed(pins, initialState, initialColor)
```
* pins (Array) - Three pins.
* initialState (Boolean) - Optional. LED is on by default but you can change it with this parameter.
* initialColor (String) - Optional. Initial color is set to "#FFFFFF" but you can change it with this parameter.

**Function on()** - Turn the Led on using previous color value. Stops the interval operation, if any.

**Function off()** - Turn the Led off and save its color value for later use. Stops the interval operation, if any.

**Function toggle()** - Toggle the current state. If Led is on then turn it off, if off then turn it on.

**Function getState()** - Return current state.

**Function setColor(color)** - Set the Led color specified as hexadecimal color value (#RRGGBB). Leading hash sign is optional. Doesn't change LED's state, so if it was off then it will stay off.

**Function strobe(ms)** - Strobe the Led on/off in phases over time specified in milliseconds (defaults to 100ms). This is an interval operation and can be stopped by calling ```on()``` or ```off()``` function.
