<!--- Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Data Collection with Espruino
=============================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Data+Collection. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Puck.js,Data,Logging,Log,Collection
* USES: Puck.js

Often you'll want to make a device that can sit in a place and will collect
(log) data. Espruino is particularly good at this as all devices have a
Real Time Clock (RTC) and don't draw much power when idle.

**Note:** There's a Bangle.js specific [example of logging here](/Bangle.js+Storage)

At its most simple, all you need to do is have some code that looks like this:

```JS
function getData() {
  var data = readMyData();
  storeMyData(data);
}

setInterval(getData, 60*1000); // every minute
```

Reading Data
-------------

Espruino devices have a built-in temperature sensor, accessible with
`E.getTemperature()` - so you can easily use this for reading values.

Puck.js also contains [various sensors](/Puck.js#on-board-peripherals)
you can read from.

However often you'll use `analogRead(pin)` to read analog values from pins,
or will `require` one of Espruino's [modules](/Modules) to interface to an
external sensor (for instance the [DS18B20 temperature sensor](/DS18B20)).


Time
----

If you're logging data at fixed time periods there may be no need to
store the time of each measurement (apart from perhaps the start time). This
will save you memory and will allow you to store more readings in memory.

However sometimes you will want a timestamp (perhaps you want to store
whenever a door opens or closes) - in this case you have no need to store
data, just the time at which an event happened.

You can get the current time in a human readable form with `(new Date()).toString()`,
or `Date.now()` will give the number of milliseconds since 1970.

The time reported is according to Espruino's Real-Time Clock. You can set it
with `setTime(secondsSince1970)`, or can turn on `Set Current Time` in the
Web IDE's Communication Settings and the time will be set automatically next time code is
uploaded. (If you're using the [Puck.js](/Web+Bluetooth#extra-features)
Web Bluetooth library you can also use `Puck.setTime()` on a Web Bluetooth website).


Data Storage
-------------

The next step is to figure out how you're going to store your data. There are
a few options here. If you want to skip this and just want something that works, see
`require("Storage").open` under **Flash memory** below.

### RAM - JavaScript variables

The simplest (but most inefficient) option is just to store data in a
JavaScript array, for instance:

```JS
var log = [];

function storeMyData(data) {
  log.push(data); // append a new item to the array
}
```

However this isn't a very efficient use of memory, and each time you log
data more memory will be used up until finally all of Espruino's memory
is used.

You can work around this by restricting the size of the array, for example:

```JS
function storeMyData(data) {
  // ensure there are less than 500 elements in the array
  while (log.length >= 500) log.shift();
  // append a new item to the array
  log.push(data);
}
```

Usually each number added to the array takes up two *variable slots* - one
for the number, and one for the array index (see the [performance section](/Performance)
for more information). You can use `process.memory().free` to see how many
variable slots you have available, so can see how long you should restrict
the array to (you need to leave a few variable slots free for exection too!).

### RAM - Typed Array

Storing as JavaScript variables is easy, but uses a lot of memory (~32 bytes
  per item). However if you know something about your input data
you can store it in a much more compact form.

For instance, if we know that each reading is a number then we can use a
fixed size 32 bit floating point buffer for it:

```JS
var log = new Float32Array(1000);
var logIndex = 0;

function storeMyData(data) {
  logIndex++;
  if (logIndex>=log.length) logIndex=0;
  log[logIndex] = data;
}
```

This will use up only 4 bytes per item instead of the previous solution's 32.

You can also use `Float64Array` (8 bytes) for very accurate numbers,
`Uint8Array/Int8Array` (1 byte) for integer numbers, or
`Uint16Array/Int16Array/Uint32Array/Int32Array`.

In the code above we rotate *around* the buffer writing data rather than
shifting elements in the array itself (because the `push` and `shift`
methods aren't available on Typed Arrays like `Float32Array`). It
means that when you come to output the data you'll need to work backwards from
`logIndex` to output data in the right order.

However if you *do* want to rotate data in the buffer itself, you can do it
efficiently using the `.set` method on the array:

```JS
function storeMyData(data) {
  // shift elements backwards - note the 4, because a Float32 is 4 bytes
  log.set(new Float32Array(log.buffer, 4 /*bytes*/));
  // add ad final element
  log[log.length-1] = data;
}
```

This is still slower than the `logIndex` method above, but it does make
outputting and graphing the data much easier.

### RAM - DataView

[`DataView`](http://www.espruino.com/Reference#DataView) is very similar to
the typed array method above, however it allows you to access the raw
data in many different forms.

For example below we store a date as 4 bytes and a temperature in
one signed byte, packing everything in as tightly as possible:

```JS
const EVENT_SIZE = 5;
/* Each event will be:
 byte 0-3 : # of seconds since 1970 (good up to 2106)
 byte 4   : temperature in C
*/
var log = new DataView(new ArrayBuffer(EVENT_SIZE*1000));
...

// To write
var o = indexToWrite*EVENT_SIZE;
log.setUint32(o+0,Date.now()/1000);
log.setInt8(o+4,E.getTemperature());

// To read
var o = indexToRead*EVENT_SIZE;
var event = {
  time : new Date(log.getUint32(o+0)*1000),
  temp : log.getInt8(o+4)
};
```

### Flash memory

So far we've only written to RAM, however some Espruino boards have
areas of flash memory that you can use to store nonvolatile data.

On Espruino 1v97 and above there is the [`Storage` module](/Reference#Storage)
which implements a simple filesystem in the area of flash memory that is also
used to save your program code. The Storage module implements wear levelling and deals
with flash page boundaries and pages for you, so is much easier to use than
accessing flash memory directly.

Espruino 2v05 and later have `require("Storage").open` which allows you
to append to a file in the storage area, as well as read back line by line.
This is what we'd recommend you use if you just want to write text (it doesn't support
writing char code 255 so can't be used for binary data):

```JS
var f = require("Storage").open("log","a");

// Write some data
setInterval(function() {
  f.write(getTime()+","+E.getTemperature()+"\n");
}, 1000);

function getData(callback) {
  var f = require("Storage").open("log","r")
  var l = f.readLine();
  while (l!==undefined) {
    callback(l);
    l = f.readLine();
  }
}
// Get data with: getData(print);
```

However, you can also use the [`Storage` module](/Reference#Storage) at a lower level,
allocating a fixed-size file (which starts of as all char code 255) and writing to it.
The example below will write text into a log file, and will alternate between `log1` and `log2` as needed:

```JS
var storage = require("Storage");
var FILESIZE = 2048;
var file = {
  name : "",
  offset : FILESIZE, // force a new file to be generated at first
};

function getOtherFilename() {
  return file.name=="log1"?"log2":"log1";
}

// Add new data to a log file or switch log files
function saveData(txt) {
  var l = txt.length;
  if (file.offset+l>FILESIZE) {
    // need a new file...
    file.name = getOtherFilename();
    // write data to file - this will overwrite the last one
    storage.write(file.name,txt,0,FILESIZE);
    file.offset = l;
  } else {
    // just append
    storage.write(file.name,txt,file.offset);
    file.offset += l;
  }
}

// Write some data
setInterval(function() {
  saveData(getTime()+","+E.getTemperature()+"\n");
}, 1000);


// Read with:
// storage.read("log1");
```

It's also possible to write binary data using this method which allows you to store data
much more compactly than text, you just have to decode it afterwards. For example in the
example above you could instead do the following:

```JS
// Write some data as binary
setInterval(function() {
  var buf = new ArrayBuffer(5); // 5 = record size
  var d = new DataView(buf);
  d.setUint32(0, Math.round(getTime()));
  d.setInt8(4, Math.round(E.getTemperature()));
  saveData(buf);
}, 1000);

// Read the data
function getData() {
  var buf = E.toArrayBuffer(storage.read("log1"));
  var d = new DataView(buf);
  for (var i=0;i<buf.length;i+=5) { // 5 = record size
    if (d.getUint32(i+0)==0xFFFFFFFF)
      break; // time is all 0xFF, it's not been written yet
    print({
      time : d.getUint32(i+0),
      temp : d.getInt8(i+4)
    });
  }
}
```

**NOTE:** You can also use [`require("Flash")`](/Reference#Flash) to write bytes straight
to flash - but this is pretty advanced and requires you to deal with pages
and page erasure.


### External Flash/EEPROM Memory

You can also wire up external memory such as Flash or [EEPROMs](/EEPROMs) -
usually via [SPI](/SPI) or [I2C](/I2C).

### SD card

For the maximum amount of storage, you can also write to [SD cards](/File+IO).

The [original Espruino board](/Original) has a micro SD card slot
pre-installed. While other Espruino boards don't have one, you can easily
wire one up to any of the boards.

For simple logging, you might choose to use a text format that you
can read on a PC like CSV:

```
function storeMyData(data) {
  var csvline = (new Date()).toString() + "," + data + "\n";
  require("fs").appendFileSync("mydata.csv", csvline);
}
```

**Note:** just like on a PC, you'll want to *eject* your SD card in software
before removing it from Espruino. To do this, use `E.unmountSD()`.

Extracting Data
---------------

Once you have all your data logged, you'll want to be able to get at it.

If you're using an SD card it's easy - you can just remove it and put it
in a PC.

For most other methods you'll want to be able to output the data down
USB (or Bluetooth if you're connected with Puck.js). You won't be able
to load everything into RAM at once, so you'll want to iterate over it
one step at a time.

Something like this would work:

```JS
function getData() {
  for (var i=0;i<log.length;i++)
    console.log(i+","+log[i]);
}
```

**Note:** When using the Typed Array example above you'll want to iterate
from `logIndex+1` forwards so that everything is kept in order.


Simple Example
--------------

For this example we'll use features that are easy to use and available in all
boards: the Temperature Sensor, and Typed Arrays.

Simply copy and paste the following code in to the right hand side of the ide,
turn on `Set Current Time` in the Web IDE Communication Settings, and click
`Upload`.

```JS
var log = new Float32Array(100); // our logged data
var logIndex = 0; // index of last logged data item
var timePeriod = 60*1000; // every minute
var lastReadingTime; // time of last reading

// Store data into RAM
function storeMyData(data) {
  logIndex++;
  if (logIndex>=log.length) logIndex=0;
  log[logIndex] = data;
}

// Get Data and store it in RAM
function getData() {
  var data = E.getTemperature();
  storeMyData(data);
  lastReadingTime = Date.now();
}

// Dump our data in a human-readable format
function getData() {
  for (var i=1;i<=log.length;i++) {
    var time = new Date(lastReadingTime - (log.length-i)*timePeriod);
    var data = log[(i+logIndex)%log.length];
    console.log(time.toString()+"\t"+data);
  }
}

// Start recording
setInterval(getData, timePeriod);
```

The Espruino board will start logging one minute after upload, and will keep
logging every minute after that. Because the `Float32Array` is 100 items long,
it'll keep only the last 100 readings. You can easily increase the length of
the array - most espruino boards will handle at least 5000 items, many will
allow more.

To get your data, simply type `getData()` in the left-hand side of the
IDE and hit enter, then copy the data out of the terminal. Because we're using
tab (`\t`) as a separator character, you can usually paste the copied data
directly into a spreadsheet like Google Sheets.

**You can also download directly to a file - click the 'Try Me' button
on the code blocks under 'Automatically recovering data'**

Further Improvements
--------------------

You may well want to store more than one data item - in which case you
could either store multiple items in the `log` array, or could have
one `log` array per type of data (eg. one for temperature, one for light).

We could also store our data more efficiently. If we only cared about
temperature to the nearest degree we could swap `Float32Array` for `Int8Array`
and store 4 times as much data (as long as the temperature was between -128 and 127
  degrees C, as that is the range of `Int8Array`).

Automatically recovering data
-----------------------------

If you're trying to interface this to an application on your computer,
you just need to open the Serial/Bluetooth connection, send the string `"\x10getData()\n"`,
and then read the data that is sent in return.

You can use the [Puck.js library](/Web+Bluetooth) or [UART.js library](/UART.js) to communicate
using Web Bluetooth or Web Serial direct from a webpage. For example:

**Click the 'Try Me' button on the code below to try it out
and read data from your Espruino device**

If you only need Web Bluetooth you can use the [Puck.js library](/Web+Bluetooth) too.

```HTML_demo_link
<html>
 <head>
 </head>
 <body>
  <script src="https://www.espruino.com/js/uart.js"></script>
  <script>
// Output debug info about received data to the console
UART.debug=3;

// Save the CSV file to disk
function saveFile(csvText, fileName) {
  var saver = document.createElement("a");
  var blob = new Blob([csvText], {type : 'text/csv'});
  var blobURL = saver.href = URL.createObjectURL(blob),
      body = document.body;
  saver.download = fileName;
  body.appendChild(saver);
  saver.dispatchEvent(new MouseEvent("click"));
  body.removeChild(saver);
  URL.revokeObjectURL(blobURL);
}

// Actually get the data from Espruino
function getData() {
  UART.write('\x03\x10getData()\n', function(data) {
    console.log("Received",JSON.stringify(data));
    // If getData uses console.log rather than Bluetooth.println,
    // it'll cause a prompt to be written at the end of the output
    // we detect that here are remove it.
    if (data.endsWith(">")) data = data.slice(0,-1);
    saveFile(data,"info.csv");
  });
}
  </script>
  <button onclick="getData()">Download Data</button>
 </body>
</html>
```

The code above handles the simplest case - however to keep code
reliable the `uart.js` and `puck.js` libraries will time out
after 30s of downloads. If your download will take longer than
that then you'll need to manually handle each line of data as
it comes in - for instance:

```
function onLine(data) {
  // CSV data is received here
}

var connection;
button.addEventListener("click", function() {
  if (connection) {
    connection.close();
    connection = undefined;
  }
  Puck.connect(function(c) {
    if (!c) {
      alert("Couldn't connect!");
      return;
    }
    connection = c;
    // Handle the data we get back, and call 'onLine'
    // whenever we get a line
    var buf = "";
    connection.on("data", function(d) {
      buf += d;
      var i = buf.indexOf("\n");
      while (i>=0) {
        onLine(buf.substr(0,i));
        buf = buf.substr(i+1);
        i = buf.indexOf("\n");
      }
    });
    // Request data from Puck.js
    connection.write("\x10getData()\n");
  });
});
```

**Want to do this automatically as soon as the devices are ready or in range?** Check out the [Automatic Data Download](/Auto+Data+Download) page.