<!--- Copyright (c) 2017 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Puck.js ti GCP BigQuery
=========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Puck.js+GCP+BigQuery. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Puck.js,BLE,Bluetooth,Magnetic,GCP,Google Cloud Platform,Pub/Sub,BigQuery
* USES: Puck.js,BLE,Only BLE

This tutorial shows you how use [Puck.js](/Puck.js) and a Raspberry Pi to stream data to GCP.

The GCP Tutorial (Temperature data to GCP BigQuery Table & Data Studio Graph):
- ![window](Puck.js to GCP BigQuery/process-map.png)
- The puck.js app advertises the temperature (and other info) to the Raspberry Pi EspruinoHub MQTT broker 
- NodeRed ingests the MQTT message & cleans it up with a function
- NodeRed sends temperature data to a GCP Pub/Sub topic via node-red-contrib-google-cloud pub/sub out node with credentials
- A GCP Pub/Sub topic accepts the message & relays it to the subscribers
- A GCP Pub/sub subscription stores the data to a BigQuery Table
- A Data Studio dashboard displays the data from BigQuery

Prerequesites
--------
* A [Puck.js](/Puck.js) device (or other [Espruino board](/Order) if you don't need Bluetooth LE
* Raspberry Pi with Bluettoth/Wifi Capabilities and NodeRed & EspruinoHub installed on it
* Install [Espruino Hub](https://github.com/espruino/EspruinoHub) & [NodeRed](https://www.espruino.com/BLE+Node-RED) on the Raspberry Pi
* Set EspruinoHub & NodeRed to auto start on a reboot
* A GCP Account (This is free to set up & this project can be done in a free tier)

Raspberry Pi Setup
--------
#### Note: This tutorial assumes you have EspruinoHub & NodeRed installed on your Raspberry Pi already!

#### Edit the Raspberry Pi so EspruinoHub will ingest the MQTT messages and NodeRed will publish to the right GCP project 

* SSH into the Raspberry Pi and edit the attribute.js file in the EspruinoHub. This code will create a filterable channel on the MQTT broker.

Go into the attributes.js file 
```
cd
cd EspruinoHub/lib
nano attributes.js
```

* Edit the exports.names dictionary in the attributes.js file, adding the code between the "Add These" Comments. 
    * This adds an MQTT channel for Voltage, Light, Acceleration, Gyro, Movement, Magnetic Field info, Button Presses, LED states, NFC info and bluetooth info. The Puck will advertise info to the Raspberry Pi on these channels. Only one of these channels will be used for this project, but adding these in allows us to advertise the other sensor states in a later builds.
```
exports.names = {
  // https://www.bluetooth.com/specifications/gatt/services/
  "1801": "Generic Attribute",
  "1809": "Temperature",
  "180a": "Device Information",
  "180f": "Battery Service",
  //////////////////////////////
  // Add These /////////////////
  //////////////////////////////
  "182a": "VoltageSensor",
  "182b": "LightSensor",
  "182c": "AccelerationSensor",
  "182d": "GyroscopicSensor",
  "182e": "MovementSensor",
  "182f": "TiltDetection",
  "183a": "MagneticField",
  "183b": "MagneticFieldData",
  "183c": "ButtonPress",
  "183d": "LEDState",
  "183e": "NFCDetection",
  "183f": "NFCData",
  "184a": "BluetoothScanData",
  "184b": "BluetoothScanState",
  //////////////////////////////
  //////////////////////////////
  //////////////////////////////
  // https://github.com/atc1441/ATC_MiThermometer#advertising-format-of-the-custom-fir>
  "181a": "ATC_MiThermometer",
  "181b": "Body Composition",
  "181c": "User Data",
  "181d": "Weight Scale",
  // https://www.bluetooth.com/specifications/gatt/characteristics/
  "2a2b": "Current Time",
  "2a6d": "Pressure",
  "2a6e": "Temperature",
  "2a6f": "Humidity",
  "2af2": "Energy",
  // https://www.bluetooth.com/specifications/assigned-numbers/16-bit-uuids-for-member>
  "fe0f": "Philips",
  "fe95": "Xiaomi",
  "fe9f": "Google",
  "feaa": "Google Eddystone",

  "6e400001b5a3f393e0a9e50e24dcca9e": "nus",
  "6e400002b5a3f393e0a9e50e24dcca9e": "nus_tx",
  "6e400003b5a3f393e0a9e50e24dcca9e": "nus_rx"
};
```

* Open the NodeRed service file
```
cd
sudo systemctl edit nodered.service
```

* Add a GOOGLE_CLOUD_PROJECT name as an environment variable to the NodeRed Service file. 
    * This will allow you to publish to the GCP topic you're about to set up.
```
# Environment="GOOGLE_CLOUD_PROJECT=mygooglecloudproject-123455"
```

Flash the Code to Puck.js
--------
* What the Code Does
    * As long as the button state remains 1, every minute, your Puck.js will advertise the temperature (f), battery level, voltage, light, and LED states. It also will advertise when it senses movement, a change in magnetic field, NFC field, or a button press. For this tutorial, we'll just be using the temperature advertisements. Upload the code to the Puck.js's flash, so it'll still be there if you swap out the battery.
* Testing the Code in [Espruino Web IDE](https://www.espruino.com/ide/)
    * ![window](Puck.js to GCP BigQuery/puck-flash.png)
    * Check that the code is running by reading the console log output. Make surethat temperature data is coming across. Sometimes temperature data doesn't advertise if the temperature hasn't changed. If you want to test the temperature advertisement, warm up or cool down the puck temp sensor by transferring heat with your hand.
* Start Advertising!    
    * To get the data to stop showing up in the console & start advertising, take the battey out & put it back in. As long as the code was uploaded to the device's flash, it'll start advertising when the battery is put back in. The temperature data won't start sending over until one minute has gone by. Then it'll advertise the temp every minute.
```
var state =1;
NRF.setTxPower(4); // Full Power advertising

//Send MQTT Advertisements & Console Logs Every Minute while Button State === 1
setInterval(function () {
    setTimeout(function(){
        if(state === 1){
            // Sent: 79
            // - /ble/advertise/c3:5a:61:d8:02:05/temp
            // - "1809": "Temperature",
            // 1809 => {"temp":79}
            console.log("temperature : " + [Math.round((E.getTemperature()*9/5)+32)]);
            NRF.setAdvertising({
                0x1809 : [Math.round((E.getTemperature()*9/5)+32)]
            });
        }
    },1);

    setTimeout(function(){
        if(state === 1){
            // Sent: 100
            // - /ble/advertise/c3:5a:61:d8:02:05/battery
            // - "180f": "Battery Service",
            // 180f => {"battery":100}
            console.log("battery : " + [Puck.getBatteryPercentage()]);
            NRF.setAdvertising({
                0x180F : [Puck.getBatteryPercentage()]
            });
        }
    },5000);

    setTimeout(function(){
        if(state === 1){
            //   "182a": "VoltageSensor",
            console.log("Voltage : " + [String(Math.round(analogRead(D30)*6.6 * 100) / 100)]);
            NRF.setAdvertising({
                0x182a : [String(Math.round(analogRead(D30)*6.6 * 100) / 100)]
            });
        }
    },10000);

    setTimeout(function(){
        if(state === 1){
            console.log("Light : " + [String(Puck.light())]);
            NRF.setAdvertising({
                //   "182b": "LightSensor",
                0x182b : [String(Puck.light())]
            });
        }
    },15000);

    setTimeout(function(){
        if(state === 1){
            console.log("LEDs: " + [[digitalRead(LED1).toString(16)], [digitalRead(LED2).toString(16)], [digitalRead(LED2).toString(16)]]);
            NRF.setAdvertising({
                //   "183d": "LEDState",
                0x183d : [[digitalRead(LED1).toString(16)], [digitalRead(LED2).toString(16)], [digitalRead(LED2).toString(16)]]
            });
        }
    },20000);
},60000);

//Button Press
//Turn Off/On MQTT Advertising
var pressCount = 0;
setWatch(function() {
    pressCount++;
    state = (pressCount+1)%2;
    if ((pressCount+1)%2) digitalPulse(LED3,1,1500); //long flash blue light
    else
        digitalPulse(LED3,1,100); //short flash blue light
    console.log('button_press_count : [' + pressCount + ']');
    console.log('button_state : [' + (pressCount+1) + ']');
    console.log('state: ' + state); 
    NRF.setAdvertising({
        0xFFFF : [pressCount],
        0x183c: [((pressCount+1)%2)],
    });
}, BTN, { edge:"rising", repeat:true, debounce:50 });

//Movement Sensor
require("puckjsv2-accel-movement").on();
var idleTimeout;
Puck.on('accel',function(a) {
    digitalWrite(LED1,1); //turn on red light
  if (idleTimeout) clearTimeout(idleTimeout);
  else
    if (state === 1) {
        console.log('movement : 1');
        NRF.setAdvertising({
            0x182e: [1],
        });
    }
    idleTimeout = setTimeout(function() {
        idleTimeout = undefined;
        digitalWrite(LED1,0);//turn off red light
        if (state === 1) {
            console.log('movement : 0');
            NRF.setAdvertising({
                0x182e: [0],
            });
        }
    },500);  
});

//Magnetic Field Sensor
require("puckjsv2-mag-level").on();
Puck.on('field',function(m) {
    digitalPulse(LED2, 1, 200);//flash green light
    if (state === 1) {
        console.log('magnetic_field : [' + m.state + ']');
        NRF.setAdvertising({
            0x183a: [m.state],
        });
    }
});

//NFC Detection
NRF.nfcURL("http://espruino.com");
NRF.on('NFCon', function() {
    digitalPulse(LED2, 1, 500);//flash on green light
    console.log('nfc_field : [1]');
    NRF.setAdvertising({
        0x183e: [1],
    });
});
NRF.on('NFCoff', function() {
    digitalPulse(LED2, 1, 200);//flash on green light
    console.log('nfc_field : [0]');
    NRF.setAdvertising({
        0x183e: [0],
    });
});
```

Setting up GCP Pub/Sub & BigQuery
--------
* Go to your GCP Console
* Create a Pub/Sub Schema for to Ingest Temperature Data
    * ![window](Puck.js to GCP BigQuery/pubsub-schema.png)
```
{
  "type": "record",
  "name": "Avro",
  "fields": [
    {
      "name": "temperature_fahrenheit",
      "type": "int"
    }
  ]
}
```
* Create a Pub/Sub Topic
    * ![window](Puck.js to GCP BigQuery/pubsub-topic.png)
* Create a Dataset & Table in BigQuery
    * ![window](Puck.js to GCP BigQuery/bigquery-table.png)
* Create a Pub/Sub Subscription that writes to the BigQuery Table
    * ![window](Puck.js to GCP BigQuery/pubsub-subscription.png)

Setting up NodeRed
--------
* ![window](Puck.js to GCP BigQuery/noedred-process.png)
* Add a MQTT In Node that listens for the temperature data
    * ![window](Puck.js to GCP BigQuery/noedred-mqttin.png)
* Add a function node that processes the message payload
    * ![window](Puck.js to GCP BigQuery/noedred-tempfunction.png)
* Install "node-red-contrib-google-cloud" to your nodered palette
    * ![window](Puck.js to GCP BigQuery/install_node-red-contrib-google-cloud.png)
* Add a pub/sub out node that publishes to your GCP Pub/sub topic
    * ![window](Puck.js to GCP BigQuery/nodered-gcp-pubtopic.png)
* Edit the pub/sub out node to add GCP credentials from IAM. This will allow you to publish to that topic

BigQuery & Data Studio
--------
* Open up the table in BigQuery, Click Export & Explore in Data Studio
    * ![window](Puck.js to GCP BigQuery/big-query-to-data-studio.png)
* Explore the data set & make a line graph or timeseries graph displaying temperature over time
    * ![window](Puck.js to GCP BigQuery/data-studio-graph-from-bigquery.png)

Buying
------
[Puck.js](/Puck.js) devices can be [ordered from here](/Order#puckjs)