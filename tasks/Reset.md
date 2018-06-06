<!--- Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Resetting Espruino
===================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Reset. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Reset,Resetting,Reboot

Only the [Original Espruino Board](/Original) has a dedicated Reset button. Espruino's
interpreter means that very few things will lock up the device to the point where
a hardware reset is needed, and using the `reset()` command (and/or Ctrl-C to
break out of any running code) is usually good enough (while keeping the USB/Bluetooth
  communications channel open).

However if a hardware reset is needed, in Espruino 1v99 the `E.reboot()`
command was added. When this is called it will have the almost safe effect as
toggling the reset pin on the device.

If you want to configure your own pin as a reset pin, all you need to do is
run the following code:

```
setWatch(E.reboot, RESET_PIN, { irq:true });
```

Whenever the reset pin changes state it will then trigger a hardware
reset of the device.

**Note the use of `irq:true`:** This forces `E.reboot` to be called from
a hardware interrupt, not from the idle loop. It means that if your code
is busy (for instance in a `while(true);` loop) then the reset will
still execute.

Upon reset, any previously saved code will still be loaded. If your device
keeps loading the code and is unusable, please see the [reference page for
your particular device](/Reference#hardware) as you can usually perform
a full reset by holding the on-board button at the correct time while booting.
