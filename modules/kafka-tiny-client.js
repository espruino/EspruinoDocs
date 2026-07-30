/* Copyright (c) 2019 Pavel Kutakov. See the file LICENSE for copying permission. 
  
Tiny Kafka Client


This is a simplest implementation of Kafka client. 
It is based on the lowest compatible version of Kafka binary protocol to reduce message size.
Can be used only to publish messages to Kafka which is pretty typical scenario in IoT world.



Short Example:
---------------------------
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


*/

var Kafka = function (options) {
    this.clientName = options.client || getSerial();
    this.host = options.host;
    this.timeout = options.timeout || 10000;
    this.port = options.port;
    this.autoReconnect = true;//By default
    if (options.autoReconnect != undefined) {
        this.autoReconnect = options.autoReconnect;
    }
    //state variables
    this.connected = false;
    this.connecting = false;
};

Kafka.prototype.reconnect = function () {
    var that = this;
    that.connected = false;
    if (that.autoReconnect) {
        //console.log("...auto-reconnecting to Kafka...");  //some debug messages in case of any connection trouble
        that.connecting = true;

        var net = require('net');
        that.netClient = net.connect({ host: that.host, port: that.port }, function (socket) {
            console.log(socket);
            that.connected = true;
            that.connecting = false;
            that.socket = socket;
            that.netClient.socket = socket;
            that.producer = new Producer(that.netClient, that.clientName);
            //console.log(".....RECONNECTED SUCCESSFULLY....");
        });
    }
    //Force reconnect after timeout (still waiting for connection)
    setTimeout(function () {
        if (that.connecting && that.autoReconnect) {
            that.reconnect();
        }
    }, that.timeout);
};

Kafka.prototype.connect = function () {
    var that = this;
    that.connecting = true;
    return new Promise(function (resolve, reject) {
        try {
            var net = require('net');
            that.netClient = net.connect({ host: that.host, port: that.port }, function (socket) {
                that.connected = true;
                that.connecting = false;
                that.socket = socket;
                that.netClient.socket = socket;
                that.netClient.on("end", that.reconnect);
                that.netClient.on("data", function (data) {
                    that.emit("data", data);
                });
                that.producer = new Producer(that.netClient, that.clientName);

                resolve(that.netClient);
            });
        }
        catch (e) {
            reject();
        }
    });
};

//Callback - function (res, err) where res - output data and err- any kind of error
Kafka.prototype.send = function (topicAndMessage, callback) {
    var that = this;
    var processFinish = function (data) {
        that.producer.removeListener("completed", processFinish);
        var errorCode = that.producer.getErrorCodeFromResponse();
        if (errorCode == 0) {
            callback(data, null);
        }
        else {
            callback(null, errorCode);
        }
    };
    var doSend = function () {
        try {
            that.producer.sendMessage(topicAndMessage.topic, topicAndMessage.message);
            that.producer.on("completed", processFinish);
        }
        catch (e) {
            that.connected = false;
            that.connecting = false;
            callback(null, e, that.autoReconnect);
            var eAsStr = e.toString();
            if (eAsStr.indexOf("socket") != -1 && eAsStr.indexOf("closed") != -1) {
                that.reconnect();
            }
            return;
        }
    };
    if (!that.connected && !that.connecting && that.autoReconnect) {
        that.reconnect();
        callback(null, "Not connected, reconnecting automatically");
        return;
    }
    if (!that.connected && that.connecting) {
        callback(null, "Still waiting for connection");
    }
    else {
        doSend();
    }
};


//#region --CRC 32 support
//Actually normal crc32 does not work, the code taken here, run-time table generation was removed due to extremly poor performance on Espruino:
//             https://gist.github.com/Yaffle/1287361
//Here is an online CRC calculator that works correctly http://www.sunshine2k.de/coding/javascript/crc/crc_js.html
function crc32(buf/*, polynomial = 0x04C11DB7, initialValue = 0xFFFFFFFF, finalXORValue = 0xFFFFFFFF*/) {
    var crc32tab = [
        0, 1996959894, -301047508, -1727442502,
        124634137, 1886057615, -379345611, -1637575261,
        249268274, 2044508324, -522852066, -1747789432,
        162941995, 2125561021, -407360249, -1866523247,
        498536548, 1789927666, -205950648, -2067906082,
        450548861, 1843258603, -187386543, -2083289657,
        325883990, 1684777152, -43845254, -1973040660,
        335633487, 1661365465, -99664541, -1928851979,
        997073096, 1281953886, -715111964, -1570279054,
        1006888145, 1258607687, -770865667, -1526024853,
        901097722, 1119000684, -608450090, -1396901568,
        853044451, 1172266101, -589951537, -1412350631,
        651767980, 1373503546, -925412992, -1076862698,
        565507253, 1454621731, -809855591, -1195530993,
        671266974, 1594198024, -972236366, -1324619484,
        795835527, 1483230225, -1050600021, -1234817731,
        1994146192, 31158534, -1731059524, -271249366,
        1907459465, 112637215, -1614814043, -390540237,
        2013776290, 251722036, -1777751922, -519137256,
        2137656763, 141376813, -1855689577, -429695999,
        1802195444, 476864866, -2056965928, -228458418,
        1812370925, 453092731, -2113342271, -183516073,
        1706088902, 314042704, -1950435094, -54949764,
        1658658271, 366619977, -1932296973, -69972891,
        1303535960, 984961486, -1547960204, -725929758,
        1256170817, 1037604311, -1529756563, -740887301,
        1131014506, 879679996, -1385723834, -631195440,
        1141124467, 855842277, -1442165665, -586318647,
        1342533948, 654459306, -1106571248, -921952122,
        1466479909, 544179635, -1184443383, -832445281,
        1591671054, 702138776, -1328506846, -942167884,
        1504918807, 783551873, -1212326853, -1061524307,
        -306674912, -1698712650, 62317068, 1957810842,
        -355121351, -1647151185, 81470997, 1943803523,
        -480048366, -1805370492, 225274430, 2053790376,
        -468791541, -1828061283, 167816743, 2097651377,
        -267414716, -2029476910, 503444072, 1762050814,
        -144550051, -2140837941, 426522225, 1852507879,
        -19653770, -1982649376, 282753626, 1742555852,
        -105259153, -1900089351, 397917763, 1622183637,
        -690576408, -1580100738, 953729732, 1340076626,
        -776247311, -1497606297, 1068828381, 1219638859,
        -670225446, -1358292148, 906185462, 1090812512,
        -547295293, -1469587627, 829329135, 1181335161,
        -882789492, -1134132454, 628085408, 1382605366,
        -871598187, -1156888829, 570562233, 1426400815,
        -977650754, -1296233688, 733239954, 1555261956,
        -1026031705, -1244606671, 752459403, 1541320221,
        -1687895376, -328994266, 1969922972, 40735498,
        -1677130071, -351390145, 1913087877, 83908371,
        -1782625662, -491226604, 2075208622, 213261112,
        -1831694693, -438977011, 2094854071, 198958881,
        -2032938284, -237706686, 1759359992, 534414190,
        -2118248755, -155638181, 1873836001, 414664567,
        -2012718362, -15766928, 1711684554, 285281116,
        -1889165569, -127750551, 1634467795, 376229701,
        -1609899400, -686959890, 1308918612, 956543938,
        -1486412191, -799009033, 1231636301, 1047427035,
        -1362007478, -640263460, 1088359270, 936918000,
        -1447252397, -558129467, 1202900863, 817233897,
        -1111625188, -893730166, 1404277552, 615818150,
        -1160759803, -841546093, 1423857449, 601450431,
        -1285129682, -1000256840, 1567103746, 711928724,
        -1274298825, -1022587231, 1510334235, 755167117
    ];
    var polynomial = arguments.length < 2 ? 0x04C11DB7 : (arguments[1] >>> 0);
    var initialValue = arguments.length < 3 ? 0xFFFFFFFF : (arguments[2] >>> 0);
    var finalXORValue = arguments.length < 4 ? 0xFFFFFFFF : (arguments[3] >>> 0);

    var crc = initialValue;
    var length = buf.length;
    var k = -1;
    while (++k < length) {
        var c = buf[k];
        if (c > 255) {
            throw new RangeError();
        }
        var index = (crc & 255) ^ c;
        crc = ((crc >>> 8) ^ crc32tab[index]) >>> 0;
    }
    return (crc ^ finalXORValue) >>> 0;
}


//#endregion

//#region --BufferMaker specially ported for Espruino
function BufferMaker() {
    this.plan = [];
}

var types = {
    "Uint8": { bytes: 1 },
    "Int8": { bytes: 1 },
    "Int16BE": { bytes: 2 },
    "Int32BE": { bytes: 4 },
    "Int16LE": { bytes: 2 },
    "Int32LE": { bytes: 4 },
    "Uint16BE": { bytes: 2 },
    "Uint32BE": { bytes: 4 },
    "Uint16LE": { bytes: 2 },
    "Uint32LE": { bytes: 4 },
    "string": {},
    "buffer": {}
};

// create methods for each type
function addTypeMethod(type) {
    BufferMaker.prototype[type] = function (val) {
        this.plan.push({ type: type, value: val });
        return this;
    };
}

for (var type in types) {
    addTypeMethod(type);
}

BufferMaker.prototype.make = function () {
    var bytecount = 0;
    var offset = 0;
    var item;
    var i, j = 0;
    for (i = 0; i < this.plan.length; i++) {
        item = this.plan[i];
        switch (item.type) {
            case 'string': bytecount += item.value.length;//For string size
                break;
            case 'buffer':
                bytecount += item.value.byteLength; //threat it as ArrayBuffer object
                break;
            default:
                bytecount += types[item.type].bytes;
        }
    }
    var items = [];
    for (i = 0; i < this.plan.length; i++) {
        item = this.plan[i];
        if (types[item.type].bytes > 0) {
            var buf = new ArrayBuffer(types[item.type].bytes);
            var dv = new DataView(buf);
            var isBE = item.type.toString().includes('BE', 0);
            var methodName = 'set' + item.type.toString();
            if (item.type.toString().includes('BE', 0) || item.type.toString().includes('LE', 0)) {
                methodName = methodName.substring(0, methodName.length - 2);
            }
            dv[methodName](0, item.value, !isBE);
            items.push(buf);
        } else {
            items.push(item.value);  //Put string/bytes as-is
        }
    }
    var buffer = E.toUint8Array(items);
    return buffer;

};
BufferMaker.prototype.length = function () {
    return this._length;
}

//#endregion

//#region --Kafka Simple Message fabric 

/*
        MessageSize   - Int32
        CRC         - Int32
        Magic       - Int8  =0  - Simplest possible protocol
        Attributes  - Int8  =0  - No compression
        Key         - bytes =0 (Int32)  - First zero means that no data in this value
        Value       - bytes  (first byte of Int32 - array length, then- data bytes)

*/
function Message(payload) {
    // note: payload should be a Buffer
    this.magic = 0;
    this.compression = 0;
    if (!payload && payload !== '') {
        throw "payload is a required argument";
    }
    this.payload = payload;
}
Message.prototype.byteLength = function () {
    if (!this.bytesLengthVal) {
        this.toBytes();
    }
    return this.bytesLengthVal;
};

Message.prototype.calculateChecksum = function (buf) {
    var crcValue = crc32(buf);
    return crcValue;
};

Message.prototype.isValid = function () {
    return this.checksum == this.calculateChecksum();
};

Message.prototype.toBytes = function () {
    var msgBody = new BufferMaker()
        .Uint8(this.magic)
        .Uint8(this.compression)
        .Int32BE(-1)       //KEY = -1 means NULL value 
        .Int32BE(this.payload.length)//Value Size
        .string(this.payload)  //Value
        .make();

    var crc32value = this.calculateChecksum(msgBody);

    var nonLength = new BufferMaker()
        .Uint32BE(crc32value)
        .buffer(msgBody)
        .make();

    var encodedMessage = new BufferMaker()
        .Uint32BE(nonLength.byteLength) //Total MESSAGE SIZE
        .buffer(nonLength)
        .make();

    return encodedMessage;
};
//#endregion

//#region --Kafka Request fabric

/*
We are using lowest available version of protocol to make message as short as possible. 
Starting from version 0.11 protocol has changed significantly thus almost doubling message size.
So we will keep it 0.9 version compatible.

SIZE - Int32
    APIKEY        - Int16 =0  - means "Produce"
    APIVersion    - Int16 =0  - means Lowest version of protocol available
    CorrelationID - Int32     - Random generated value (works as ID of the request from the given client)
    ClientID      - String  (first Int16 - length, then data) - when not specified, used board Serial number
    RequiredAcks    - Int16 = 1   
    Timeout         - Int32 = 10000   - 10 seconds default timeout
    ArrayCount      - Int32 = 1     - Number of topic-specific data parts in this packet
        TopicName       - string  (First Int16 - length, then data)
        ArrayCount      - Int32 = 1   - Number of MessageSets for this topic
        Partition     - Int32 = 0
        MessageSetSize  - Int32 - Total Size of ALL Messages below
            Offset        - Int64 =0
            MessageSize   - Int32   - Length of subsequent block
            CRC         - Int32
            Magic       - Int8  =0  - Simplest possible protocol
            Attributes  - Int8  =0  - No compression
            Key         - bytes =-1 (Int32)  - value of -1 means NULL
            Value       - bytes  (first value of Int32 - array length, then - data bytes)

Total size of empty message is about 90 bytes

*/
var ProduceRequest = function (clientid, timeout) {
    this.clientid = clientid || "";
    this.timeout = timeout || 10000;//defaults to 10 seconds
};

ProduceRequest.prototype.prepareRequest = function (topic, message) {
    this.correlationid = Math.round(Math.random() * 1000000000);

    var msg = new Message(message).toBytes();
    var msgSize = msg.length;
    var msgSet = new BufferMaker()
        //.Int32BE(1)     //Number of messages - not needed actually!!!
        .Uint32BE(0)
        .Uint32BE(0)        //Offset - two zeroes for Int64
        .buffer(msg)  //and Message itself!
        .make();

    var requestBase = new BufferMaker()
        .Uint16BE(0)   //APIKey = 0 for produceRequest
        .Uint16BE(0)   //APIVersion
        .Uint32BE(this.correlationid)  //unique request number
        .Int16BE(this.clientid.length)  //Length of ClientName (2 bytes)
        .string(this.clientid)   //ClientID
        .Int16BE(1)              //Acks
        .Uint32BE(this.timeout)  //timeout
        .Int32BE(1)   //Number of [TopicData]
        .Int16BE(topic.length)  //Size of the Topic
        .string(topic)
        .Int32BE(1)   //Number of [DATA]
        .Uint32BE(0)            //Partition
        .Uint32BE(msgSet.length)  //Size of MessageSet
        .buffer(msgSet)  //and MessageSet!
        .make();
    var request = new BufferMaker()
        .Uint32BE(requestBase.length)
        .buffer(requestBase)
        .make();
    return request;
};

//#endregion

//#region
var Producer = function (connection, clientName) {
    var that = this;
    this.connection = connection;
    this.clientName = clientName;
    this.responseData = "";

    this.connection.on("data", function (data) {
        that.responseData += data;

        //checking expected length
        var buffer = new ArrayBuffer(4);
        for (var i = 0; i < 4; i++) {
            buffer[i] = that.responseData.charCodeAt(i);
        }
        var dv = new DataView(buffer);
        var totalLen = dv.getUint32(0, false);
        if (totalLen + 4 == that.responseData.length) {  //+4 means that first 4 bytes are also in result data
            that.emit("completed", that.answerAsArray(that.responseData));
            that.responseData = "";
        }
        that.totalLengthOfAnswer = totalLen;
    });
    //Finish with data and process response
    this.connection.on("end", function () {
        that.emit("close");
    });
};

Producer.prototype.sendMessage = function (topic, message) {
    if (!this.request) {
        this.request = new ProduceRequest(this.clientName);
    }
    var msg = this.request.prepareRequest(topic, message);
    this.responseData = "";
    //Receive data block
    var that = this;
    var preparedMsg = this.prepareForSending(msg);

    this.connection.socket.write(preparedMsg);
    msg = [];
    preparedMsg = undefined;
};

Producer.prototype.answerAsArray = function (data) {
    var result = new Uint8Array(data.length);
    for (var i = 0; i < data.length; i++) {
        result[i] = data.charCodeAt(i);
    }
    return result;
};

Producer.prototype.prepareForSending = function (msg) {
    var result = "";
    for (var i = 0; i < msg.length; i++) {
        result += String.fromCharCode(msg[i]);
    }
    return result;
};

Producer.prototype.getErrorCodeFromResponse = function () {
    var buffer = new ArrayBuffer(this.responseData.length);
    for (var i = 0; i < this.responseData.length; i++) {
        buffer[i] = this.responseData.charCodeAt(i);
    }
    var dv = new DataView(buffer);
    /*
    Response format:
        Int32 -  size
        Int32 - correlation ID
        Int32 - ArrayCount - =1
            Int16 - size of topic name
            bytes - Topic Name 
            Int32 - ArrayCount - =1
                int32 - partition
                Int16 - ERROR CODE
                int64 - offset, which is -1 in case of error
    */
    var topicNameLen = dv.getInt16(12, false);
    return dv.getInt16(topicNameLen + 14 + 8);
};

//#endregion
module.exports = Kafka;