/* Copyright (C) 2017 Joachim Klein. See the file LICENSE for copying permission. */
/*
This module interfaces with Infineon TLE94112EL SPI Motor controller. 
Should also work with other family members.


Usage:

SPI1.setup({sck:A5, miso:A6, mosi:A7, baud:integer=1000000, mode:integer=1, order:'lsb' });
var TLE = require("TLE94112").connect(SPI1, B6, A9);

TLE.enable();				// Enable chip, POR

TLE.setPWMFrequency(1,3);   // Set PWN Freqency 1 to 200 Hz
TLE.setPWMSource(1,1);      // Select PWM 1 as Source
TLE.setDutyCycle(1, 240 );  // Set duty cycle of PWM channel to 90 %
TLE.setDirection(1,1);      // Enable Motor 1 HS/LS for turning left or right 1 or 2
  
MotorDriver.shutdown();		// Disable chip (enter low power mode, reset)

*/

var C = {
// Addresses of the control registers
PWM_CH_FREQ_CTRL : 0x33, // PWM clock frequency and frequency modulation of the oscillator
HB_ACT_CTRL :  [0x03, 0x43, 0x23],
HB_MODE_CTRL : [0x63, 0x13, 0x53],
PWM_DC_CTRL :  [0x73, 0x0B, 0x4B],

FW_OL_CTRL :  0x2B,       // LED mode for HS1/2 and active free-wheeling of HB1-6
FW_CTRL :     0x6B,          // Active free-wheeling of HB7-12
CONFIG_CTRL : 0x67,      // Device ID

WRITE :      0x80,      // Mask for write commands to control registers
CLEAR :      0x80,      // Mask for clear commands to status registers
	// Address of the status registers
SYS_DIAG_1 : 0x1B,      // Global Status Register
SYS_DIAG_2 : 0x5B,      // Overcurrent HB1-4
SYS_DIAG_3 : 0x3B,      // Overcurrent HB5-8
SYS_DIAG_4 : 0x7B,      // Overcurrent HB9-12
SYS_DIAG_5 : 0x07,      // Open load HB1-4
SYS_DIAG_6 : 0x47,      // Open load HB5-8
SYS_DIAG_7 : 0x27,      // Open load HB9-12
  
};


function TLE94112(spi,cs,en) {
  this.spi=spi;
  this.cs=cs;
  this.en=en;
}
/** Connect the TLE94112 to the SPI interface.
tlespi = SPI interface, psck, pmiso and pmosi have to be connected to this interface 
pcsp  = Pin chip select 
pen  = Pin enable
 */
exports.connect = function(tlespi, pcsp, pen) {
	return new TLE94112(tlespi, pcsp, pen);
};

/** enable TLE94112 chip. All registers will have their reset value. */
TLE94112.prototype.enable  = function () {
  digitalWrite(this.cs,1);
  digitalWrite(this.en,1);
};

/** disable TLE94112 chip. The chip will enter power done mode */
TLE94112.prototype.disable  = function () {
  digitalWrite(this.en,0);
};

/* send a data byte to the defined register on available device */
TLE94112.prototype.writeRegister = function ( addr,  data) {
  addr = addr | C.WRITE;
  return this.spi.send( [addr, data], this.cs );
}

/* read a register from SPI */
TLE94112.prototype.readRegister = function ( addr ) {
  var SPIReturn = this.spi.send( [addr, 0], this.cs );
  return (SPIReturn[1]);
}

/* Set duty cycle,
Channel should between 1 and 3, 
Value 0..255 -> 0% - 100% */
TLE94112.prototype.setDutyCycle = function( Channel, Value ) {   
  this.writeRegister(C.PWM_DC_CTRL[Channel-1], Value); 
}

/** set PWM Soruce for a motor.
Motor 1..6, Source 1..3 
*/
TLE94112.prototype.setPWMSource = function( Motor, PWMCh ) {
  Motor = Motor -1;
  var ConVal = (PWMCh + PWMCh*4)<<((Motor&1)*4);
  var MskVal = (0x0f)<<((Motor&1)*4);
  var MotReg = C.HB_MODE_CTRL[(Motor>>1)];
  var CurVal = this.readRegister(MotReg);
  CurVal = (CurVal & ~MskVal) | ConVal;
  this.writeRegister(MotReg, CurVal);
 
}

/** set Half Bridge configuration, if all HB used for motor control
Motor 1..6, Dir 0 = Stop, 1 = Right, 2 = Left 
*/
TLE94112.prototype.setDirection = function( Motor, Dir ) {
  Motor = Motor -1;
  var ConVal = 0;
  if ( Dir === 1 ) { ConVal = 0x09;  }
  else if ( Dir === 2 ) { ConVal= 0x06; }
  
      ConVal = (ConVal)<<((Motor&1)*4);
  var MskVal = (0x0f)<<((Motor&1)*4);
  var MotReg = C.HB_ACT_CTRL[(Motor>>1)];
  var CurVal = this.readRegister(MotReg);
  CurVal = (CurVal & ~MskVal) | ConVal;
  this.writeRegister(MotReg, CurVal);
 
}

/** set PWM Frequency
Channel 1 - 3
FReqnecy
0 - off
1 - 80 Hz
2 - 100 Hz
3 - 200 Hz

Channel 4 is used for modulation.
00B No modulation (default)
01B Modulation frequency 15.625kHz
10B Modulation frequency 31.25kHz
11B Modulation frequency 62.5kHz 

*/
TLE94112.prototype.setPWMFrequency = function ( Channel, Freq ) {
  Channel = Channel -1;
  Freq = (Freq & 0x03)<<((Channel & 3 )*2);
  var MskVal =   (0x03)<<((Channel & 3 )*2);

  var CurVal =  this.readRegister(C.PWM_CH_FREQ_CTRL);
  CurVal = (CurVal & ~MskVal) | Freq;
  this.writeRegister(C.PWM_CH_FREQ_CTRL, CurVal);
 
}

/**
Read all overcurrent flags and return as one value.
*/
TLE94112.prototype.getOvercurrentFlags = function ( ) {
  return ( ( ( this.readRegister(C.SYS_DIAG_4) ) <<16 ) | 
		   ( ( this.readRegister(C.SYS_DIAG_3) ) <<8  ) | 
		     ( this.readRegister(C.SYS_DIAG_2) )      );
}

/** Read all open load flags and return as one value */
TLE94112.prototype.getOpenLoadFlags = function ( ) {
  return ( ( ( this.readRegister(C.SYS_DIAG_5) ) <<16 ) | 
		   ( ( this.readRegister(C.SYS_DIAG_6) ) <<8  ) | 
		     ( this.readRegister(C.SYS_DIAG_7) )      );
}

/** Dump all Control registers */
TLE94112.prototype.logCtrlReg = function () {
  var cl = console.log; 
  cl("- Settings -");
  cl("HB_ACT_1_CTRL:   ",this.readRegister(C.HB_ACT_CTRL[0]).toString(16));
  cl("HB_ACT_2_CTRL:   ",this.readRegister(C.HB_ACT_CTRL[1]).toString(16));
  cl("HB_ACT_3_CTRL:   ",this.readRegister(C.HB_ACT_CTRL[2]).toString(16));
  cl("HB_MODE_1_CTRL:  ",this.readRegister(C.HB_MODE_CTRL[0]).toString(16));
  cl("HB_MODE_2_CTRL:  ",this.readRegister(C.HB_MODE_CTRL[1]).toString(16));
  cl("HB_MODE_3_CTRL:  ",this.readRegister(C.HB_MODE_CTRL[2]).toString(16));
  cl("PWM_CH_FREQ_CTRL:",this.readRegister(C.PWM_CH_FREQ_CTRL).toString(16));
  cl("PWM1_DC_CTRL:    ",this.readRegister(C.PWM_DC_CTRL[0]).toString(16));
  cl("PWM2_DC_CTRL:    ",this.readRegister(C.PWM_DC_CTRL[1]).toString(16));
  cl("PWM3_DC_CTRL:    ",this.readRegister(C.PWM_DC_CTRL[2]).toString(16));
  cl("FW_OL_CTRL:      ",this.readRegister(C.FW_OL_CTRL).toString(16));
  cl("FW_CTRL:         ",this.readRegister(C.FW_CTRL).toString(16));
  cl("CONFIG_CTRL: ");
     switch ( this.readRegister(C.CONFIG_CTRL) )
    {
      case 0 : cl( "TLE94112EL chip"); break;
      case 1 : cl( "TLE94110EL chip"); break;
      case 2 : cl( "TLE94108EL chip"); break;
      case 3 : cl( "TLE94106EL chip"); break;
      case 4 : cl( "TLE94104EP chip"); break;
      case 5 : cl( "TLE94103EP chip"); break;
      default: cl( "unkonwn"); 
    } 
}

/** Dump all Diagnose registers */
TLE94112.prototype.logSysDiag = function () {
  var cl = console.log; 
  cl("- System Diagnose -");
  cl("SYS_DIAG_1:        ",this.readRegister(C.SYS_DIAG_1).toString(16));
  cl("Overcurrent:Flags: ",this.getOvercurrentFlags().toString(16));
  cl("Open Load Flags:   ",this.getOpenLoadFlags().toString(16));
}


