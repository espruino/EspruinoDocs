var MHZ19 = function(opts) {
    opts             = opts || {};
    this._tx         = opts.tx;
    this._rx         = opts.rx;
    this._serial     = opts.port;
    this._serial.setup(opts.speed || 9600);
};

MHZ19.prototype.calibrate = function() { this._serial.write("\xFF\x01\x87\x00\x00\x00\x00\x00\x78"); }
MHZ19.prototype.abc_on    = function() { this._serial.write("\xFF\x01\x79\xA0\x00\x00\x00\x00\xE6"); }
MHZ19.prototype.abc_off   = function() { this._serial.write("\xFF\x01\x79\x00\x00\x00\x00\x00\x86"); }
MHZ19.prototype.read      = function() { this._serial.write("\xFF\x01\x86\x00\x00\x00\x00\x00\x79");
                                         var data   = this._serial.read(9);
                                         var a      = [];
                                         for (var i=0; i < data.length; i++) { a.push(data.charCodeAt(i)); }
                                         var status = (256 - (a[1] + a[2] + a[3] + a[4] + a[5] + a[6] + a[7])%256) == a[8];
                                         var co2    = a[2] * 256 + a[3];
                                         var temp   = a[4]-40;
                                         return { status: status, co2: co2, temp: temp };
                                       };

exports.connect = function(opts) { return new MHZ19(opts) };

// https://ru.aliexpress.com/item/MH-Z19B-Infrared-CO2-Sensor-for-CO2-Monitor-MH-Z19B-5000PPM/32774038947.html?spm=2114.13010608.0.0.OHzqKM
// http://www.winsen-sensor.com/d/files/infrared-gas-sensor/mh-z19b-co2-ver1_0.pdf
// http://www.winsen-sensor.com/d/files/PDF/Infrared%20Gas%20Sensor/NDIR%20CO2%20SENSOR/MH-Z19%20CO2%20Ver1.0.pdf
// var mhz19 = require('mhz19.js').connect({ rx: <rx_pin>, tx: <tx_pin>, port: <serial_port>, <<speed: 9600>> });
// console.log( mhz19.read() );
