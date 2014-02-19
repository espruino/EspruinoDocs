/* Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*
Module for NFC/RFID modules based on the NXP PN532.

Simply connect up I2C and use as follows:

```
I2C1.setup({scl:B6, sda:B7});
var nfc = require("PN532").connect(I2C1);
print(nfc.getVersion());
nfc.SAMConfig(); // start listening
setInterval(function() {
 nfc.findCards(function(card) {
  print("Found card "+card);
  card = JSON.stringify(card);
  var leds = [LED1,LED2,LED3];
  if (card=="[147,239,211,128]") digitalWrite(leds,1);
  if (card=="[249,192,235,164]") digitalWrite(leds,2);
  if (card=="[4,99,129,114,72,52,128]") digitalWrite(leds,4);
 });
}, 1000);
```

*/
var C = {
PN532_PREAMBLE                      : 0x00,
PN532_STARTCODE1                    : 0x00,
PN532_STARTCODE2                    : 0xFF,
PN532_POSTAMBLE                     : 0x00,

PN532_HOSTTOPN532                   : 0xD4,

// PN532 Commands
PN532_COMMAND_DIAGNOSE              : 0x00,
PN532_COMMAND_GETFIRMWAREVERSION    : 0x02,
PN532_COMMAND_GETGENERALSTATUS      : 0x04,
PN532_COMMAND_READREGISTER          : 0x06,
PN532_COMMAND_WRITEREGISTER         : 0x08,
PN532_COMMAND_READGPIO              : 0x0C,
PN532_COMMAND_WRITEGPIO             : 0x0E,
PN532_COMMAND_SETSERIALBAUDRATE     : 0x10,
PN532_COMMAND_SETPARAMETERS         : 0x12,
PN532_COMMAND_SAMCONFIGURATION      : 0x14,
PN532_COMMAND_POWERDOWN             : 0x16,
PN532_COMMAND_RFCONFIGURATION       : 0x32,
PN532_COMMAND_RFREGULATIONTEST      : 0x58,
PN532_COMMAND_INJUMPFORDEP          : 0x56,
PN532_COMMAND_INJUMPFORPSL          : 0x46,
PN532_COMMAND_INLISTPASSIVETARGET   : 0x4A,
PN532_COMMAND_INATR                 : 0x50,
PN532_COMMAND_INPSL                 : 0x4E,
PN532_COMMAND_INDATAEXCHANGE        : 0x40,
PN532_COMMAND_INCOMMUNICATETHRU     : 0x42,
PN532_COMMAND_INDESELECT            : 0x44,
PN532_COMMAND_INRELEASE             : 0x52,
PN532_COMMAND_INSELECT              : 0x54,
PN532_COMMAND_INAUTOPOLL            : 0x60,
PN532_COMMAND_TGINITASTARGET        : 0x8C,
PN532_COMMAND_TGSETGENERALBYTES     : 0x92,
PN532_COMMAND_TGGETDATA             : 0x86,
PN532_COMMAND_TGSETDATA             : 0x8E,
PN532_COMMAND_TGSETMETADATA         : 0x94,
PN532_COMMAND_TGGETINITIATORCOMMAND : 0x88,
PN532_COMMAND_TGRESPONSETOINITIATOR : 0x90,
PN532_COMMAND_TGGETTARGETSTATUS     : 0x8A,

PN532_WAKEUP                        : 0x55,

/*PN532_SPI_STATREAD                  : 0x02,
PN532_SPI_DATAWRITE                 : 0x01,
PN532_SPI_DATAREAD                  : 0x03,
PN532_SPI_READY                     : 0x01,*/

PN532_I2C_ADDRESS                   : 0x48 >> 1,
PN532_I2C_READBIT                   : 0x01,
PN532_I2C_BUSY                      : 0x00,
PN532_I2C_READY                     : 0x01,
PN532_I2C_READYTIMEOUT              : 20,

/*PN532_MIFARE_ISO14443A              : 0x00,

// Mifare Commands
MIFARE_CMD_AUTH_A                   : 0x60,
MIFARE_CMD_AUTH_B                   : 0x61,
MIFARE_CMD_READ                     : 0x30,
MIFARE_CMD_WRITE                    : 0xA0,
MIFARE_CMD_TRANSFER                 : 0xB0,
MIFARE_CMD_DECREMENT                : 0xC0,
MIFARE_CMD_INCREMENT                : 0xC1,
MIFARE_CMD_RESTORE                  : 0xC2,

// Prefixes for NDEF Records : to identify record type,
NDEF_URIPREFIX_NONE                 : 0x00,
NDEF_URIPREFIX_HTTP_WWWDOT          : 0x01,
NDEF_URIPREFIX_HTTPS_WWWDOT         : 0x02,
NDEF_URIPREFIX_HTTP                 : 0x03,
NDEF_URIPREFIX_HTTPS                : 0x04,
NDEF_URIPREFIX_TEL                  : 0x05,
NDEF_URIPREFIX_MAILTO               : 0x06,
NDEF_URIPREFIX_FTP_ANONAT           : 0x07,
NDEF_URIPREFIX_FTP_FTPDOT           : 0x08,
NDEF_URIPREFIX_FTPS                 : 0x09,
NDEF_URIPREFIX_SFTP                 : 0x0A,
NDEF_URIPREFIX_SMB                  : 0x0B,
NDEF_URIPREFIX_NFS                  : 0x0C,
NDEF_URIPREFIX_FTP                  : 0x0D,
NDEF_URIPREFIX_DAV                  : 0x0E,
NDEF_URIPREFIX_NEWS                 : 0x0F,
NDEF_URIPREFIX_TELNET               : 0x10,
NDEF_URIPREFIX_IMAP                 : 0x11,
NDEF_URIPREFIX_RTSP                 : 0x12,
NDEF_URIPREFIX_URN                  : 0x13,
NDEF_URIPREFIX_POP                  : 0x14,
NDEF_URIPREFIX_SIP                  : 0x15,
NDEF_URIPREFIX_SIPS                 : 0x16,
NDEF_URIPREFIX_TFTP                 : 0x17,
NDEF_URIPREFIX_BTSPP                : 0x18,
NDEF_URIPREFIX_BTL2CAP              : 0x19,
NDEF_URIPREFIX_BTGOEP               : 0x1A,
NDEF_URIPREFIX_TCPOBEX              : 0x1B,
NDEF_URIPREFIX_IRDAOBEX             : 0x1C,
NDEF_URIPREFIX_FILE                 : 0x1D,
NDEF_URIPREFIX_URN_EPC_ID           : 0x1E,
NDEF_URIPREFIX_URN_EPC_TAG          : 0x1F,
NDEF_URIPREFIX_URN_EPC_PAT          : 0x20,
NDEF_URIPREFIX_URN_EPC_RAW          : 0x21,
NDEF_URIPREFIX_URN_EPC              : 0x22,
NDEF_URIPREFIX_URN_NFC              : 0x23,

PN532_GPIO_VALIDATIONBIT            : 0x80,
PN532_GPIO_P30                      : 0,
PN532_GPIO_P31                      : 1,
PN532_GPIO_P32                      : 2,
PN532_GPIO_P33                      : 3,
PN532_GPIO_P34                      : 4,
PN532_GPIO_P35                      : 5,*/

PN532_SAM_NORMAL_MODE               : 0x01,
PN532_SAM_VIRTUAL_CARD              : 0x02,
PN532_SAM_WIRED_CARD                : 0x03,
PN532_SAM_DUAL_CARD                 : 0x04,

PN532_BRTY_ISO14443A               : 0x00,
PN532_BRTY_ISO14443B               : 0x03,
PN532_BRTY_212KBPS                 : 0x01,
PN532_BRTY_424KBPS                 : 0x02,
PN532_BRTY_JEWEL                   : 0x04,
NFC_WAIT_TIME                      : 30,
NFC_CMD_BUF_LEN                    : 64,
NFC_FRAME_ID_INDEX                 : 6
};

function PN532(i2c) {
  this.i2c = i2c;
}

PN532.prototype.cmd = function(c, readBytes) {
  var i,arr = [C.PN532_PREAMBLE,C.PN532_STARTCODE1,C.PN532_STARTCODE2,
     c.length+1,(~c.length)&0xFF, C.PN532_HOSTTOPN532];
  for (i in c) arr.push(c[i]);
  var checksum = -arr[0];
  for (i in arr)
    checksum+=arr[i];
  arr.push((~checksum) & 0xFF);
  checksum=0;
  for (i in arr)
    checksum+=arr[i];
  arr.push(C.PN532_POSTAMBLE);
  //print(arr);
  this.i2c.writeTo(C.PN532_I2C_ADDRESS, arr);
  arr = this.i2c.readFrom(C.PN532_I2C_ADDRESS, 6); // read ack
  if (arr[4]) console.log("NFC error "+arr[6]);
  if (readBytes!==undefined) {
    arr = this.i2c.readFrom(C.PN532_I2C_ADDRESS, readBytes+1);
    return arr.slice(6);
  }
};

PN532.prototype.getVersion = function() {
  var d = this.cmd([C.PN532_COMMAND_GETFIRMWAREVERSION],12);
  return {
    chip : "PN5"+d[2].toString(16),
    firmware : d[3]+"."+d[4],
    support : d[5]
  };
};

PN532.prototype.SAMConfig = function() {
  var d = this.cmd([C.PN532_COMMAND_SAMCONFIGURATION,
               C.PN532_SAM_NORMAL_MODE,
               20, // timeout - 50ms * 20 = 1 sec
               0 // don't use IRQ pin  (0 or 1)
              ],8);
  return d;
};

PN532.prototype.findCards = function(callback) {
  this.cmd([C.PN532_COMMAND_INLISTPASSIVETARGET,
             1, // max targets (max=2)
             C.PN532_BRTY_ISO14443A // modulation type
            ]);
  var p = this;
  setTimeout(function() { // wait for NFC poll (30ms)
    var d = p.i2c.readFrom(C.PN532_I2C_ADDRESS, 20+1).slice(1);
    if (d[6]==C.PN532_COMMAND_INLISTPASSIVETARGET+1) {
      if (d[7]!=1) print("Expecting 1 tag, got "+d[7]);
      callback(d.slice(12,19));
    }
  }, 30);
};

exports.connect = function(/*=I2C*/i2c) { return new PN532(i2c); }
