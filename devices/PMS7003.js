/* Copyright (c) 2019 Akos Lukacs. See the file LICENSE for copying permission. */
/*
 Driver for Plantower PMS 7003 particulate matter sensor on UART
*/


function _processBuffer(buff, details) {
    // value from checksum bytes
    var checksum = (buff[30] << 8) + buff[31];
    // checksum is just the sum of 0..30 bytes
    var checksumCalc = E.sum(buff.slice(0, 30));

    // Frame length bytes are always [0, 28], but don't check it, since the checksum should catch any comm errors...
    if (checksum != checksumCalc) {return {checksumOk: false}}

    //CF=1, standard particle
    var dCF1 = {
        pm1: (buff[4] << 8) + buff[5],
        pm2_5: (buff[6] << 8) + buff[7],
        pm10: (buff[8] << 8) + buff[9]
    };

    //under atmospheric environment
    var dAtm = {
        pm1: (buff[10] << 8) + buff[11],
        pm2_5: (buff[12] << 8) + buff[13],
        pm10: (buff[14] << 8) + buff[15]
    };

    var rv = {dCF1: dCF1, dAtm: dAtm, checksumOk: true};
    if (details) {
        rv.d7_0_3um = (buff[16] << 8) + buff[17];
        rv.d8_0_5um = (buff[18] << 8) + buff[19];
        rv.d9_1_0um = (buff[20] << 8) + buff[21];
        rv.d10_2_5um = (buff[22] << 8) + buff[23];
        rv.d11_5_0um = (buff[24] << 8) + buff[25];
        rv.d12_10_0um = (buff[26] << 8) + buff[27];
    }
    return rv;
}

function PmsDriver(serialPort, rxPin, callback, details) {
    if (!(serialPort instanceof Serial)) {throw '"serialPort" parameter is not a serial port!'}
    if (!(rxPin instanceof Pin)) {throw '"rx" parameter is not a Pin!';}

    this.buffer = new Uint8Array(32);
    this.bufferIndex = 0;

    this.callback = callback;
    this.details = !!details;

    serialPort.setup(9600, {rx: rxPin});
    serialPort.on('data', this.onSerial.bind(this));
}

PmsDriver.prototype.onSerial = function(sd) {
    // Start characters are always [0x42, 0x4d]. If the first character is not 0x42, just wait for the start character!
    if (this.bufferIndex == 0 && sd.charCodeAt() !== 0x42) {return;}

    E.toUint8Array(sd).forEach(x => {
        // push received characters to buffer
        this.buffer[this.bufferIndex++] = x;

        // and process, if a callback is supplied.
        if (this.bufferIndex === 32) {
            if (this.callback) {
                this.callback(_processBuffer(this.buffer, this.details));
            }
            this.bufferIndex = 0;
        }
    });
}

/** Returns a new PmsDriver object that handles the data coming from the PMS7003.
 ```
 serialPort: Serial - a serial port, can be hw or sw serial. Required.
 rxPin: Pin - The rx pin for the serial port. Required.
 callback: function - callback to be called with the data.
 details: boolean - should the callback include the raw data from the sensor? Optional.
 ```
 */
exports.connect = function(serialPort, rxPin, callback, details) {
    return new PmsDriver(serialPort, rxPin, callback, details);
}
