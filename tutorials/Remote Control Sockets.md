<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Remote Control Sockets
======================

* KEYWORDS: Remote Control,RCT-08,Socket,Mains
* USES: Espruino Board,433Mhz,CC3000,Internet

![Status RCT-08 Sockets](sockets.jpg)

Introduction
-----------

You can now buy remote controlled sockets [very cheaply](http://www.ebay.co.uk/sch/i.html?_nkw=remote+control+socket). If you want to turn some mains-powered things on and off with your computer but don't want to get involved with [[Relays]] and wiring up mains then controlling these could be a great idea.

We're going to use 'Status'-branded sockets.

With these sorts of remote-controlled devices there are two ways of controlling them.

### The Easy Way

Open up the remote control and then connect wires from Espruino to each pushbutton. This way, you can simply control whatever you want by faking a button press.

### The Hard Way

Or, you can buy a radio transmitter and can then try and duplicate the remote control's functionality. This is harder, but more flexible (you could control lots of sockets), and obviously more fun!

The sockets I'm using are [433.92](/433Mhz)Mhz ones (it's written on the back). This band is an 'open' band - you don't need a license to use it, and it's a complete free for all. Every device has its own protocol, and they all transmit whenever they want. This means that there is quite a large likelihood that the signal that you send will not arrive intact so most devices send the same signal several times.

The Protocol
----------

Unless you have a storage oscilliscope, working out the protocol of your particular sockets is remarkably difficult. In order to make the tutorial a bit easier I've described it below. There's also [this post](http://www.picaxeforum.co.uk/archive/index.php/t-16509.html) on the PicAxe forum that describes it very well.

* There are 25, equally spaced bits
* A '1' is represented as 0.9ms ON, and then 0.3ms OFF
* A '0' is represented as 0.3ms ON, and then 0.9ms OFF
* The 25 bits are repeated continuously (as long as the button is pressed), with a pause between them of around 8ms.

You'll Need
----------

* An [Espruino Board](/EspruinoBoard) 
* A [[433Mhz]] Radio transmitter/receiver pair
* A [[CC3000]] module (if you want to web-enable your sockets)

Working out your code
------------------

By far the easiest way to work our your code (and if your remote control sockets use the same protocol) would be to use a digital [storage oscilloscope](/Tools#oscilloscope), but we'll try and use the Espruino here.

Wire the 433Mhz receiver up as follows:

| 433Mhz | Espruino |
|--------|----------|
| GND    | GND      |
| VCC    | 3.3      |
| DATA   | A0       |

**Note:** We're using below the suggested voltage here, because it makes the receiver less sensitive and less likely to receive signals from transmitters that are further away.

We know what the protocol is (above) so we'll try and make something to understand it...

Add the following code:

```
var t,n;

// When the signal rises, check if it was after ~5ms of delay - if so (and if we have a code) display it.
function sigOn(e) {
  var d = e.time-t;
  if (d>0.005 && n>0) {
    console.log("0b"+n.toString(2));
    n=0;
  }
  t = e.time;
}

// When the signal falls, measure the length of our pulse. 
// If it was within range, record a 1 or a 0 depending on the length. 
// If it wasn't in range, zero it
function sigOff(e) {
  var d = e.time-t;
  t = e.time;
  if (d>0.0001 && d<0.001)
    n = (n<<1) | ((d>=0.0004)?1:0);
  else
    n=0;
}

setWatch(sigOn,A0,{repeat:true,edge:"rising"});
setWatch(sigOff,A0,{repeat:true,edge:"falling"});
```

The function `sigOff` is quite hard to understand. It has been written such that the code executes relatively quickly, so it is explained in more detail (with comments) below:

```
function sigOff(e) {
  /* Here, we work out the length of the pulse and save it to 'd'.
  'e.time' is the time of the signal turning off, and 't' was
  set in 'sigOn', last time the signal turned on */
  var d = e.time-t;
  /* we update the value of 't', so we can measure the pulse length
  in 'sigOn' as well */
  t = e.time;
  // Now, we check that the pulse length is what we expect
  if (d>0.0001 && d<0.001) {
    /* Ok, the pulse length is what we expect (between 0.1 and 1 ms).
       Now, we do three things:
         * We work out if the pulse length represents a 1 ( > 0.4 ms) or a 0. 
           'd>=0.0004' returns either true or false.
         * We use a ternary operator (A ? B : C) to turn that boolean 
           value into a 1 or a 0.
         * We use 'shift' and 'or' operators to shift the bits in 'n' to the
           left by 1, and then to add in the new bit of data we got.
       This means that at the end of all the bits, 'n' will contain
       a number representing the data we received.
     */
    n = (n<<1) | ((d>=0.0004)?1:0);
  } else {
    /* if the pulse length isn't right, we got a corrupted signal, so
       just delete everything we got so far */
    n=0;
  }
}
```

Put the transmitter right next to the receiver and press one of the buttons. You should see a bunch of lines that are all the same (and a few corrupted ones!). They'll look something like:

```
0b10100000111111101110
0b10100000111111101110
0b10100000111111101110
0b10100000111111101110
0b10100000111111101110
0b10100000111111101110
0b10100000111111101110
```

This is the transmitted code (note that there are a few zeros at the front that aren't getting displayed).

Try pressing different buttons, and you should notice that the numbers at the beginning are the same, and the ones at the end change (except the final 0). It should all look something like:

| Button | Code |
|--------|------|
| ALL OFF | ...10000 |
| ON 1    | ...11110 |
| OFF 1   | ...01110 |
| ON 2    | ...10110 |
| OFF 2   | ...00110 |
| ON 3    | ...11010 |
| OFF 3   | ...01010 |
| ON 4    | ...11110 |
| OFF 4   | ...01110 |

So now we've worked out the code, we can write a transmitter...

Making the Transmitter
-------------------

Wire the 433Mhz transmitter up as follows:

| 433Mhz | Espruino |
|--------|----------|
| GND    | GND      |
| VCC    | BAT      |
| DATA   | A0       |

And now reset Espruino and put in the following code, replacing the number in CODE with any of the block of numbers that you got.

```
var TX = A0;
var CODE = 0b10100000111111101110;

function sendCommand(command) {
  var bits = (CODE & ~0b11111) | command;
  for (var i=24;i>=0;i--) {
    if ((bits>>i)&1) {
      digitalPulse(TX,1,0.9);
      digitalPulse(TX,0,0.3);
    } else {
      digitalPulse(TX,1,0.3);
      digitalPulse(TX,0,0.9);
    }
  }
  digitalPulse(TX,1,0.001);
}

function sendMultiple(command) {
  var n = 10;
  var interval = setInterval(function() {
    sendCommand(command);
    if (n-- < 0) clearInterval(interval);
  }, 50);
}

var socketOn = false;
setWatch(function() {
  socketOn = !socketOn;
  sendMultiple(socketOn ? 0b11110 : 0b01110);
}, BTN1, { repeat:true, edge:"rising", debounce:10 });
```

Now you'll find that when you press BTN1, it will turn Socket 1 either on or off!


Internet Enablement
-------------------

Next, Wire up the [[CC3000]] as described in [this link](/CC3000) and use the following code (Changing the WiFi access point and code):

```
var TX = A0;
var CODE = 0b10100000111111101110;

function sendCommand(command) {
  var bits = (CODE & ~0b11111) | command;
  for (var i=24;i>=0;i--) {
    if ((bits>>i)&1) {
      digitalPulse(TX,1,0.9);
      digitalPulse(TX,0,0.3);
    } else {
      digitalPulse(TX,1,0.3);
      digitalPulse(TX,0,0.9);
    }
  }
  digitalPulse(TX,1,0.001);
}

function sendMultiple(command) {
  print("send "+command);
  var n = 10;
  var interval = setInterval(function() {
    sendCommand(command);
    if (n-- < 0) clearInterval(interval);
  }, 50);
}

function pageHandler(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  var u = url.parse(req.url, true);
  res.write('<html><body>Socket <a href="/?s1=on">on</a> or <a href="/?s1=off">off</a></body></html>');
  if (u.query !== null) {
    if (u.query["s1"]=="on") sendMultiple(0b11110);
    if (u.query["s1"]=="off") sendMultiple(0b01110);
  }
  res.end();
}

var wlan = require("CC3000").connect();
wlan.connect( "AccessPointName", "WPA2key", function (s) { 
  if (s=="dhcp") {
    console.log("Connect to http://"+wlan.getIP().ip);
    require("http").createServer(pageHandler).listen(80);
  }
});
```

When it instructs you to connect to an IP address, type it into your web browser. You should now see a simple Webpage with `Socket on or off` written on it. Click on either to change the state of Socket 1!



