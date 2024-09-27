<!--- Copyright (c) 2023 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Stopping Bangle.js Reset by Button
==================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Bangle.js+Button+Reset. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Reset,Button,Load,Timeout,Reload,Reboot,Long press
* USES: Bangle.js,Bangle.js2

In order to make sure you can't 'brick' your [Bangle.js 2](/Bangle.js2), it has two mechanisms to reboot built in:

* If you hold the button for 1.5s second, the watch will reload the default app (normally the clock)
* If you hold the button for ~10 seconds the firmware will completely reboot. This is handled by a hardware watchdog, and if for any reason the 'poll handler' doesn't get called in ~5 seconds the watch will automatically reboot too.

In some cases you may wish to stop the user from being able to exit your app by holding a button - to do this you need to disable both mechanisms:

Disabling App Reload
---------------------

[`Bangle.setOptions`](http://www.espruino.com/Reference#l_Bangle_setOptions) has an option called `btnLoadTimeout`. This allows you to configure how long the button has to be pressed to reload the app (1.5s/1500ms is the default).


* `Bangle.setOptions({btnLoadTimeout:3000});` increases the time the button must be pressed to 3 seconds
* `Bangle.setOptions({btnLoadTimeout:0});` disables the ability to reload by pressing the button

**NOTE:** Even if you disable or set a high time for the reload, the watchdog will still take effect.


Disabling the Watchdog
-----------------------

Even if the reload button is disabled, you can perform a full reboot by holding the button for ~10 seconds.

To disable this you need to manually kick the watchdog timer every few seconds with:

```JS
Bangle.setOptions({btnLoadTimeout:0}); // disable app reload
setInterval(()=>E.kickWatchdog(), 2000); // disable watchdog
```

**NOTE:** If you do this and your code also disables Bluetooth, you will have made your watch completely unreachable. Your only option will be to wait until the battery is flat (which may be some time!) and then while rebooting the watch, keep the button held so you can boot it without loading your code.

However because it's so easy to render the watch unresponsive with bad code, we would recommend adding a timer - for instance this will increase the time needed for a reboot to around 25s (20s plus the 5s watchdog period):

```JS
Bangle.setOptions({btnLoadTimeout:0}); // disable app reload
var bootTimer = 0;
setInterval(function() {
  if (BTN.read()) bootTimer++;
  else bootTimer=0;
  if (bootTimer<10) E.kickWatchdog();
}, 2000);
```

