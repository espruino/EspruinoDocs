<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Power Consumption
===============

* KEYWORDS: Power,Watts,Efficiency,Milliamps,Microamps,Sleep,Stop,Standby,Deep Sleep

**Note:** This information is mainly relevant to the Espruino board. A lot of other boards do not have the same power save functionality.

Espruino can run in one of 3 different modes.

| Mode | Current | Time on 2000mAh battery | Notes |
| -----|---------|--------|
| Run | ~35mA | 57 hours | Espruino is executing code and running at 72Mhz |
| Sleep | ~12mA | 7 days | Espruino has stopped the clock to the CPU, but all peripherals are still running and can wake it up |
| Stop | ~0.03mA | > 2 years | Espruino has stopped the clock to everything except the real-time clock (RTC). It can wake up on setInterval/setTimeout or setWatch |

These figures are for the Espruino rev 1v4. The rev 1v3 has a slightly higher 'Stop' power consumption of 0.11mA.

**Note:** Standby mode is available on the STM32 chip (very low power, but **all data** is lost from RAM). It is not currently used in Espruino.

Sleep
----

This is the normal low-power mode for Espruino. You don't have to do anything to enter this at all, Espruino will enter it whenever it thinks it can.

Stop
----

This is the best low-power mode in Espruino, which involves turning off the clock to all peripherals (which stops them) and waking only when an external pin changes state or after a set amount of time. It is only enabled when you run ```setDeepSleep(1)``` (you can turn it off by passing 0). It's not enabled by default because:

* Espruino won't wake when USB is plugged in - after USB is unplugged and plugged back in, it must have been awakened by something. We'd suggest ```setWatch(function() {}, BTN, true)``` so that you can press the button to wake up Espruino and allow you to connect via USB.
* Espruino can't be woken by USART (and they will not receive data while it is sleeping). This means that if you were using the Bluetooth module for receiving communications then you can't use deep sleep. In reality this isn't such a big problem because the Bluetooth module draws 30mA when active!
* All external peripherals (including timers for PWM) will stop. Espruino does not currently detect if any of these timers are in use before sleeping.

### Conditions for Deep Sleep

For deep sleep to work, you must:

* Have called ```setDeepSleep(1)```
* Not be connected to USB
* Not have any data waiting to be sent down Serial or USB
* Have no pending callbacks from setIntervals/setTimeout that are **less than 1.5 seconds** away. Espruino uses the real time clock for wakeups, and the RTC can only wake up on a second by second basis.

  **Note:** Espruino won't enter deep sleep as soon as you execute ```setDeepSleep(1)```. It'll wait until it doesn't have anything to do, and then it'll enter it. For example you can type ```setDeepSleep(1)``` while you're connected to your PC via USB, and Espruino will only enter deep sleep mode once you unplug from USB. 

Examples
-------

You can wake after a set amount of time - for example to flash an LED every 60 seconds:

```
setInterval(function() {
  digitalWrite(LED1, 1);
  setTimeout(function () {
    digitalWrite(LED1, 0);
  }, 20);
}, 60000);
setDeepSleep(1);
```

or you can wake when an external pin changes state - for instance to flash an LED when pressing the button:

```
setWatch(function() {
  digitalWrite(LED1, 1);
  setTimeout(function () {
    digitalWrite(LED1, 0);
  }, 20);
}, BTN, true);
setDeepSleep(1);
```

As suggested above, we'd advise that you **always** add setWatch on BTN when allowing deep sleep, as this allows you to wake Espruino up so that you can connect to it with USB.

Debugging Sleep
-------------

You can call ```setSleepIndicator(LED1)```. LED1 will then be lit whenever the device is **not** sleeping, allowing you to make sure it is sleeping as much as possible. There is currently no way to see when Espruino has entered Deep Sleep.

Note that Espruino won't go to sleep when it is connected via USB, as it knows it has ample power available.

Probably the best way to measure power draw is to connect a multimeter in series with a battery and power Espruino from that. You'll then get a good idea of exactly how much power is being used.

If Espruino is not sleeping, check that you haven't called ```setInterval``` with a small timeout. For instance you may have been controlling model aircraft servos or something similar, but if they are already in the correct position you can call ```clearInterval(...)``` to ensure that Espruino is not having to wake up as often.

Saving Power
-----------

Bear in mind that lighting just one LED light uses about the same amount of power as Espruino itself. Don't turn on LEDs when sleeping, and be sure that Espruino isn't powering anything externally. If you've used outputs, you may be able to set them to 'float' either by reading the value with ```digitalRead``` or by using ```pinMode``` to change the state of the pin to input.

Other sources of Power Draw
------------------------

On the Espruino Board rev 1v3 the voltage regulator draws 80uA, which makes up the majority of the 110uA power draw. The rev 1v4 has a much more efficient regulator, which allows a power draw of just 30uA.

**What follows is not relevant for Espruino Boards rev 1v4 and later**

The STM32 itself can run from between 2 and 3.6v, so you may not need a voltage regulator. If you need the lowest possible power and you are running from a Lithium Ion/Polymer battery that doesn't exceed 4.3v, you can replace the voltage regulator with a single diode - which will drop the voltage by 0.7v. (bringing the voltage to `5v - 0.7v*2 = 3.6v` when on USB, and `4.2v - 0.7v = 3.5v` maximum when on Li-Ion batteries.

![Low power modifications](lowpower.jpg)

To do this, see the image above. Unsolder the small 5-pin IC that is near the battery connector, and then solder a standard diode (the SOD-123 package works well) between the two pins nearest the STM32 chip. The diode should be placed with the white line on the diode towards the pushbuttons.
