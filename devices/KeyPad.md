<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
KeyPad Matrix
=============

* KEYWORDS: Module,KeyPad,Key pad,matrix,buttons,button,switch

![Key Pad](4x4.jpg)

A [KeyPad Matrix](http://en.wikipedia.org/wiki/Keyboard_matrix_circuit) is a selection of switches arranged in a grid. One side of each switch is connected with horizontal wires (rows) and one side is connected with vertical wires (columns). By putting a signal on one side (for example the rows) and reading the other side (the columns), you can determine which key is pressed down.

**Note:** this isn't very good at determining when multiple keys are pressed.

KeyPads are handled by the [[KeyPad.js]] module. 

Simply supply two arrays, one of wires connected to columns,
one of wires connected to rows.

If a third argument (a callback function) is supplied, watches will be set up, and the callback
will be called automatically as soon as a button is pressed. If it isn't, it's up to the user to
use ```keypad.read()``` to find out what key is pressed. -1 will be returned if no key is pressed.

For example, you could connect the Key Pad in the Ultimate kit to B2,B3,B4,B5,B6,B7,B8 and B9 (they're one long row of pins). The wire nearest the ```D``` key could go to B2, and the wire nearest ```*``` could go to B9. You'd then use the module as follows:

```
require("KeyPad").connect([B2,B3,B4,B5],[B6,B7,B8,B9], function(e) {
  print("123A456B789C*0#D"[e]);
});
```

or

```
var keypad = require("KeyPad").connect([B2,B3,B4,B5],[B6,B7,B8,B9]);
print("123A456B789C*0#D"[keypad.read()]);
```

Using 
-----

* APPEND_USES: KeyPad

Buying
-----

* [eBay](http://www.ebay.com/sch/i.html?_nkw=matrix+membrane+keypad)
