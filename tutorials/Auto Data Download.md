<!--- Copyright (c) 2023 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Automatic Data Download
========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Auto+Data+Download. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Reset,Button,Load,Timeout,Reload,Reboot,Long press
* USES: BLE,Only BLE

If you've deployed sensors with Bluetooth Espruino boards (see [Data Collection](/Data+Collection)), you might like a way to retrieve data from those devices automatically.

There are a few ways of doing this, but the one we'd recommend is as follows:

* An application running on a PC that scans for Bluetooth advertisements (we'll use Node.js and Noble in the example here)
* Espruino devices that advertise when they have ready to send over Bluetooth

The PC app will then connect to any devices it sees that have data ready, and will download the data. When that's done the devices will then advertise that they don't have any more data.

We'll use the Bluetooth UART connection here - while it's possible to have your own characteristics, the UART connection provides buffering and potentially slightly higher data throughput than you might get from a custom characteristic.

For this example we'll just log the temperature, but it's pretty easy to modify this to store whatever information you are interested in.

Espruino code
-------------

Here we're using a slightly modified version of the [Data Collection flash memory example](/Data+Collection#flash-memory) example.

Temperature (and a timestamp) is stored once a second in one of two binary files. When the first file is full, writing swaps to the second file and the Bluetooth advertising is updated.

We're using Espruino's Manufacturer Data ID (0x0590) and a single byte which is 1 to show when there is one whole file of data ready, and 0 when there is no data file ready, but this could be extended to show when *any* data is ready, not just a complete file.

```JS
var storage = require("Storage");
var FILESIZE = 2048; // Note: set this according to the amount of free storage available
var file = {
  name : "",
  offset : FILESIZE, // force a new file to be generated at first
};

function getOtherFilename() {
  return file.name=="log1"?"log2":"log1";
}

// Set up bluetooth advertising to show if we have a sample or not
function updateAdvertising() {
  var samplesAvailable = 0;
  if (storage.read(getOtherFilename())!==undefined)
    samplesAvailable = 1;
  NRF.setAdvertising({},{
    manufacturer:0x0590,
    manufacturerData:[samplesAvailable]
  });
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
    // now we have a new file, update advertising - it should show it has data now
    updateAdvertising();
  } else {
    // just append
    storage.write(file.name,txt,file.offset);
    file.offset += l;
  }
}

// Write some data
setInterval(function() {
  var buf = new ArrayBuffer(5); // 5 = record size
  var d = new DataView(buf);
  d.setUint32(0, Math.round(getTime()));
  d.setInt8(4, Math.round(E.getTemperature()));
  saveData(buf);
}, 1000);

// Read the data
function getData() {
  var buf = E.toArrayBuffer(storage.read(getOtherFilename()));
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

// Remove the last file of data that was written
function removeLastFile() {
  storage.erase(getOtherFilename());
  updateAdvertising();
}

// Now update advertising - we may still have data
updateAdvertising()
```

PC Code
-------

We're going to use the Node.js code from https://www.espruino.com/Interfacing#node-js-javascript as a base for this. Please check the notes there about installing the correct version of `noble`.

This code will scan for bluetooth devices that advertise Espruino's 0x0590 bluetooth ID, and if the data associated with that is nonzero then they will be connected to, and the data downloaded to a file called `Device_[macaddresss].txt`


```JS
/* Downloads data from Bluetooth devices advertising Espruino's 0x0590 bluetooth ID */
var noble = require('@abandonware/noble');

// information used when connecting
var btDevice;
var txCharacteristic;
var rxCharacteristic;

// Code to handle scanning
noble.on('stateChange', function(state) {
 console.log("Noble: stateChange -> "+state);
  if (state=="poweredOn")
    noble.startScanning([], true);
});


noble.on('discover', function(dev) {
  if (btDevice!=undefined) return;
  if (!dev.advertisement) return; // no advertisement info
  if (!dev.advertisement.manufacturerData) return; // no manufacturerData
  var mData = dev.advertisement.manufacturerData.toString("binary");
  if (!mData.startsWith("\x90\x05")) return; // not Espruino's 0x0590 manufacturer data
  mData = mData.substr(2); // strip off the 0x0590
  var deviceName = dev.advertisement.localName || dev.address;
  console.log("Found device: ",deviceName, "data:", JSON.stringify(mData)); // strip off the 0x0590, mData);
  if (mData=="" || mData=="\0") {
    console.log("Device doesn't have data - ignoring");
    return;
  }
  noble.stopScanning();
  // noble doesn't stop right after stopScanning is called,
  // so we have to check btDevice to ensure we only connect once

  // Now connect!
  console.log("Connecting...");
  var receivedData = "";
  connect(dev, function() {
    // Connected!
    write("\x10getData();print('==END==')\n", function() {
      console.log("Receiving...");
    });
  }, function() {
    noble.startScanning([], true);
  }, function(data) {
    receivedData += data;
    if (receivedData.includes("==END==")) {
      console.log("Saving...");
      saveDeviceData(dev.address, receivedData.replace("==END==","").trim());
      console.log("Wipe and disconnect...");
      write("\x10removeLastFile()\n", function() {
        btDevice.disconnect();
      });
    }
  });
});

// connect to a device
function connect(dev, callback, disconnectCallback, dataCallback) {
  btDevice = dev;
  console.log("BT> Connecting");
  btDevice.removeAllListeners('disconnect'); // remove any listeners from previous attempts
  btDevice.on('disconnect', function() {
    console.log("Disconnected");
    btDevice = undefined;
    if (disconnectCallback)
      setTimeout(disconnectCallback, 1000);
  });
  btDevice.connect(function (error) {
    if (error) {
      console.log("BT> ERROR Connecting",error);
      btDevice = undefined;
      return;
    }
    console.log("BT> Connected");
    btDevice.discoverAllServicesAndCharacteristics(function(error, services, characteristics) {
      function findByUUID(list, uuid) {
        for (var i=0;i<list.length;i++)
          if (list[i].uuid==uuid) return list[i];
        return undefined;
      }

      var btUARTService = findByUUID(services, "6e400001b5a3f393e0a9e50e24dcca9e");
      txCharacteristic = findByUUID(characteristics, "6e400002b5a3f393e0a9e50e24dcca9e");
      rxCharacteristic = findByUUID(characteristics, "6e400003b5a3f393e0a9e50e24dcca9e");
      if (error || !btUARTService || !txCharacteristic || !rxCharacteristic) {
        console.log("BT> ERROR getting services/characteristics");
        console.log("Service "+btUARTService);
        console.log("TX "+txCharacteristic);
        console.log("RX "+rxCharacteristic);
        btDevice.disconnect();
        txCharacteristic = undefined;
        rxCharacteristic = undefined;
        btDevice = undefined;
        return openCallback();
      }
      rxCharacteristic.removeAllListeners('data'); // remove any listeners from previous attempts
      rxCharacteristic.on('data', function (data) {
        var s = "";
        for (var i=0;i<data.length;i++) s+=String.fromCharCode(data[i]);
        console.log("Received", JSON.stringify(s));
        dataCallback(s);
      });
      rxCharacteristic.subscribe(function() {
        // we're finished
        callback();
      });
    });
  });
};

// write to the connected device
function write(data, callback) {
  if (!btDevice) throw new Error("Not connected");
  function writeAgain() {
    if (!data.length) return callback();
    var d = data.substr(0,20);
    data = data.substr(20);
    var buf = Buffer.alloc(d.length);
    for (var i = 0; i < buf.length; i++)
      buf.writeUInt8(d.charCodeAt(i), i);
    console.log("BT> Write "+JSON.stringify(buf.toString("binary")));
    txCharacteristic.write(buf, false, writeAgain);
  }
  writeAgain();
}

// Write the data to a file...
function saveDeviceData(deviceAddress, data) {
  require("fs").writeFileSync("Device_"+deviceAddress.replace(/:/g,"").replace(/ \.\\\//g,"")+".txt", data);
}
```

Improvements
------------

There are a few improvements that could be made to this system:

* We connect to the first found device, but if the advertised data was a value (not just 0/1) we could download from the device with the most data first
* Data is transferred from the device as text, but it could be sent as binary to speed up the transfer
* While transferring data, the Espruino device will be busy and may not record a sample (`setInterval` could be used to transfer sample by sample and so not block other tasks from executing)
* The downloading application could store files with a timestamp (right now it will overwrite the last file it received from the device)
