<!--- Copyright (c) 2022 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bookmarklets with Web Bluetooth
===============================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Bookmarklet. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Bangle.js,Web Bluetooth,Bookmarklet,Bookmarklets
* USES: Bangle.js,Bangle.js2,BLE,Puck.js,Web Bluetooth

If you want to control Espruino from a website you're making there's already a tutorial at http://www.espruino.com/Web+Bluetooth

However you may already have a website you're interested in controlling a device from, **maybe one that isn't even your own**.

Here we're going to write a bookmarklet to pull out some data we're interested in from a website, and to then send it via Web Bluetooth to an external device.

While this isn't suitable for production, it's a great way to prototype things - or perhaps you just want to use an old Android phone to show build status in a more tangible way.

## What you need

* Chrome/Chromium web browser
* An HTTPS website (so Web Bluetooth can work)
* A Bluetooth Espruino device, like [Bangle.js](/Bangle.js2)

## Let's get some data

First, let's have a go at getting some data from a website. The general idea is you find a website that automatically updates itself, and then query the DOM every so often to scrape the relevant data.

The general process is:

* Go to your website (it needs to be served with HTTPS so we can use Web Bluetooth)
* Find the item you're interested in and click `inspect`
* Check for useful looking classes or IDs in the element (or parent/child elements) that might flag the element as what you want
* Try various `document.querySelector("...")` calls in the dev console until you can extract the data you need
* Call this in `setInterval` and check for any changes, then use those to send updates to the device

I'll give three examples:

### YouTube

While we can get the view count direct off YouTube using this method, YouTube doesn't update it very often so we'll use a third party site.

This is a simple one, but it's not ideal as the view count doesn't auto-update very often. Let's try and get the view count:

* Go to https://livecounts.io/youtube-live-view-counter and enter our video URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
* You should get this website: https://livecounts.io/youtube-live-view-counter/dQw4w9WgXcQ
* Right-click on the view counter and click `inspect`
* The devtools should pop up and you'll see something like `<span class="odometer-digit">...`, And outside that you'll see `<div class="odometer...`

So all we need to do now is check the text inside the odometer - let's try and get the value programmatically:

* In the Devtools, go to the `Console`
* Type `document.querySelector(".odometer")` and you should see the element got selected and written to the console
* Now try `document.querySelector(".odometer").innerText` and you should get something like `'1\n,\n2\n8\n5\n,\n5\n6\n1\n,\n5\n3\n8'`
* Now, we'll just filter out anything that's not numeric: `document.querySelector(".odometer").innerText.replace(/[^0-9]/g,"")` and we get a number like `1285563306`

When the view count changes, the number does a quick animation, and during that period it's hard to extract the correct number. So in this case we
can check for the `odometer-animating` class and ignore if it is set with `document.querySelector(".odometer").classList.contains("odometer-animating")`

```JS
var lastViewCount;

function changed(value) {
  console.log("Changed!", value);
}

function poll() {
  if (document.querySelector(".odometer").classList.contains("odometer-animating")) return;
  var count = document.querySelector(".odometer").innerText.replace(/[^0-9]/g,"");
  if (!lastViewCount || count!=lastViewCount) {
    lastViewCount = count;
    changed(count);
  }    
}
```

If you run `poll()` now, it'll write any change since the last time `poll` was called into the console.

### Slack

The obvious thing to so with Slack is to get notified whenever there is a new message... Sure, you could use their API - or... you could get the data direct from the Slack website.

Every so often (when we call `poll`), we'll just check if there are any new blocks of class `c-message__message_blocks`...

* Go to https://slack.com/
* Sign in and go to a slack
* When asked to open the URL, decline, and click the `Use the web version ` link
* Now Open Chrome Devtools and paste the following into the console:

```JS
var knownMessages = [];

function changed(value) {
  console.log("Changed!", value);
}

function poll() {
  var m = document.querySelectorAll(".c-message__message_blocks");
  for (var i=0;i<m.length;i++) {
    if (knownMessages.includes(m[i])) continue;
    knownMessages.push(m[i]);
    var msg = m[i].innerText.trim();
    changed(msg);
  }
}
```

If you run `poll()` now, it'll write any new messages since the last time `poll` was called into the console.

**Note:** For simplicity, this will store all messages that are received in `knownMessages` - so over a (long) time the webpage will use up memory and eventually crash.

### GitHub Actions

You can also check GitHub actions for the current status of the latest action.

* Go to https://github.com/espruino/Espruino/actions/workflows/build.yml
* In Chrome's Devtools you can now enter `document.querySelector(".d-table .checks-list-item-icon svg").attributes['aria-label'].value`
  * The value will be `'completed successfully'`, `'failed'`, `'queued'` or `'currently running'`

By running this in a `poll()` function that we call every so often, we can detect when this changes and push the data to the Bangle.

```JS
var lastState;

function changed(value) {
  console.log("Changed!", value);
}

function poll() {
  var state = document.querySelector(".d-table .checks-list-item-icon svg").attributes['aria-label'].value;
  if (!lastState || state!=lastState) {
    lastState = state;
    changed(state);
  }    
}
```

If you run `poll()` now, it'll write any state changes since the last time `poll` was called into the console.


## Sending our data to a Bangle

Normally, we'd just use a helper library like the [Puck.js library](http://www.espruino.com/Web+Bluetooth) to write data by Bluetooth,
but because we're in a bookmarklet and we can't easily add external code, we're going to have to go direct to the Web Bluetooth API.

Luckily it's not *that* bad! Paste this into the dev console of the page you were interested in getting information from:

```JS
var bluetoothDevice, bluetoothServer, bluetoothService, bluetoothTX;
function bluetoothConnect(finishedCb) {
  /*  First, put up a window to choose our device */
  navigator.bluetooth.requestDevice({ filters: [{services: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"]},{namePrefix: "Bangle.js"}]}).then(device => {
    /*  Now connect to it */
    console.log('Connecting to GATT Server...');
    bluetoothDevice = device;
    return device.gatt.connect();
  }).then(function(server) {
    /*  now get the 'UART' bluetooth service, so we can read and write! */
    console.log("Connected");    
    bluetoothServer = server;
    return server.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
  }).then(function(service) {
    /*  get the transmit service */
    bluetoothService = service;
    return bluetoothService.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e");
  }).then(function(char) {
    bluetoothTX = char;
    /*  get the receive service (for debugging!) */
    return bluetoothService.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e");
  }).then(function(bluetoothRX) {
    /*  respond to changes in the characteristic and write them to the console */
    bluetoothRX.addEventListener('characteristicvaluechanged', function(event) {
      var ua = new Uint8Array(event.target.value.buffer);
      var str = "";
      ua.forEach(v => str += String.fromCharCode(v));
      console.log("BT> "+JSON.stringify(str));
    });
    return bluetoothRX.startNotifications();
  }).then(function() {    
    console.log("Completed!");
    if (finishedCb) finishedCb();
    setInterval(poll,1000);
  });
}

function bluetoothWrite(str) {
  /*  FIXME - does not split what it written based on MTU! */
  if (!bluetoothTX) return;
  var next;
  if (str.length>20) {
    next = str.substr(20);
    str = str.substr(0,20);
  }
  var u = new Uint8Array(str.length);
  for (var i=0;i<str.length;i++)
    u[i] = str.charCodeAt(i);
  console.log("Writing ",JSON.stringify(str));
  bluetoothTX.writeValue(u.buffer).then(function() {
    if (next) bluetoothWrite(next);
    else console.log("Written!");
  });
}
```

Now, you can run `bluetoothConnect()` - normally you can only call this from
a user input on the webpage (because of security for `navigator.bluetooth.requestDevice`)
but there's an exception for when code is run from the dev console.

Choose your Bangle.js from the list (the 4 digits after `Bangle.js` should correspond to the 4
digits in the top right of the screen). If all has gone well, this should show on the console:

```
Connecting to GATT Server...
Connected
Completed!
```

* Now, you can type:

```JS
bluetoothWrite("E.showMessage('Boom')\n")
```

And the message `Boom` should be shown on your Bangle's screen!

This works because you're injecting the string of text into Bangle.js's REPL.
The text is interpreted and executed as a line of JavaScript just as if you
typed it in the left-hand side of the Web IDE.

**If you have a device like a Puck.js that doesn't have an LCD, you can use code like
`bluetoothWrite("LED.toggle()\n")` or similar**

**Note:** This has run the code in the current app, so if the clock was running, at some point
the screen will redraw with the updated time.

To fix this, we can either reset the Bangle first (by sending `reset()` and waiting for 500ms)
or could even load an app that we created earlier by sending `load("myapp.app.js")`.

Since we're now connected (and we have our `poll` function from before), let's just hack something up quickly.

* Run `bluetoothWrite("reset()\n")` - this'll reset the Bangle to a blank state

Now we'll update the `changed` function to send an update to the Bangle...

* Paste this into the dev console:

```JS
function changed(value) {
  console.log("Changed!", value);
  bluetoothWrite(`E.showMessage(${JSON.stringify(value)})\n`);
}
```

* Now type `poll()`

If the value has changed, `poll()` should call `changed(...)` which will
then show a message on the Bangle!

The next step is to automate it...

* Just add `setInterval(poll, 1000)` and the website will be checked for
updates every second.


## Creating the Bookmarklet

Rather than sending the full code we want to execute to the Bangle, a neater
option is to send an event on a global object (`E` is handily short). Then, if our
app is running we can handle it, otherwise it is ignored.

We could send `E.emit('myapp', 123)`, which will then call any event handlers
which were previously added with `E.on('myapp', ...)`.

So to do that all we need is a slightly modified `changed` function - which
can be pasted into the console.

```JS
function changed(value) {
  console.log("Changed!", value);
  bluetoothWrite(`E.emit('myapp',${JSON.stringify(value)})\n`);
}
```

When this is done, the Bangle will stop updating - we need to make an app
to display the data.

But first, we'll create the bookmarklet. Open a text editor and paste in the code below,
then enter your `poll` function where the comment is.

```JS
javascript:(function(){

  /* =================================================
   'poll' code in here!
   it gets called automatically later on...
    ================================================= */

  /*  Bluetooth Handling   */
  var bluetoothDevice, bluetoothServer, bluetoothService, bluetoothTX;
  function bluetoothConnect(finishedCb) {
    /*  First, put up a window to choose our device */
    navigator.bluetooth.requestDevice({ filters: [{services: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"]},{namePrefix: "Bangle.js"}]}).then(device => {
      /*  Now connect to it */
      console.log('Connecting to GATT Server...');
      bluetoothDevice = device;
      return device.gatt.connect();
    }).then(function(server) {
      /*  now get the 'UART' bluetooth service, so we can read and write! */
      console.log("Connected");    
      bluetoothServer = server;
      return server.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
    }).then(function(service) {
      /*  get the transmit service */
      bluetoothService = service;
      return bluetoothService.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e");
    }).then(function(char) {
      bluetoothTX = char;
      /*  get the receive service (for debugging!) */
      return bluetoothService.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e");
    }).then(function(bluetoothRX) {
      /*  respond to changes in the characteristic and write them to the console */
      bluetoothRX.addEventListener('characteristicvaluechanged', function(event) {
        var ua = new Uint8Array(event.target.value.buffer);
        var str = "";
        ua.forEach(v => str += String.fromCharCode(v));
        console.log("BT> "+JSON.stringify(str));
      });
      return bluetoothRX.startNotifications();
    }).then(function() {    
      console.log("Completed!");
      if (finishedCb) finishedCb();
      setInterval(poll,1000);
    });
  }

  function bluetoothWrite(str) {
    /*  FIXME - does not split what it written based on MTU! */
    if (!bluetoothTX) return;
    var next;
    if (str.length>20) {
      next = str.substr(20);
      str = str.substr(0,20);
    }
    var u = new Uint8Array(str.length);
    for (var i=0;i<str.length;i++)
      u[i] = str.charCodeAt(i);
    console.log("Writing ",JSON.stringify(str));
    bluetoothTX.writeValue(u.buffer).then(function() {
      if (next) bluetoothWrite(next);
      else console.log("Written!");
    });
  }
  /*  Send to Espruino */
  function changed(value) {
    console.log("Changed!", value);
    bluetoothWrite(`E.emit('myapp',${JSON.stringify(value)})\n`);
  }

  /*  Initialise - we need something to click to start the Bluetooth connection */
  var modal=document.createElement("div");modal.style="position:absolute;top:0px;left:0px;width:100%;height:100%;background:rgba(0,0,0,0.8);color:white;zIndex:10000;text-align:center";document.body.append(modal);
  modal.onclick = function() {
    document.body.removeChild(modal);
    bluetoothConnect();
  };
})();
```

**NOTE: You can't use `//` comments in your code** unless you're planning to minify
before making it a bookmarklet. Chrome removes newlines in the code you paste in,
so a single `//` would cover the whole remainder of the code.

In the case of the YouTube bookmarklet it might look like this:

```JS
javascript:(function(){
/*  read from livecounts.io */
var lastViewCount;

function poll() {
  if (document.querySelector(".odometer").classList.contains("odometer-animating")) return;
  var count = document.querySelector(".odometer").innerText.replace(/[^0-9]/g,"");
  if (!lastViewCount || count!=lastViewCount) {
    lastViewCount = count;
    changed(count);
  }    
}
/*  Bluetooth Handling   */
var bluetoothDevice, bluetoothServer, bluetoothService, bluetoothTX;
function bluetoothConnect() {
  /*  First, put up a window to choose our device */
  navigator.bluetooth.requestDevice({ filters: [{services: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"]},{namePrefix: "Bangle.js"}]}).then(device => {
    /*  Now connect to it */
    console.log('Connecting to GATT Server...');
    bluetoothDevice = device;
    return device.gatt.connect();
  }).then(function(server) {
    /*  now get the 'UART' bluetooth service, so we can read and write! */
    console.log("Connected");    
    bluetoothServer = server;
    return server.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
  }).then(function(service) {
    /*  get the transmit service */
    bluetoothService = service;
    return bluetoothService.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e");
  }).then(function(char) {
    bluetoothTX = char;
    /*  get the receive service (for debugging!) */
    return bluetoothService.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e");
  }).then(function(bluetoothRX) {
    /*  respond to changes in the characteristic and write them to the console */
    bluetoothRX.addEventListener('characteristicvaluechanged', function(event) {
      var ua = new Uint8Array(event.target.value.buffer);
      var str = "";
      ua.forEach(v => str += String.fromCharCode(v));
      console.log("BT> "+JSON.stringify(str));
    });
    return bluetoothRX.startNotifications();
  }).then(function() {    
    console.log("Completed!");
    if (finishedCb) finishedCb();
    setInterval(poll,1000);
  });
}

function bluetoothWrite(str) {
  /*  FIXME - does not split what it written based on MTU! */
  if (!bluetoothTX) return;
  var next;
  if (str.length>20) {
    next = str.substr(20);
    str = str.substr(0,20);
  }
  var u = new Uint8Array(str.length);
  for (var i=0;i<str.length;i++)
    u[i] = str.charCodeAt(i);
  console.log("Writing ",JSON.stringify(str));
  bluetoothTX.writeValue(u.buffer).then(function() {
    if (next) bluetoothWrite(next);
    else console.log("Written!");
  });
}
/*  Send to Espruino */
function changed(value) {
  console.log("Changed!", value);
  bluetoothWrite(`E.emit('myapp',${JSON.stringify(value)})\n`);
}
/*  Initialise - we need something to click to start the Bluetooth connection */
var modal=document.createElement("div");modal.style="position:absolute;top:0px;left:0px;width:100%;height:100%;background:rgba(0,0,0,0.8);color:white;zIndex:10000;text-align:center";document.body.append(modal);
modal.onclick = function() {
  document.body.removeChild(modal);
  bluetoothConnect();
};
})();
```

Now, in Chrome:

* Go to `Bookmarks -> Bookmark Manager`
* Select `Bookmarks bar` on the left.
* Click the `Organize` link (top right), then `Add new bookmark`
* Set the name as `Bangle.js Bookmarklet`
* Copy the code from the text editor and patse it in under `URL`
* Click `Save`

## The App

Now we're sending the `myapp` event on `E`, we need something to handle it
on the Bangle.

* Open the Web IDE at https://www.espruino.com/ide/
* You may need to close any of the tabs you have open where you were experimenting
so that they're not also trying to connect via Web Bluetooth
* Now connect to your Bangle (top right)
* Ensure `Upload` is set to `RAM` in the middle of the IDE's window
* Copy the following into the editor on the right and modify as you see fit:

```
var value = "---";

function draw() {
  var R = Bangle.appRect;
  g.reset().clearRect(R);
  g.setFont("Vector",26).setFontAlign(0,0);
  g.drawString(value, R.x + R.w/2, R.y + R.h/2);
  g.setFont("12x20").drawString("View Count", R.x + R.w/2, R.y + R.h/2 - 30);
}

Bangle.loadWidgets();
Bangle.drawWidgets();
draw();

E.on('myapp', function(v) {
  value = v;
  draw();
});
```

* Now click `Upload`

Your Bangle's screen should look a bit like this now:

![](data:image/bmp;base64,Qk3KPAAAAAAAAEoAAAAMAAAAsACwAAEABAAAAAD/AAAA/wD//wAAAP//AP8A//////8AAAD/AAAA/wD//wAAAP//AP8A//////93d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3AAAAAHdwAAAAB3cAAAAAd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dwAAAAB3cAAAAAd3AAAAAHd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3cAAAAAd3AAAAAHdwAAAAB3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3AHd3cAAAB3cAAAAHdwAAAAB3d3d3dwAAAHd3cAAAB3d3AAAAAHAHd3dwB3d3AAAHd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dwB3d3dwB3dwB3d3AHAHcAdwB3d3d3AHd3AHdwB3dwB3cAd3dwBwB3d3cAd3cAd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3AAB3d3cAd3AHd3d3dwB3AHcAd3d3cAd3d3AHAHd3dwBwB3d3cAcAd3d3AHd3AHd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dwAAd3d3AHdwB3d3d3cAdwB3AHd3d3AHd3dwBwB3d3cAcAd3d3AHAHd3dwB3dwB3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3AHcAd3dwB3cAd3d3d3AHcAdwB3d3dwB3d3d3cAd3d3AHAHd3dwBwB3d3cAd3cAd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dwB3AHd3cAd3AAAAAABwB3AHcAd3d3cAd3d3d3AHd3dwBwB3d3cAcAd3d3AHd3AHd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3cAdwB3d3AHdwB3d3cAcAdwB3AHd3d3AHd3d3dwB3d3cAcAd3d3AHAHd3dwB3dwB3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dwB3dwB3dwB3cAd3d3AHAHd3dwB3d3dwB3d3d3cAd3d3AHAHd3dwBwB3d3cAd3cAd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3cAd3cAd3cAd3AHd3dwBwB3d3cAd3d3cAd3d3d3AHd3dwBwB3d3cAcAd3d3AHd3AHd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3AHd3AHd3AHd3AHd3AHcAd3d3AHd3d3AHd3d3d3AHd3AHcAd3d3AHAHd3cAd3dwB3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dwB3dwB3AAB3d3AAAAd3AHd3dwB3d3dwB3d3d3d3AAAAd3AHd3dwBwAAAAB3cAAAAAd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3AHd3dwB3d3d3d3d3d3d3d3d3d3d3d3cAd3d3AHd3d3d3d3d3d3d3d3d3d3d3d3AHd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dwB3d3cAd3AHd3d3d3d3d3d3d3d3d3d3AHd3dwB3d3d3d3d3d3d3d3d3d3d3d3dwB3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3cAd3d3AHdwB3d3d3d3d3d3d3d3d3d3d3AHd3AHd3d3d3d3d3d3d3d3d3d3d3d3cAd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3AHd3dwB3cAd3d3d3d3d3d3d3d3d3d3d3AAAAd3d3d3d3d3d3d3d3d3d3d3d3d3AHd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dwAAAAAAB3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3EXd3d3cAAAAAAAd3d3d3d3d3cAAAB3d3d3dwAAAHd3dwAAAHd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3F3d3ERF3d3d3dxEXd3d3ACIiIiAHd3d3d3d3d3AAAAd3d3d3cAAAB3d3cAAAB3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dxd3cXdxd3d3d3cXEXd3dwAiIiIgB3d3d3dwB3AHd3dwB3d3d3d3d3AHd3d3d3AHd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3cXd3cREXd3d3d3F3EXd3cAIiIiIAd3d3d3cAdwB3d3cAd3d3d3d3dwB3d3d3dwB3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3F3d3d3F3d3d3dxd3EXd3ACIiIiAHd3d3d3AHcAd3d3AHd3d3d3d3cAd3d3d3cAd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3cREXdxEXd3dxF3cXdxF3dwAiIiIgB3d3d3dwB3AHd3dwB3d3d3d3d3AHd3d3d3AHd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3cXd3d3d3d3dxF3F3EXd3cAIiIiIAd3d3d3cAdwB3d3cAdwB3d3d3dwB3d3d3dwB3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3cRF3d3d3d3dxFxcRd3d3ACIiIiAHd3d3d3AHcAd3d3AHcAd3d3d3cAd3d3d3cAd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dxERF3d3dwAiIiIgB3d3d3d3d3dwAAAHd3d3d3AAAAd3d3AAAAd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dxEXd3d3cAIiIiIAd3d3d3d3d3cAAAB3d3d3dwAAAHd3dwAAAHd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3cRF3d3d3ACIiIiAHd3d3d3AHcAd3d3d3cAdwB3d3d3d3d3d3cAd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dxEXdxEXd3d3dxERF3d3dwAiIiIgB3d3d3dwB3AHd3d3d3AHcAd3d3d3d3d3d3AHd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3F3cXF3cXd3d3EXFxF3d3cAIiIiIAd3d3d3cAdwB3d3d3d3d3AHd3d3d3d3d3dwB3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3Fxd3F3d3cRdxdxF3d3ACIiIiAHd3d3d3AHcAd3d3d3d3dwB3d3d3d3d3d3cAd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3cREXdxEXd3dxF3cXdxF3dwAiIiIgB3d3d3dwB3AHd3d3d3d3cAd3d3d3d3d3d3AHd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3F3d3F3cXd3d3d3F3cRd3cAIiIiIAd3d3d3cAdwB3d3d3d3d3AHd3d3d3d3d3dwB3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dxERF3ERd3d3d3dxdxF3d3ACIiIiAHd3d3d3d3d3AAAAd3d3d3cAAAB3d3cAAAB3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3cXEXd3dwAiIiIgB3d3d3d3d3dwAAAHd3d3d3AAAAd3d3AAAAd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3ERd3d3cAAAAAAAd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dxF3d3d3AAAAAAAHd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dwAAB3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dw==)

You can now test it my manually sending an event - paste the following on the
left hand side and the app should update:

```JS
E.emit('myapp', "12345")
```

You could now save this as an app using [the instructions from the first tutorial](app.md#saving-as-an-app) but as
it's saved in RAM, as long as we don't change back to the clock screen (long pressing the button) then
you're fine.

## Trying it out

Now you can disconnect the Web IDE (on some platforms like Linux it's fine to leave it connected
and then you can use it for debugging).

* Go to the website you wanted to grab data from, like https://livecounts.io/youtube-live-view-counter/dQw4w9WgXcQ
* Ensure the 'bookmarks bar' is showing (`Bookmarks -> Show Bookmark bar`)
* Now click on the `Bangle.js Bookmarklet` you added
* The webpage should go dark (if it doesn't you may want to check DevTools)
* Click on the page and a Web Bluetooth prompt should pop up - select your Bangle.js

And now your Bangle will show updated information direct from the webpage!

**Note:** to run your bookmarklet on Android, you need to type the
bookmarklet's name into Chrome's address bar and run it from there, rather
than running it from the Bookmarks page.


## Next steps?

* We've used [Bangle.js](/Bangle.js2) here because it's easy to use, but now you can
escape from the browser you can control all kinds of different things.
* You can push information to a website as well as pulling from it. You can use
the same mechanisms to push information into a website -
for example sensor data from [Bangle.js](/Bangle.js2)/[Puck.js](/Puck.js)/etc or even use the Web Bluetooth
Advertising API to grab data from multiple sensors.
