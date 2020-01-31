<!--- Copyright (c) 2019 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bangle.js Development
==========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Bangle.js+Development. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Bangle.js,Development
* USES: Bangle.js

You may also be interested in the [Bangle.js](Bangle.js Hardware reference)

# STEP 1 - Get Started

### If your watch isn't connectable by Bluetooth:

* In your watch, press the middle button
* Use the bottom button to scroll down until you get to Settings
* Press the middle button to select
* **Either:** ensure `BLE` and `Programmable` are `On` to enable programming permanently
* **Or:** Scroll down to `Make Connectable`, select it, and leave Bangle.js displaying on the 'Connectable' screen

* Head to https://espruino.com/ide in Chrome
* Click 'Connect' up the top left of the screen
* Click 'Web Bluetooth'
* Search for your Bangle.js (based on the last 4 digits) in the list of devices

You should hopefully be connected now! If not, take a look at http://www.espruino.com/Quick+Start+BLE#banglejs

If you just want to get started and have an Android phone, you can use that too! If you don't have an external keyboard then you might want to install the free 'Hackers Keyboard' app to get access to arrow keys via touchscreen.

**Note:** If you've used Espruino before, make sure `Save on Send` in `Communication` Settings (top right) is set to `To RAM` otherwise you will remove the watch's built-in menu (you can just re-add it using https://banglejs.com/apps)

## Once connected

The Web IDE is made up out of two parts - there's the black REPL on the left, and a white editor on the right.

The REPL on the left is a direct connection to the watch and executes anything you type immediately - but be careful, it uses bracket counting to detect when to execute, so:

```
if (true) {
  Bangle.buzz();
}
```

will make your watch vibrate, but:

```
if (true)
  Bangle.
    buzz();
```

With  `Enter` rather than `Alt-Enter` will run three commands, the last two of which will cause an error. If you write your code in a K&R style then you're unlikely to hit issues - and if you write your code on the right, the line endings are handled automatically.

When writing on the right, you can click the button in the middle of the IDE to reset Bangle.js (temporarily!) and upload the code on the right hand side. However the initial code (that works on most Espruino devices!) will fail as there's no LED on Bangle.js.

You can now try some commands:

**First, let's (temporarily) reset the watch and get rid of the connectable window:**

Type:

```
reset();
```

on the left-hand side of the IDE. The `Bangle.js` logo will be displayed.

```
Bangle.buzz();
```

Will make Bangle.js vibrate, and:

```
Bangle.beep();
```

Will make it beep. You'll notice they return promises, so you can chain them:

```
Bangle.buzz().then(() => {
  Bangle.beep();
});
```

You might want to clear the screen, in which case you can use `g.clear()`. A
full list of Graphics commands is at: https://banglejs.com/reference#Graphics

If you want to write a message on the screen, you can use `E.showMessage`:

```
E.showMessage("Hello","A Title")
```

**In general, Bangle.js specific functions/events are in the `Bangle` object,
and Espruino-specific functions are in the `E` object**

But the screen itself contains a VT100 terminal, so you can use `Terminal.print` and `Terminal.println` if you just want to log data:

```
Terminal.println("Hello World")
```

It's worth noting that when you're disconnected from Bluetooth, Bangle.js will by default write any messages from `console.log` - as well as any Exceptions - to the display. We'll add a 'Logging' section to the Settings app shortly to stop this, but it's a good way to see if your app has problems!


Want to react to user input on the buttons? You can query the button state. BTN1 is the top button, BTN2 is the middle, BTN3 is the bottom:

```
BTN2.read();
```

Will output `true` or `false` depending on the state of the middle button, but often we don't want to poll because that'd use battery.

Instead, you can use `setWatch`. This sets up the hardware to watch for a button press:

```
setWatch(() => {
  E.showMessage("You\npressed\nthe middle\nbutton!");
  setTimeout(()=>g.clear(), 1000);
}, BTN2);
```

**At this point the code's getting longer, so you might want to
copy this to the right-hand side of the IDE and then use the
Upload button**

By default, this will only happpen once, but you can add `{repeat:true}` to the end:

```
setWatch(() => {
  Bangle.buzz();
  E.showMessage("You\npressed\nthe middle\nbutton!");
  setTimeout(()=>g.clear(), 1000);
}, BTN2, {repeat:true});
```

The default is to detect button press, but you can also add `edge:"falling"` or
`edge:"both"` if you want to detect when the button is released.


Next Steps
-----------

You might want to check out:

* https://github.com/gfwilliams/workshop-nodeconfeu2019 (Step 2 and later)
* https://github.com/espruino/BangleApps/blob/master/README.md for making custom apps

Tutorials
----------

* APPEND_USES: Bangle.js
