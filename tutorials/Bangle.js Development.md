<!--- Copyright (c) 2019 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bangle.js Development
==========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Bangle.js+Development. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Bangle.js,Development
* USES: Bangle.js,Bangle.js2

You may also be interested in the [Bangle.js 1](Bangle.js) or [Bangle.js 2](Bangle.js2) Hardware reference pages.

Don't have a watch?
------------------------------

You can work along using [the Bangle.js online Emulator](https://www.espruino.com/ide/emulator.html)
however you won't get access to the sensors, Bluetooth, or vibration motor!

If your watch isn't connectable by Bluetooth:
-----------------------------------------------

### Bangle.js 1

* When you're at the clock screen on Bangle.js, press the middle button (**BTN2**)
* Use the bottom button (**BTN3**) to scroll down until you get to Settings
* Press **BTN2** to select
* **Either:** Ensure `BLE` and `Programmable` are `On` to enable programming permanently, and then choose `Back` to exit settings
* **Or:** Scroll down to `Make Connectable`, select it, and leave Bangle.js displaying on the `Connectable` screen

### Bangle.js 2

* When you're at the clock screen on Bangle.js, press the button
* Scroll down until you get to `Settings` and then tap on it
* Now you can drag your finger up and down to scroll, and then tap to select the `Bluetooth` menu item.
* **Either:** Ensure `BLE` and `Programmable` are checked to enable programming permanently, and press the button repeatedly exit settings
* **Or:** Tap `Make Connectable`, and leave Bangle.js displaying on the `Connectable` screen

### Then...

* Head to https://espruino.com/ide in Chrome
* Click `Connect` up the top left of the screen
* Click `Web Bluetooth` (if you don't see 'Web Bluetooth' check out the [Bluetooth Getting Started Guide](http://www.espruino.com/Quick+Start+BLE#banglejs))
* Search for your Bangle.js in the list of devices. Devices will be called `Bangle.js abcd` in the connection menu, and the code `abcd` is displayed (by default) in the top right of your Bangle.js's widget bar.

You should hopefully be connected now! If not, take a look at http://www.espruino.com/Quick+Start+BLE#banglejs

If you just want to get started and have an Android phone, you can use that too! If you don't have an external keyboard then you might want to install the free ['Hackers Keyboard'](https://play.google.com/store/apps/details?id=org.pocketworkstation.pckeyboard&hl=en_US) app to get access to arrow keys via touchscreen.

**Note:** If you've used Espruino before, make sure the Upload button (middle of the screen) shows `RAM` underneath it. Otherwise by writing to `Flash` you can remove the watch's built-in menu (you can just re-add it by removing and installing `bootloader` using https://banglejs.com/apps)

Once connected
---------------

The Web IDE is made up out of two parts - there's the black REPL on the left, and a white editor on the right.

The REPL on the left is a direct connection to the watch and executes anything you type immediately - but be careful, it uses bracket counting to detect when to execute, so:

```JS
if (true) {
  Bangle.buzz();
}
```

will make your watch vibrate, but:

```JS
if (true)
  Bangle.
    buzz();
```

With  `Enter` rather than `Alt-Enter` will run three commands, the last two of which will cause an error. If you write your code in a K&R style (with the opening brackets at the end of a line rather than on their own line) then you're unlikely to hit issues - and if you write your code on the right hand side of the IDE, the line endings are handled automatically.

When writing on the right, you can click the button in the middle of the IDE to reset Bangle.js (temporarily!) and upload the code on the right hand side.

You can now try some commands:

**First, let's (temporarily) reset the watch and get rid of the connectable window** (if you'd had to choose `Make Connectable` initially)...

Type:

```JS
reset();
```

on the left-hand side of the IDE. The `Bangle.js` logo will be displayed.

```JS
Bangle.buzz();
```

**Note:** Bangle.js 2 devices do not contain a speaker, but instead use the vibration motor for sound (which is very quiet). So `Bangle.beep();` will beep, but extremely quietly.

You'll notice the functions return promises, so you can chain them:

```JS
Bangle.buzz().then(() => {
  console.log("Done!");
});
```

You might want to clear the screen, in which case you can use `g.clear()`. A
full list of Graphics commands is at: https://espruino.com/Reference#Graphics

If you want to write a message on the screen, you can use `E.showMessage`:

```JS
E.showMessage("Hello","A Title")
```

**In general, Bangle.js specific functions/events are in the [`Bangle`](https://www.espruino.com/Reference#Bangle) object,
and Espruino-specific functions are in the [`E`](https://www.espruino.com/Reference#E) object**

The screen itself contains a VT100 terminal, so you can use `Terminal.print` and `Terminal.println` if you just want to log data:

```JS
Terminal.println("Hello World")
```

But these will scroll the screen up, which may make currently running apps
look a bit strange!

It's worth noting that when you're disconnected from Bluetooth, Bangle.js will
write any messages from `console.log` (as well as any Exceptions) to the display only
if `Debug info` is set to `Show` in `Settings`. This can be a great way of
seeing if your app is failing in unexpected ways when in every day use.

Want to react to user input on the buttons? You can query the button state.

* **Bangle.js 1** - **BTN1/BTN** is the top button, **BTN2** is the middle, **BTN3** is the bottom
* **Bangle.js 2** - **BTN1** or **BTN** refers to the single button on the side

```JS
BTN1.read();
```

Will output `true` or `false` depending on the state of the button, but usually we don't want to poll because running code all the time would use battery.

On Espruino devices you can use the [`setWatch`](http://www.espruino.com/Reference#l__global_setWatch) function. This sets up the hardware to watch for a button press,
and calls a function when it is pressed:

```JS
setWatch(() => {
  E.showMessage("You\npressed\nthe button!");
  setTimeout(()=>g.clear(), 1000);
}, BTN1, {repeat:true, edge:"falling"});
```

This code does work on Bangle.js, but isn't recommended. As you start to do more with your Bangle,
showing menus and responding to touchscreen events, it can be hard to keep track
of `setWatch` and other events and disable them when they're not needed. It's also more tricky to account
for hardware differences between devices (Bangle.js 1 has 3 buttons with the middle being `BTN2`,
and Bangle.js 2 has just one button, called `BTN`/`BTN1`).

To work around this, Bangle.js provides the [`Bangle.setUI`](https://www.espruino.com/Reference#l_Bangle_setUI)
method, which keeps track of your event handlers and disables all the 'old' ones the next time it is called.

The equivalent of the above would be:

```JS
function waitForButton() {
  g.clear();
  Bangle.setUI({
    mode : "custom",
    btn : ()=>{
      Bangle.setUI(); // remove old handler
      E.showMessage("You\npressed\nthe button!");
      setTimeout(waitForButton, 1000);
    }
  });
}
waitForButton();
```

This is a bit longer, but it is easily extendable to add other handlers, for instance for `touch` events.

**At this point the code's getting longer, so you might want to
copy this to the right-hand side of the IDE and then use the
Upload button...**

Using the Right-hand side of the IDE
----------------------------------------

The right-hand side of the IDE is a syntax-highlighted editor with code completion (press Ctrl-Space for suggestions). To
send the code you have written in the editor on the right to Bangle.js you must click the upload button:

![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA+CAIAAAD4Vu8uAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5AMMEBgzbZpsYwAAAxRJREFUaN7tl11P01AYxx+Wri1YRle2WcZCAsREJXBBjEyjxMiNwIVfwY/htZde+xGIJHpNCBEujFeQGJLBFHlZYQxSStd1ZTsbbS1ebA66NaCsvAzOuVr6nDW//fY/5zmn6eWrMWi04YEGHBgaQ2NoDI2hMTSGxtCNBz03PTU3PfXvn2+j6SZ8nr6kQbgS6P+aPzI6fjWm619V9bzhNsWj/r+4njfcpuZyZiJHRsdPd3ntMl3BrT9FF9VcqoTVgp454YpNOwK57tvNTJ8C56j/3JkmXBRQgTiJ6NbJDu/TN2mfxmePG5FpfHPBt3F8G8eZxtAYGkNjaAyNoTH0pV8CLmh4/ZEuv9e5pmeSKdU4hvb1PB+MNFfKlpnXpI3VDREdlZ/QnY+jvSzoO7H5uFJ66O9/1t9BQCH1/dt6HgCACA4+fRDwgLo+v5A6PCd15PW792O8U0Wcevvmg1odD0PbXU0IqwlBkBDBhgceRlr+luhAkDU1FZGBEFuVp2YuWJrmYdvb6s6asfR5MqY7FHKxyU9LRm2mTW1vM7m9mdxeW/kp5ABaWn3lIhXifb/VnTUZUVzQf4LsECGDZgM0AEBbgPUiVKgXW5qZmBVrNX/9OCM5LkSCpGmKpqlWroOnAYoob5U9hxkrIykZSc6THM82HX8FaVlgQpwXoDXEknlNM+ACZOs2zTboZr5vODo0HB16MtB1R5dXfmwdlJnv+ixNRgRpHqi6LSEeMyOp0BbgSKY9QBcVpfwz3ZUtfrFptkEfKkJsOR5LqgZAQd5K5koLjuJ5Bjzs/UdDL6J9nSTYE2LKsga+dp5jaV0RNXf2EJvsGs02aAupopwWExspBL5wd5gseQ7xDOTFX4vL8cXl+GJCNewJ0ZX0gYftjjCmks66tvUdy67V7Nhc8kJCNgjuXo/fA0CHgj4oyqm9fTm9L6f3d/eyli0hVlGREEGRVlZWLfc27LJsJ83OHdGUBSFnUXx3L0PxIQZ0VcpVaoqUq0pIIa0gsDRRPXK1z0gzE7MLTpqv+W3c6/UahtFgZw9nYgD4A3Zhms5jL/62AAAAAElFTkSuQmCC)

This preprocesses the code you wrote, loading any modules you included with `require(...)`, and
the uploads it to Bangle.js. The destination is written underneath, and can
be changed either by pressing the down arrow, or by going to `Settings`
and `Communications`:

* `RAM` - you should normally try and use this - it writes nothing permanently
to Bangle.js so is quick and safe to develop with.
* `Flash` - DO NOT USE THIS ON BANGLE.JS because you will
overwrite the existing Bangle.js bootloader with your own app (if you do, you can re-install the `bootloader` app using https://banglejs.com/apps).
* `Storage` - you can use this to select a file on Storage to write to. This
is great for developing your own apps - see [Bangle.js: First Application](Bangle.js+First+App)


Next Steps
-----------

You might want to check out:

* [Bangle.js: First Application](Bangle.js+First+App)
* https://github.com/espruino/BangleApps/blob/master/README.md for detailed info on the format of custom apps
* https://github.com/espruino/BangleApps/tree/master/apps for all the source code for existing apps


Tutorials
----------

* APPEND_USES: Bangle.js
