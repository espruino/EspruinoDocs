/* Copyright (c) 2018 Davy Wybiral, Pur3 Ltd. See the file LICENSE for copying permission. */
/*
  Espruino JS wrapper for REYAX RYLR LoRa modules.
*/
class RYLR {
  /*
    Construct an RYLR instance from a USART interface.
  */
  constructor(usart) {
    this.at = require('AT').connect(usart);
    this.at.registerLine('+RCV', this._receive.bind(this));
  }

  /*
    Wraps at.cmd with Promise and basic response handling.
  */
  atcmd(cmd, timeout) {
    return new Promise((resolve, reject) => {
      this.at.cmd(cmd + '\r\n', timeout || 5000, data => {
        if (data === undefined) {
          reject(cmd + ': TIMEOUT');
        } else if (data.slice(0, 4) == '+ERR') {
          reject(cmd + ': ' + data.slice(1));
        } else {
          resolve(data);
        }
      });
    });
  }

  /*
    Handle "+RCV=" events (incoming messages).
  */
  _receive(line) {
    // Skip "+RCV="
    line = line.slice(5);
    // Parse address
    let idx = line.indexOf(',');
    const address = parseInt(line.slice(0, idx));
    line = line.slice(idx + 1);
    // Parse length
    idx = line.indexOf(',');
    const len = parseInt(line.slice(0, idx));
    line = line.slice(idx + 1);
    // Parse data
    const data = line.slice(0, len);
    line = line.slice(len + 1);
    // Parse RSSI
    idx = line.indexOf(',');
    const rssi = parseInt(line.slice(0, idx));
    line = line.slice(idx + 1);
    // Parse SNR
    const snr = parseInt(line);
    // Trigger event
    this.emit('data', {
      address: address,
      data: data,
      rssi: rssi,
      snr: snr
    });
  }

  /*
    Perform a software reset.
  */
  reset() {
    return this.atcmd('AT+RESET');
  }

  /*
    Set sleep mode (0=normal, 1=sleep).
  */
  setMode(mode) {
    return this.atcmd('AT+MODE=' + mode);
  }

  /*
    Get sleep mode.
  */
  getMode() {
    return this.atcmd('AT+MODE?').then(data => {
      return parseInt(data.slice(6));
    });
  }

  /*
    Set UART baud rate.
  */
  setBaudRate(baud) {
    return this.atcmd('AT+IPR=' + baud);
  }

  /*
    Get UART baud rate.
  */
  getBaudRate() {
    return this.atcmd('AT+IPR?').then(data => {
      return parseInt(data.slice(5));
    });
  }

  /*
    Set device parameters.
    spreadingFactor is the RF spreading factor.
    Valid range between 7-12 (inclusive).
    Default is 12.
    bandwidth specifies the RF bandwidth and it should be a number between 0-9
    that corresponds to the following table:
      0: 7.8KHz (not recommended, over spec.)
      1: 10.4KHz (not recommended, over spec.)
      2: 15.6KHz
      3: 20.8 KHz
      4: 31.25 KHz
      5: 41.7 KHz
      6: 62.5 KHz
      7: 125 KHz (default)
      8: 250 KHz
      9: 500 KHz
    codingRate is the LoRa forward error correction coding rate.
    Valid range between 1-4 (inclusive).
    Defaults to 1.
    preamble is the LoRa programmed preamble. Valid range between 4-7.
    Defaults to 4.
  */
  setParameter(options) {
    options = options || {};
    let params = '';
    params += (options.spreadingFactor || 12) + ',';
    params += (options.bandwidth || 7) + ',';
    params += (options.codingRate || 1) + ',';
    params += (options.preamble || 4);
    return this.atcmd('AT+PARAMETER=' + params);
  }

  /*
    Get device parameters.
  */
  getParameter() {
    return this.atcmd('AT+PARAMETER?').then(data => {
      data = data.slice(11);
      const parts = data.split(',');
      return {
        spreadingFactor: parseInt(parts[0]),
        bandwidth: parseInt(parts[1]),
        codingRate: parseInt(parts[2]),
        preamble: parseInt(parts[3])
      };
    });
  }

  /*
    Set RF frequency band (in Hz).
  */
  setBand(band) {
    return this.atcmd('AT+BAND=' + band);
  }

  /*
    Get RF frequency band (in Hz).
  */
  getBand() {
    return this.atcmd('AT+BAND?').then(data => {
      return parseInt(data.slice(6));
    });
  }

  /*
    Set device address. Valid range between 0-65535 (inclusive).
  */
  setAddress(address) {
    return this.atcmd('AT+ADDRESS=' + address);
  }

  /*
    Get device address.
  */
  getAddress() {
    return this.atcmd('AT+ADDRESS?').then(data => {
      return parseInt(data.slice(9));
    });
  }

  /*
    Set network ID. Valid range between 0-16 (inclusive).
  */
  setNetwork(networkID) {
    return this.atcmd('AT+NETWORKID=' + networkID);
  }

  /*
    Get network ID.
  */
  getNetwork() {
    return this.atcmd('AT+NETWORKID?').then(data => {
      return parseInt(data.slice(11));
    });
  }

  /*
    Set password for communication. This is a 32 character long hex string that
    represents the 16 byte AES key used for encryption. Both LoRa modules need to
    use the same password in order to communicate.
  */
  setPassword(password) {
    return this.atcmd('AT+CPIN=' + password);
  }

  /*
    Get password.
  */
  getPassword() {
    return this.atcmd('AT+CPIN?').then(data => {
      return data.slice(6);
    });
  }

  /*
    Set RF power level in dBm. Valid range between 0 and 15 (inclusive).
  */
  setPower(power) {
    return this.atcmd('AT+CRFOP=' + power);
  }

  /*
    Get RF power level in dBm.
  */
  getPower() {
    return this.atcmd('AT+CRFOP?').then(data => {
      return parseInt(data.slice(7));
    });
  }

  /*
    Send data to optional address (defaults to 0).
  */
  send(data, address) {
    const len = data.length;
    if (address === undefined) {
      address = 0;
    }
    this.at.write('AT+SEND=' + address + ',' + len + ',' + data + '\r\n');
  }

  /*
    Get firmware version.
  */
  getVersion() {
    return this.atcmd('AT+VER?').then(data => {
      return data.slice(5);
    });
  }

  /*
    Reset device configuration to factory defaults.
  */
  setFactory() {
    return this.atcmd('AT+FACTORY');
  }
}

/*
  Return a new RYLR LoRa connection object from a USART interface.
*/
exports.connect = usart => {
  return new RYLR(usart);
};
