<!--- Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Frequently Asked Questions
===========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/FAQ. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* APPEND_TOC

What is Espruino?
---------------------------------------------------------------------------

Espruino is a JavaScript Interpreter for Microcontrollers that makes embedded
software development quick and easy. The Espruino interpreter is firmware that
runs on a variety of different microcontrollers, but we also make
[Espruino Boards](/Order) that come with the interpreter pre-installed and
are the easiest devices to get started with.

Espruino itself isn't just the interpreter firmware or hardware - there's also the
[Web IDE](/Web+IDE), command-line tools, documentation, tutorials, and modules
which form a complete solution for embedded software development.


Having problems with your Espruino Board?
---------------------------------------------------------------------------

Check out the [[Troubleshooting]] page, and if that fails try posting on the [[Forum]]


It's plugged into my PC/Mac - what do I do now?
---------------------------------------------------------------------------

Have a look at our [[Quick Start]] page - this will walk you through exactly what you need to do.


Is there a forum where I can get help?
---------------------------------------------------------------------------

Yes! It's [right here](/Forum)


Is Espruino Open Source?
---------------------------------------------------------------------------

Yes! It's [all available on GitHub](https://github.com/espruino). The main
firmware is an MPLv2 License. If you're thinking of using Espruino for
your business then please get in touch. [There may be mutually beneficial ways to work together](/Business).


I've created something cool with Espruino, would you like to see it?
---------------------------------------------------------------------------

Absolutely! Please post up on the [projects page](http://forum.espruino.com/microcosms/139/) of the [forum](http://forum.espruino.com).


How is Espruino different to Arduino / Raspberry Pi / Embedded Linux?
---------------------------------------------------------------------------

### Espruino vs Raspberry Pi / Embedded Linux boards

* Raspberry Pis are very powerful and flexible, but have a relatively high power consumption in idle, making it difficult to run them off a battery. Raspberry Pi is ~50mA minimum when idling, Puck.js is 0.003mA.
* You can't reliably schedule actions in real-time on a Raspberry Pi which makes accurate timing difficult
* Raspberry Pis are good at Video, which Espruino isn't powerful enough to support.
* Espruino runs JavaScript: this makes it very approachable and easy for beginners. Raspberry Pi on the other hand gives you a choice of programming languages, which is powerful - but daunting.
* Raspberry Pi lacks Analog IO, which is supported by Espruino.
* Raspberry Pi requires an SD card containing the operating system (which Espruino doesn't).

### Espruino v Arduino

* Espruinos are smaller than most Arduino boards and are much easier to get started with.
* You don't have to pre-install software on your Mac or PC.
* While Arduino has low power consumption, the Espruino board is designed with efficiency in mind and draws over 10x less power when sleeping.
* The use of a JavaScript interpreter means Espruino doesn't have to be reset when you make changes to the code, however it also means that the execution speed will be slightly slower.


When I type a command, why does Espruino print `=undefined`?
---------------------------------------------------------------------------

When a command is executed, Espruino prints '=' followed by the value that is returned. For instance:

```
>1+2
=3
>analogRead(A0)
=0.0324```
However if you call a function that doesn't return a value, it will return 'undefined' - which is what you are seeing:
>digitalWrite(D0,1)
=undefined
```

**Note:** After Espruino 1v99, `=undefined` will not be printed.


When I type a function, why does Espruino print `=function ...`
---------------------------------------------------------------------------

Please see the answer to the previous question - when you define a function, the function itself is returned as the value. Espruino prints this to the console in the same way it does with every other command you type.


My code is lost when the power is removed from Espruino. What can I do?
---------------------------------------------------------------------------

It's as easy as typing `save()` in the left-hand side of the IDE. When power is re-applied Espruino will resume where it left off, remembering timers, watches, and even pin state. For certain things (like initialising connected hardware like displays) you'll want to run some code when Espruino starts up, in which case you can just add a function called `onInit()` - this will be executed each time Espruino starts.
For more information, see [the page on Saving](/Saving).


Can I use Espruino to control things from a program on my PC?
---------------------------------------------------------------------------

Yes! As long as you have a way to send data to the serial port from your program it's simple. All you need to do is send the command `echo(0)` - which stops the 'user interface' part of Espruino getting in the way. Then you can send and receive data using commands like `print(analogRead(A0))`.

For more information, see the page on [Interfacing with a PC](/Interfacing).


How fast is Espruino?
---------------------------------------------------------------------------

For pretty much anything that involves interacting with the real world (Servos, Motors, Lights, etc), Espruino is more than fast enough. Events via `setWatch` are timestamped, so you can measure pulse widths to within one microsecond (1 / 1,000,000 sec).

To give you a rough idea of speed, the following code will create a 1.5kHz square wave:

```
setInterval("digitalWrite(LED1,l=!l)",1000/3000);
```

So it is executing 3000 times a second while allowing you to run other tasks in the background. You can create much faster square waves using the [[PWM]] peripherals.

What isn't Espruino suitable for? Video rendering/processing or analysing large amounts of data. However you can always add [Inline Assembly](/Assembler), [Inline C](/InlineC) or [precompiled JS code](/Compilation) if you need some part of your project to execute very quickly.


How power efficient is Espruino?
---------------------------------------------------------------------------

Very. Because it is event based, the Espruino interpreter can put itself to sleep when it knows no action is required.

This means that code written for Espruino will be substantially more power efficient than the same code written in C, unless the C programmer has explicitly added code to enter low power sleep modes.
Currently, when sleeping, Espruino uses roughly 1/3 of the power that it does when it is busy, however when 'deep sleeping' it can use as little as 20 microamps - see the [[Power Consumption]] page for more information.


How much power can I supply from Espruino's Pins?
-------------------------------------------------

See the table below:

|  Board Type   |   Current on one IO  | Sum of current on all IO |
|---------------|----------------------|--------------------------|
| [[Original]]  |   25mA               |  120mA                   |
| [[Pico]]<br>[[WiFi]]  |   20mA               |  120mA                   |
| [Puck.js](/Puck.js)<br>[Pixl.js](/Pixl.js)<br>[[MDBT42Q]]   |   15mA               |  15mA ([info](https://devzone.nordicsemi.com/f/nordic-q-a/15800/gpio-sink-current-on-nrf52832))                   |


Is Espruino 100% JavaScript compatible?
---------------------------------------------------------------------------

Espruino implements a (large) subset of the full JavaScript specification, but it isn't 100% complete. We aim to make all functionality we do implement as standards-compliant as possible.

Please check out [the Espruino Features Table](/Features) for a comprehensive
list of the language features supported in Espruino.

While we implement [a lot of JavaScript's standard library](/Reference), some of the less-used parts are missing because there just isn't enough memory to include them.

**In reality, if you're writing normal JavaScript code then you're unlikely to notice any difference between Espruino and normal JavaScript.** If you do hit any problems, please post up in the [[Forum]] with a code example and we will try and fix it if it's a bug, or a feature that we think people will use.


Will Espruino work on my board?
---------------------------------------------------------------------------

If it's listed on our [[Other Boards]] page, then yes. If it isn't, and it contains a similar processor with the same amount (or more) of Flash and RAM, then give it a try - [check out GitHub](https://github.com/espruino/Espruino) for build instructions!

We have [a special section of the forum](http://forum.espruino.com/microcosms/1085/) that you can ask questions or post your progress in.

**Note:** Due to the large number of supported boards (over 50) we're now unable
to accept support for new boards into the main Espruino codebase. You can always
maintain a fork, or we can [support your board for a small monthly fee](/Business).


Can I use official Espruino Boards in my product? How long will you keep making them for?
---------------------------------------------------------------------------

Yes, we'd encourage you to use our products in your product - many of them such as [[Pico]] or the [[MDBT42Q]] are designed to be easy to embed.

Espruino has been available since 2012 and isn't going anywhere. We'll keep making and supporting **all of our boards** for the forseeable future. However if something unexpected were to happen, the Espruino software and hardware is Open Source so you'll still be able to make your own boards (other companies can start making them too) - meaning that any product using Espruino can be produced for years to come.


Can I sell boards containing the Espruino software?
---------------------------------------------------------------------------

Yes, as long as you abide by the terms of Espruino's MPLv2 licence and respect the Espruino trademark (eg. don't call your board an Espruino board unless agreed with us).
However, if you are profiting from the community's hard work then we'd apprectiate it if you could find a way to contribute something back - for instance you could [[Donate]], or [pay us to produce builds of Espruino for your device](/Business).


How much Flash memory is free after installing Espruino, and can I use it?
---------------------------------------------------------------------------

It depends on your device. Espruino uses between 100kb and 200kb of Flash, plus roughly the same amount of flash as you have RAM if you want to save programs. On smaller devices such as the Olimexino, this means that there is hardly any flash memory free, but on most modern boards you'll be fine.

On nearly all boards you can use the built-in [Flash](/Reference#Flash) or [Storage](/Reference#Storage) Libraries to not only get access to Flash memory, but to find out which areas of memory are available for use.


Espruino doesn't support some of my chip's functionality. Can I use it anyway?
---------------------------------------------------------------------------

Yes! We have added [peek32](/Reference#l__global_peek32) and [poke32](/Reference#l__global_poke32) instructions which allow you to directly access anything in the ARM's address space.

To get you started there's:

* A tutorial on [accessing the STM32F4 counters/timers directly](/STM32+Peripherals)
* [A library for accessing the peripherals on the NRF52](/NRF52LL)


Is there an editor that can be used instead of typing everything into a terminal window?
---------------------------------------------------------------------------------------

Yes. [Check here for details of your available options](/Programming)

## What are the two panes of the Web IDE for?

The left-hand side is a simple terminal. When Espruino is plugged in, you are communicating directly with it. You can write expressions, create and read variables, and even write and execute code while your program is running. When you type enter after writing an expression, it is executed immediately. If you want to clear what you wrote, or break out of a running function, press `Ctrl+C`.

The right-hand side is a JavaScript editor. It's syntax highlighted and has code completion, but what you write is only uploaded to Espruino when you click the `Send to Espruino` button. See below:


When is code executed?
---------------------------

When you write code in the right-hand pane of the Espruino IDE and click `Send to Espruino`, by default the code is sent to Espruino almost as if you copied and pasted it into the left-hand pane (this doesn't have to be the case - see [the Saving page](/Saving)).

This means that if you write `var a = analogRead(A0);`, the value of `a` will be set to the voltage on `A0` *at the time you uploaded your code*. It won't be updated again, even after a reboot.

When you type `save()`, a *copy of the current state of the interpreter* is saved into Flash memory, **not** a copy of the code that you originally uploaded.

If you want to do something when Espruino reboots, add one or more event handlers for the `init` event on `E`:

```
E.on('init', function() {
  // ...
});
```

This will then be loaded every time Espruino starts up. If you create a function called `onInit`, that will be executed too:

```
function onInit() {
 // ...
}
```

But of course there can only be one `onInit` function, so if you copy and paste two bits of code with two `onInit` functions then the second function will overwrite the first. See [the Saving page](/Saving) for more information.


Why is code executed at upload time?
-------------------------------------

The alternative to executing at upload time is to store a complete copy of the program text in memory, and to then execute that when everything has been received. The problem is that in a device with very limited amounts of memory, you need twice as much memory to upload code (sometimes more!), because you have to store the textual representation and the representation in the interpreter.

Take the following code as an example:

```
var a = new Uint8Array([128,129,130, ... , 253,254,255]);
var b = new Uint8Array([128,129,130, ... , 253,254,255]);
var c = new Uint8Array([128,129,130, ... , 253,254,255]);
```

The textual form of each array uses roughly `512` bytes. The form in the interpreter takes only `128` bytes, because it's a 128 element byte array.

By executing each line in turn, Espruino only needs `512 + 128*3` bytes maximum during upload - however if executing all at once it would need `512*3 + 128*3` bytes.

If you're uploading *direct to flash memory* rather than RAM then this is less of an issue as usually there is a lot more flash memory than RAM. Espruino supports this via `Save on Send` - check out [the Saving page](/Saving) for more information. It has some benefits, but also some drawbacks - for instance you can no longer save your changes if you use the left-hand side of the IDE to modify your program.


How do modules work?
-------------------------

Espruino contains a mix of built-in and dynamically loaded modules of code that can be used with the `require(...)` function. Built-in modules are documented in the [[Reference]], and can be used without any need for the Web IDE and an internet connection. However on some boards you may find that these modules are not included (as there may not be enough space).

Dynamically loaded modules are uploaded to Espruino by the Web IDE *on demand*. They are usually documented on the main Espruino site, under [[Modules]]. When you type something like `require("PCD8544")` and then click `Send to Espruino` in the Web IDE, the Web IDE scans your code for any `require` statements, and if it doesn't think they are built-in, it looks online (usually in http://www.espruino.com/modules/) to find the module (you can configure this from Settings). It then downloads the module and uploads it to Espruino just before your code.

If dynamically loaded modules can't be found by the Web IDE, nothing is uploaded to the Espruino. When Espruino encounters a `require` statement that isn't built in or wasn't pre-loaded by the Web IDE it tries to look on the SD card for the module in the `node_modules` directory. If it can't find anything there (or there's no SD card!) then it will fail.


Is there a Coding Style I should use?
--------------------------------------

When entering code in the left-hand side of the Web IDE (Espruino's terminal), Espruino uses a simple rule to work out whether to execute the line when you press `Enter`, or to just move the cursor to the line below: If you have as many open brackets as close brackets then the line is executed, otherwise a new line is added.

This means that the coding style given in the examples is very intentional. The following code can just be copy+pasted straight into the left-hand side of Espruino:

```
function hello() {
 // ...
}
```

Whereas the following cannot, because for the newline after `function` all open braces are still closed:

```
function hello()
{
 // ...
}
```

The Web IDE automatically replaces newline characters with `Alt-Enter` in code when it sends it to Espruino from the editor on the right-hand side (so you can write in whatever coding style you want in the right-hand editor window), however we'd still recommend that you use the same coding style as the examples in case you do want to copy+paste a single function into the left-hand side for debugging.

What is efficient and what isn't? How can I write the fastest code?
---------------------------------------------------------------------------

See our [[Performance]] Notes page.


Is there a `delay()` function in Espruino?
---------------------------------------------------------------------------

There's [setTimeout](/Reference#l__global_setTimeout) which will execute a callback
function after a certain time period, and there is also [digitalPulse](/Reference#l__global_digitalPulse)
hich can be used to send carefully timed pulses.

An actual delay function isn't implemented because it encourages you to write code
that causes problems for Espruino. As Espruino doesn't have preemptive multitasking,
other tasks cannot execute until the current task has finished.

If you make your current task take a long time to execute then it will probably
cause problems elsewhere - if serial data or pin changes can't be processed in
a sensible time period, the input buffers might overflow and data will be lost.

You can still delay your code quite easily using `var t=getTime()+1000;while(getTime()&lt;t);`,
but you should seriously consider re-writing your code to use `setTimeout`
and/or `digitalPulse` - the end result will be a much faster, more efficient piece of code.


Can I save values to Espruino - does it have an EEPROM?
--------------------------------------------------------

While there aren't any EEPROMS on Espruino boards, there is [the Storage Module](/Reference#Storage)
which provides a simple filesystem that you can use to save data. It uses flash memory,
but provides simple wear-levelling to improve the lifetime of the flash memory.


Why not just use an existing JavaScript implementation like V8 or Spidermonkey?
---------------------------------------------------------------------------

Mainly it's because of memory usage.

Modern PCs have around 1,000,000 times more RAM than microcontrollers, so even with the
most serious of diets a desktop JavaScript implementation just isn't going to fit.

Check out [Espruino Performance Notes](/Performance) to see some of the things we
have to do to make it fit.


Can I program the Espruino Boards in languages other than JavaScript?
---------------------------------------------------------------------------

Yes. Espruino boards use relatively standard ST Microelectronics or Nordic Semiconductor ARM Cortex M3/M4 chips, so any tool that will produce code for those can be used to program the boards. There are extremely good C and C++ compilers available, as well as [Lua](http://www.eluaproject.net/) and [Python](http://micropython.org/) interpreters for the Cortex M4 chip that is in the [[Pico]].

Instead of replacing the Espruino JavaScript interpreter you can also transcompile other languages to JavaScript, or can write your own extensions to it using C and C++. There's some more information on that [here](https://github.com/espruino/Espruino/blob/master/libs/README.md).


Got a question about Espruino?
---------------------------------------------------------------------------

Check out our [[Forum]].


I want to write an article on Espruino. Can I get high resolution Pictures?
---------------------------------------------------------------------------

Yes! Head to our [[Press]] page. Feel free to [[Contact Us]] if you have any other questions!


Have we not answered your question here?
---------------------------------------------------------------------------

Please try asking on the [[Forum]].
