/* Copyright (c) 2019 Christian-W. Budde. See the file LICENSE for copying permission. 
   The original source files Max3421e.* are copyright by Oleg Mazurov  (https://github.com/felis/
*/

/*
This module interfaces to MAX3421 based USB Peripheral and Host Controller
*/

var C = {
  SE0           : 0,
  SE1           : 1,
  FSHOST        : 2,
  LSHOST        : 3,

//
// MAX3421E Registers in HOST mode. 
//
  rRCVFIFO      : 0x08,    //1<<3
  rSNDFIFO      : 0x10,    //2<<3
  rSUDFIFO      : 0x20,    //4<<3
  rRCVBC        : 0x30,    //6<<3
  rSNDBC        : 0x38,    //7<<3

  rUSBIRQ       : 0x68,    //13<<3
/* USBIRQ Bits  */
  bmVBUSIRQ     : 0x40,    //b6
  bmNOVBUSIRQ   : 0x20,    //b5
  bmOSCOKIRQ    : 0x01,    //b0

  rUSBIEN       : 0x70,    //14<<3
/* USBIEN Bits  */
  bmVBUSIE      : 0x40,    //b6
  bmNOVBUSIE    : 0x20,    //b5
  bmOSCOKIE     : 0x01,    //b0

  rUSBCTL       : 0x78,    //15<<3
/* USBCTL Bits  */
  bmCHIPRES     : 0x20,    //b5
  bmPWRDOWN     : 0x10,    //b4

  rCPUCTL       : 0x80,    //16<<3
/* CPUCTL Bits  */
  bmPUSLEWID1   : 0x80,    //b7
  bmPULSEWID0   : 0x40,    //b6
  bmIE          : 0x01,    //b0

  rPINCTL       : 0x88,    //17<<3
/* PINCTL Bits  */
  bmFDUPSPI     : 0x10,    //b4
  bmINTLEVEL    : 0x08,    //b3
  bmPOSINT      : 0x04,    //b2
  bmGPXB        : 0x02,    //b1
  bmGPXA        : 0x01,    //b0

// GPX pin selections
  GPX_OPERATE   : 0x00,
  GPX_VBDET     : 0x01,
  GPX_BUSACT    : 0x02,
  GPX_SOF       : 0x03,

  rREVISION     : 0x90,    //18<<3

  rIOPINS1      : 0xa0,    //20<<3
/* IOPINS1 Bits */
  bmGPOUT0      : 0x01,
  bmGPOUT1      : 0x02,
  bmGPOUT2      : 0x04,
  bmGPOUT3      : 0x08,
  bmGPIN0       : 0x10,
  bmGPIN1       : 0x20,
  bmGPIN2       : 0x40,
  bmGPIN3       : 0x80,

  rIOPINS2      : 0xa8,    //21<<3
/* IOPINS2 Bits */
  bmGPOUT4      : 0x01,
  bmGPOUT5      : 0x02,
  bmGPOUT6      : 0x04,
  bmGPOUT7      : 0x08,
  bmGPIN4       : 0x10,
  bmGPIN5       : 0x20,
  bmGPIN6       : 0x40,
  bmGPIN7       : 0x80,

  rGPINIRQ      : 0xb0,    //22<<3
/* GPINIRQ Bits */
  bmGPINIRQ0    : 0x01,
  bmGPINIRQ1    : 0x02,
  bmGPINIRQ2    : 0x04,
  bmGPINIRQ3    : 0x08,
  bmGPINIRQ4    : 0x10,
  bmGPINIRQ5    : 0x20,
  bmGPINIRQ6    : 0x40,
  bmGPINIRQ7    : 0x80,

  rGPINIEN      : 0xb8,    //23<<3
/* GPINIEN Bits */
  bmGPINIEN0    : 0x01,
  bmGPINIEN1    : 0x02,
  bmGPINIEN2    : 0x04,
  bmGPINIEN3    : 0x08,
  bmGPINIEN4    : 0x10,
  bmGPINIEN5    : 0x20,
  bmGPINIEN6    : 0x40,
  bmGPINIEN7    : 0x80,

  rGPINPOL      : 0xc0,    //24<<3
/* GPINPOL Bits */
  bmGPINPOL0    : 0x01,
  bmGPINPOL1    : 0x02,
  bmGPINPOL2    : 0x04,
  bmGPINPOL3    : 0x08,
  bmGPINPOL4    : 0x10,
  bmGPINPOL5    : 0x20,
  bmGPINPOL6    : 0x40,
  bmGPINPOL7    : 0x80,

  rHIRQ         : 0xc8,   //25<<3
/* HIRQ Bits */
  bmBUSEVENTIRQ : 0x01,   // indicates BUS Reset Done or BUS Resume
  bmRWUIRQ      : 0x02,
  bmRCVDAVIRQ   : 0x04,
  bmSNDBAVIRQ   : 0x08,
  bmSUSDNIRQ    : 0x10,
  bmCONDETIRQ   : 0x20,
  bmFRAMEIRQ    : 0x40,
  bmHXFRDNIRQ   : 0x80,

  rHIEN         : 0xd0,    //26<<3
/* HIEN Bits */
  bmBUSEVENTIE  : 0x01,
  bmRWUIE       : 0x02,
  bmRCVDAVIE    : 0x04,
  bmSNDBAVIE    : 0x08,
  bmSUSDNIE     : 0x10,
  bmCONDETIE    : 0x20,
  bmFRAMEIE     : 0x40,
  bmHXFRDNIE    : 0x80,

  rMODE         : 0xd8,    //27<<3
/* MODE Bits */
  bmHOST        : 0x01,
  bmLOWSPEED    : 0x02,
  bmHUBPRE      : 0x04,
  bmSOFKAENAB   : 0x08,
  bmSEPIRQ      : 0x10,
  bmDELAYISO    : 0x20,
  bmDMPULLDN    : 0x40,
  bmDPPULLDN    : 0x80,

  rPERADDR      : 0xe0,    //28<<3

  rHCTL         : 0xe8,    //29<<3
/* HCTL Bits */
  bmBUSRST      : 0x01,
  bmFRMRST      : 0x02,
  bmSAMPLEBUS   : 0x04,
  bmSIGRSM      : 0x08,
  bmRCVTOG0     : 0x10,
  bmRCVTOG1     : 0x20,
  bmSNDTOG0     : 0x40,
  bmSNDTOG1     : 0x80,

  rHXFR         : 0xf0,    //30<<3
/* Host transfer token values for writing the HXFR register (R30)   */
/* OR this bit field with the endpoint number in bits 3:0           */
  tokSETUP      : 0x10,  // HS=0, ISO=0, OUTNIN=0, SETUP=1
  tokIN         : 0x00,  // HS=0, ISO=0, OUTNIN=0, SETUP=0
  tokOUT        : 0x20,  // HS=0, ISO=0, OUTNIN=1, SETUP=0
  tokINHS       : 0x80,  // HS=1, ISO=0, OUTNIN=0, SETUP=0
  tokOUTHS      : 0xA0,  // HS=1, ISO=0, OUTNIN=1, SETUP=0 
  tokISOIN      : 0x40,  // HS=0, ISO=1, OUTNIN=0, SETUP=0
  tokISOOUT     : 0x60,  // HS=0, ISO=1, OUTNIN=1, SETUP=0

  rHRSL         : 0xf8,    //31<<3
/* HRSL Bits */
  bmRCVTOGRD    : 0x10,
  bmSNDTOGRD    : 0x20,
  bmKSTATUS     : 0x40,
  bmJSTATUS     : 0x80,
  bmSE0         : 0x00,    //SE0 - disconnect state
  bmSE1         : 0xc0,    //SE1 - illegal state

/* Host error result codes, the 4 LSB's in the HRSL register */
  hrSUCCESS     : 0x00,
  hrBUSY        : 0x01,
  hrBADREQ      : 0x02,
  hrUNDEF       : 0x03,
  hrNAK         : 0x04,
  hrSTALL       : 0x05,
  hrTOGERR      : 0x06,
  hrWRONGPID    : 0x07,
  hrBADBC       : 0x08,
  hrPIDERR      : 0x09,
  hrPKTERR      : 0x0A,
  hrCRCERR      : 0x0B,
  hrKERR        : 0x0C,
  hrJERR        : 0x0D,
  hrTIMEOUT     : 0x0E,
  hrBABBLE      : 0x0F,

  MODE_FS_HOST  : 0xC3,
  MODE_LS_HOST  : 0xCB
};

function MAX3421(spi, ss, reset, irq, gpx) {
  this.spi = spi;
  this.ss = ss;
  this.irq = irq;
  this.gpx = gpx;
  this.vbusState = C.SE0;
  this.init();
}

MAX3421.prototype.getVbusState = function() {
  return this.vbusState;
};

/** Single host register write */
MAX3421.prototype.writeRegister = function (reg, val) {
  this.spi.write([reg | 2, val], this.ss);
};

/** Single host register read */
MAX3421.prototype.readRegister = function (reg) {
  var temp = this.spi.send([reg, 0x00], this.ss);
  return temp[1];
};

/** Single host register read */
MAX3421.prototype.init = function () {
  digitalWrite(A0, HIGH); // deselect MAX3421
  digitalWrite(A1, HIGH); // reset MAX3421
};

/** Single host register read */
MAX3421.prototype.reset = function () {
  var cycles = 0;
  this.writeRegister(C.rUSBCTL, C.bmCHIPRES);   // Chip reset. This stops the oscillator
  this.writeRegister(C.rUSBCTL, 0);             // Remove the reset
  while (this.readRegister(C.rUSBIRQ) & C.bmOSCOKIRQ) {
    cycles--;
    if (cycles < 256)
      return false;
  }
  return true;
};

/** Turn USB power on/off */
MAX3421.prototype.vbusPower = function(action) {
  var tmp;
  tmp = this.readRegister(C.rIOPINS2);  // copy of IOPINS2
  if (action) {                         // turn on by setting GPOUT7
    tmp |= C.bmGPOUT7;
  }
  else
  {                                     // turn off by clearing GPOUT7
    tmp &= ~C.mGPOUT7;
  }

  this.writeRegister(C.rIOPINS2, tmp); //send GPOUT7

  var _this = this;
  return new Promise(function(resolve, reject) {
    function CheckResult() {
      // check if overload is present. MAX4793 /FLAG ( pin 4 ) goes low if overload
      if (_this.readRegister(C.rIOPINS2) & C.bmGPIN7 === 0) {
        resolve(false);
      }
      else
      {
      resolve(true);
      }
    }
    if (action) {
      setTimeout(CheckResult, 60);
    }
    else
      CheckResult();
  });
};

/** Probe bus to determine device presense and speed and switch host to this speed */
MAX3421.prototype.busprobe = function() {
  var bus_sample;

  bus_sample = this.readRegister(C.rHRSL);   // Get J,K status
  bus_sample &= (C.bmJSTATUS | C.bmKSTATUS); // zero the rest of the byte

  switch (bus_sample) {                      // start full-speed or low-speed host
        case C.bmJSTATUS:
            if ((this.readRegister(C.rMODE) & C.bmLOWSPEED) === 0) {
                this.writeRegister(C.rMODE, C.MODE_FS_HOST);         // start full-speed host
                this.vbusState = C.FSHOST;
            }
            else {
                this.writeRegister(C.rMODE, C.MODE_LS_HOST);          // start low-speed host
                this.vbusState = C.LSHOST;
            }
            break;
        case C.bmKSTATUS:
            if ((this.readRegister(C.rMODE) & C.bmLOWSPEED) === 0) {
                this.writeRegister(C.rMODE, C.MODE_LS_HOST);          // start low-speed host
                this.vbusState = C.LSHOST;
            }
            else {
                this.writeRegister(C.rMODE, C.MODE_FS_HOST);          // start full-speed host
                this.vbusState = C.FSHOST;
            }
            break;
        case C.bmSE1:                                                 // illegal state
            this.vbusState = C.SE1;
            break;
        case C.bmSE0:                                                 // disconnected state
            this.vbusState = C.SE0;
            break;
        }//end switch( bus_sample )
};

/** MAX3421E initialization after power-on   */
MAX3421.prototype.powerOn = function() {
  /* Configure full-duplex SPI, interrupt pulse   */
  this.writeRegister(C.rPINCTL, C.bmFDUPSPI | C.bmGPXB);  // Full-duplex SPI, GPX
  if (this.reset() === false) {                           // stop/start the oscillator
        console.log("Error: OSCOKIRQ failed to assert");
  }

  /* configure host operation */
  this.writeRegister(C.rMODE, C.bmHOST); // set host mode
  this.writeRegister(C.rMODE, C.bmDPPULLDN | C.bmDMPULLDN | C.bmHOST | C.bmSEPIRQ); // set pull-downs, host and separate GPIN IRQ on GPX
  this.writeRegister(C.rHIEN, C.bmCONDETIE | C.bmFRAMEIE);                            // connection detection

  /* check if device is connected */
  this.writeRegister(C.rHCTL, C.bmSAMPLEBUS);                  // update the JSTATUS and KSTATUS bits
  while ((this.readRegister(C.rHCTL) & C.bmSAMPLEBUS) === 0);  // wait for sample operation to finish
  this.busprobe();                                             // check if anything is connected
  this.writeRegister(C.rHIRQ, C.bmCONDETIRQ);                  // clear connection detect interrupt
  this.writeRegister(C.rCPUCTL, C.bmIE);                       // enable interrupt pin
};

MAX3421.prototype.registerInteruptHandler = function(callback) {
  setWatch(function() {
    var HIRQ_sendback = 0x00;
    var HIRQ = this.readRegisters(C.rHIRQ);    // determine interrupt source
    if (HIRQ & C.bmFRAMEIRQ) {                // -> 1ms SOF interrupt handler
      HIRQ_sendback |= C.bmFRAMEIRQ;
    }

    if (HIRQ & C.bmCONDETIRQ) {
      this.busprobe();
      HIRQ_sendback |= C.bmCONDETIRQ;
    }

    /* End HIRQ interrupts handling, clear serviced IRQs    */
    this.writeRegister(C.rHIRQ, HIRQ_sendback);
    callback(HIRQ_sendback);
   }, this.irq, { repeat:true, edge:"rising" });
};

MAX3421.prototype.registerStateChangeHandler = function(callback) {
  setWatch(function() {
    // read GPIN IRQ register
    callback(this.readRegisters(C.rGPINIRQ));
  }, this.gpx, { repeat:true, edge:"rising" });
};

MAX3421.prototype.queryRevision = function() {
  return this.readRegister(C.rREVISION);
};

/** This is 'exported' so it can be used with `require('MAX3421.js').connect(pin1,pin2)` */
exports.connect = function (spi, ss, reset, irq, gpx) {
  return new MAX3421(spi, ss, reset, irq, gpx);
};