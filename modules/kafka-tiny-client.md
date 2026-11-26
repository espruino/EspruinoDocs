<!--- Copyright (c) 2019 Pavel Kutakov. See the file LICENSE for copying permission. -->
Tiny Kafka Client
=====================
* KEYWORDS: Module,Kafka,Client


This is a simplest implementation of Kafka client. 
It is based on the lowest compatible version of Kafka binary protocol to reduce message size.
It can be used only to publish messages to Kafka topics which is pretty typical scenario in IoT world.



Short Example:
---------------------------
```
const Kafka  = require('kafka-tiny-client');
 
const kafka = new Kafka({
  client: 'my-app',  //Will take device serial number when not specified
  host: '130.61.255.148',
  port: 9092,
  autoReconnect: true
});

kafka.connect().then(function (){
    //Read some data from hardware and put to the JSON object
    var dataItem = {
        myValue1: 123,
        myValue2: "Hello World!"
    }
    kafka.send({
        topic: 'myTopic',
        message: JSON.stringify(dataItem)
    }, function (answer, errCode){
        if (errCode)
        { 
            console.log("Error is:" + errorCode);
        }
        else
        {
            console.log("Accepted successfully.");
        }
    });
})
```
