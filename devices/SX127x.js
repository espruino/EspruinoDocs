/* Copyright (c) 2016 Gordon Williams. See the file LICENSE for copying permission. */
// SX127x ONLY IN LORA MODE
// roughly based on semtech's example code: https://developer.mbed.org/teams/Semtech/code/SX1276Lib/file/7f3aab69cca9/sx1276

var REG = {
 FIFO : 0x00,
 OPMODE : 0x01,
 FRFMSB : 0x06,
 FRFMID : 0x07,
 FRFLSB : 0x08,
 PACONFIG : 0x09,
 PARAMP : 0x0A,
 OCP : 0x0B,
 LNA : 0x0C,
 FIFOADDRPTR : 0x0D,
 FIFOTXBASEADDR : 0x0E,
 FIFORXBASEADDR : 0x0F,
 FIFORXCURRENTADDR : 0x10,
 IRQFLAGSMASK : 0x11,
 IRQFLAGS : 0x12,
 RXNBBYTES : 0x13,
 RXHEADERCNTVALUEMSB : 0x14,
 RXHEADERCNTVALUELSB : 0x15,
 RXPACKETCNTVALUEMSB : 0x16,
 RXPACKETCNTVALUELSB : 0x17,
 MODEMSTAT : 0x18,
 PKTSNRVALUE : 0x19,
 PKTRSSIVALUE : 0x1A,
 RSSIVALUE : 0x1B,
 HOPCHANNEL : 0x1C,
 MODEMCONFIG1 : 0x1D,
 MODEMCONFIG2 : 0x1E,
 SYMBTIMEOUTLSB : 0x1F,
 PREAMBLEMSB : 0x20,
 PREAMBLELSB : 0x21,
 PAYLOADLENGTH : 0x22,
 PAYLOADMAXLENGTH : 0x23,
 HOPPERIOD : 0x24,
 FIFORXBYTEADDR : 0x25,
 MODEMCONFIG3 : 0x26,
 FEIMSB : 0x28,
 FEIMID : 0x29,
 FEILSB : 0x2A,
 RSSIWIDEBAND : 0x2C,
 TEST2F : 0x2F,
 TEST30 : 0x30,
 DETECTOPTIMIZE : 0x31,
 INVERTIQ : 0x33,
 TEST36 : 0x36,
 DETECTIONTHRESHOLD : 0x37,
 SYNCWORD : 0x39,
 TEST3A : 0x3A,
 INVERTIQ2 : 0x3B,
 DIOMAPPING1 : 0x40,
 DIOMAPPING2 : 0x41,
 VERSION : 0x42,
 PLLHOP : 0x44,
 TCXO : 0x4B,
 PADAC : 0x4D,
 FORMERTEMP : 0x5B,
 BITRATEFRAC : 0x5D,
 AGCREF : 0x61,
 AGCTHRESH1 : 0x62,
 AGCTHRESH2 : 0x63,
 AGCTHRESH3 : 0x64,
 PLL : 0x70
};

var RF = {
OPMODE_LONGRANGEMODE_MASK : 0x7F, 
OPMODE_LONGRANGEMODE_OFF : 0x00, // Default
OPMODE_LONGRANGEMODE_ON : 0x80, 
OPMODE_ACCESSSHAREDREG_MASK : 0xBF, 
OPMODE_ACCESSSHAREDREG_ENABLE : 0x40, 
OPMODE_ACCESSSHAREDREG_DISABLE : 0x00, // Default
OPMODE_FREQMODE_ACCESS_MASK : 0xF7,
OPMODE_FREQMODE_ACCESS_LF : 0x08, // Default
OPMODE_FREQMODE_ACCESS_HF : 0x00, 
OPMODE_MASK : 0xF8, 
OPMODE_SLEEP : 0x00, 
OPMODE_STANDBY : 0x01, // Default
OPMODE_SYNTHESIZER_TX : 0x02, 
OPMODE_TRANSMITTER : 0x03, 
OPMODE_SYNTHESIZER_RX : 0x04, 
OPMODE_RECEIVER : 0x05, 
OPMODE_RECEIVER_SINGLE : 0x06, 
OPMODE_CAD : 0x07, 
FRFMSB_434_MHZ : 0x6C, // Default
FRFMID_434_MHZ : 0x80, // Default
FRFLSB_434_MHZ : 0x00, // Default
PACONFIG_PASELECT_MASK : 0x7F, 
PACONFIG_PASELECT_PABOOST : 0x80, 
PACONFIG_PASELECT_RFO : 0x00, // Default
PACONFIG_MAX_POWER_MASK : 0x8F,
PACONFIG_OUTPUTPOWER_MASK : 0xF0, 
PARAMP_TXBANDFORCE_MASK : 0xEF, 
PARAMP_TXBANDFORCE_BAND_SEL : 0x10, 
PARAMP_TXBANDFORCE_AUTO : 0x00, // Default
PARAMP_MASK : 0xF0, 
PARAMP_3400_US : 0x00, 
PARAMP_2000_US : 0x01, 
PARAMP_1000_US : 0x02,
PARAMP_0500_US : 0x03, 
PARAMP_0250_US : 0x04, 
PARAMP_0125_US : 0x05, 
PARAMP_0100_US : 0x06, 
PARAMP_0062_US : 0x07, 
PARAMP_0050_US : 0x08, 
PARAMP_0040_US : 0x09, // Default
PARAMP_0031_US : 0x0A, 
PARAMP_0025_US : 0x0B, 
PARAMP_0020_US : 0x0C, 
PARAMP_0015_US : 0x0D, 
PARAMP_0012_US : 0x0E, 
PARAMP_0010_US : 0x0F, 
OCP_MASK : 0xDF, 
OCP_ON : 0x20, // Default
OCP_OFF : 0x00, 
OCP_TRIM_MASK : 0xE0,
OCP_TRIM_045_MA : 0x00,
OCP_TRIM_050_MA : 0x01, 
OCP_TRIM_055_MA : 0x02, 
OCP_TRIM_060_MA : 0x03, 
OCP_TRIM_065_MA : 0x04, 
OCP_TRIM_070_MA : 0x05, 
OCP_TRIM_075_MA : 0x06, 
OCP_TRIM_080_MA : 0x07, 
OCP_TRIM_085_MA : 0x08,
OCP_TRIM_090_MA : 0x09, 
OCP_TRIM_095_MA : 0x0A, 
OCP_TRIM_100_MA : 0x0B, // Default
OCP_TRIM_105_MA : 0x0C, 
OCP_TRIM_110_MA : 0x0D, 
OCP_TRIM_115_MA : 0x0E, 
OCP_TRIM_120_MA : 0x0F, 
OCP_TRIM_130_MA : 0x10,
OCP_TRIM_140_MA : 0x11, 
OCP_TRIM_150_MA : 0x12, 
OCP_TRIM_160_MA : 0x13, 
OCP_TRIM_170_MA : 0x14, 
OCP_TRIM_180_MA : 0x15, 
OCP_TRIM_190_MA : 0x16, 
OCP_TRIM_200_MA : 0x17, 
OCP_TRIM_210_MA : 0x18,
OCP_TRIM_220_MA : 0x19, 
OCP_TRIM_230_MA : 0x1A, 
OCP_TRIM_240_MA : 0x1B,
LNA_GAIN_MASK : 0x1F, 
LNA_GAIN_G1 : 0x20, // Default
LNA_GAIN_G2 : 0x40, 
LNA_GAIN_G3 : 0x60, 
LNA_GAIN_G4 : 0x80, 
LNA_GAIN_G5 : 0xA0, 
LNA_GAIN_G6 : 0xC0, 
LNA_BOOST_LF_MASK : 0xE7, 
LNA_BOOST_LF_DEFAULT : 0x00, // Default
LNA_BOOST_HF_MASK : 0xFC, 
LNA_BOOST_HF_OFF : 0x00, // Default
LNA_BOOST_HF_ON : 0x03, 
FIFOADDRPTR : 0x00, // Default
FIFOTXBASEADDR : 0x80, // Default
FIFORXBASEADDR : 0x00, // Default
IRQFLAGS_RXTIMEOUT_MASK : 0x80, 
IRQFLAGS_RXDONE_MASK : 0x40, 
IRQFLAGS_PAYLOADCRCERROR_MASK : 0x20, 
IRQFLAGS_VALIDHEADER_MASK : 0x10, 
IRQFLAGS_TXDONE_MASK : 0x08, 
IRQFLAGS_CADDONE_MASK : 0x04, 
IRQFLAGS_FHSSCHANGEDCHANNEL_MASK : 0x02, 
IRQFLAGS_CADDETECTED_MASK : 0x01, 
IRQFLAGS_RXTIMEOUT : 0x80, 
IRQFLAGS_RXDONE : 0x40, 
IRQFLAGS_PAYLOADCRCERROR : 0x20, 
IRQFLAGS_VALIDHEADER : 0x10, 
IRQFLAGS_TXDONE : 0x08, 
IRQFLAGS_CADDONE : 0x04, 
IRQFLAGS_FHSSCHANGEDCHANNEL : 0x02, 
IRQFLAGS_CADDETECTED : 0x01, 
MODEMSTAT_RX_CR_MASK : 0x1F, 
MODEMSTAT_MODEM_STATUS_MASK : 0xE0, 
HOPCHANNEL_PLL_LOCK_TIMEOUT_MASK : 0x7F, 
HOPCHANNEL_PLL_LOCK_FAIL : 0x80, 
HOPCHANNEL_PLL_LOCK_SUCCEED : 0x00, // Default
HOPCHANNEL_CRCONPAYLOAD_MASK : 0xBF,
HOPCHANNEL_CRCONPAYLOAD_ON : 0x40,
HOPCHANNEL_CRCONPAYLOAD_OFF : 0x00, // Default
HOPCHANNEL_CHANNEL_MASK : 0x3F, 
MODEMCONFIG1_BW_MASK : 0x0F, 
MODEMCONFIG1_BW_7_81_KHZ : 0x00, 
MODEMCONFIG1_BW_10_41_KHZ : 0x10, 
MODEMCONFIG1_BW_15_62_KHZ : 0x20, 
MODEMCONFIG1_BW_20_83_KHZ : 0x30, 
MODEMCONFIG1_BW_31_25_KHZ : 0x40, 
MODEMCONFIG1_BW_41_66_KHZ : 0x50, 
MODEMCONFIG1_BW_62_50_KHZ : 0x60, 
MODEMCONFIG1_BW_125_KHZ : 0x70, // Default
MODEMCONFIG1_BW_250_KHZ : 0x80, 
MODEMCONFIG1_BW_500_KHZ : 0x90, 
MODEMCONFIG1_CODINGRATE_MASK : 0xF1, 
MODEMCONFIG1_CODINGRATE_4_5 : 0x02,
MODEMCONFIG1_CODINGRATE_4_6 : 0x04, // Default
MODEMCONFIG1_CODINGRATE_4_7 : 0x06, 
MODEMCONFIG1_CODINGRATE_4_8 : 0x08, 
MODEMCONFIG1_IMPLICITHEADER_MASK : 0xFE, 
MODEMCONFIG1_IMPLICITHEADER_ON : 0x01, 
MODEMCONFIG1_IMPLICITHEADER_OFF : 0x00, // Default
MODEMCONFIG2_SF_MASK : 0x0F, 
MODEMCONFIG2_SF_6 : 0x60, 
MODEMCONFIG2_SF_7 : 0x70, // Default
MODEMCONFIG2_SF_8 : 0x80, 
MODEMCONFIG2_SF_9 : 0x90, 
MODEMCONFIG2_SF_10 : 0xA0, 
MODEMCONFIG2_SF_11 : 0xB0, 
MODEMCONFIG2_SF_12 : 0xC0, 
MODEMCONFIG2_TXCONTINUOUSMODE_MASK : 0xF7, 
MODEMCONFIG2_TXCONTINUOUSMODE_ON : 0x08, 
MODEMCONFIG2_TXCONTINUOUSMODE_OFF : 0x00, 
MODEMCONFIG2_RXPAYLOADCRC_MASK : 0xFB, 
MODEMCONFIG2_RXPAYLOADCRC_ON : 0x04, 
MODEMCONFIG2_RXPAYLOADCRC_OFF : 0x00, // Default
MODEMCONFIG2_SYMBTIMEOUTMSB_MASK : 0xFC, 
MODEMCONFIG2_SYMBTIMEOUTMSB : 0x00, // Default
SYMBTIMEOUTLSB_SYMBTIMEOUT : 0x64, // Default
PREAMBLELENGTHMSB : 0x00, // Default
PREAMBLELENGTHLSB : 0x08, // Default
PAYLOADLENGTH : 0x0E, // Default
PAYLOADMAXLENGTH : 0xFF, // Default
HOPPERIOD_FREQFOPPINGPERIOD : 0x00, // Default
MODEMCONFIG3_LOWDATARATEOPTIMIZE_MASK : 0xF7, 
MODEMCONFIG3_LOWDATARATEOPTIMIZE_ON : 0x08, 
MODEMCONFIG3_LOWDATARATEOPTIMIZE_OFF : 0x00, // Default
MODEMCONFIG3_AGCAUTO_MASK : 0xFB, 
MODEMCONFIG3_AGCAUTO_ON : 0x04, // Default 
MODEMCONFIG3_AGCAUTO_OFF : 0x00, 
DETECTIONOPTIMIZE_MASK : 0xF8,
DETECTIONOPTIMIZE_SF7_TO_SF12 : 0x03, // Default
DETECTIONOPTIMIZE_SF6 : 0x05,
INVERTIQ_RX_MASK : 0xBF,
INVERTIQ_RX_OFF : 0x00,
INVERTIQ_RX_ON : 0x40,
INVERTIQ_TX_MASK : 0xFE,
INVERTIQ_TX_OFF : 0x01,
INVERTIQ_TX_ON : 0x00,
DETECTIONTHRESH_SF7_TO_SF12 : 0x0A, // Default
DETECTIONTHRESH_SF6 : 0x0C,
INVERTIQ2_ON : 0x19,
INVERTIQ2_OFF : 0x1D,
DIOMAPPING1_DIO0_MASK : 0x3F,
DIOMAPPING1_DIO0_00 : 0x00, // Default
DIOMAPPING1_DIO0_01 : 0x40,
DIOMAPPING1_DIO0_10 : 0x80,
DIOMAPPING1_DIO0_11 : 0xC0,
DIOMAPPING1_DIO1_MASK : 0xCF,
DIOMAPPING1_DIO1_00 : 0x00, // Default
DIOMAPPING1_DIO1_01 : 0x10,
DIOMAPPING1_DIO1_10 : 0x20,
DIOMAPPING1_DIO1_11 : 0x30,
DIOMAPPING1_DIO2_MASK : 0xF3,
DIOMAPPING1_DIO2_00 : 0x00, // Default
DIOMAPPING1_DIO2_01 : 0x04,
DIOMAPPING1_DIO2_10 : 0x08,
DIOMAPPING1_DIO2_11 : 0x0C,
DIOMAPPING1_DIO3_MASK : 0xFC,
DIOMAPPING1_DIO3_00 : 0x00, // Default
DIOMAPPING1_DIO3_01 : 0x01,
DIOMAPPING1_DIO3_10 : 0x02,
DIOMAPPING1_DIO3_11 : 0x03,
DIOMAPPING2_DIO4_MASK : 0x3F,
DIOMAPPING2_DIO4_00 : 0x00, // Default
DIOMAPPING2_DIO4_01 : 0x40,
DIOMAPPING2_DIO4_10 : 0x80,
DIOMAPPING2_DIO4_11 : 0xC0,
DIOMAPPING2_DIO5_MASK : 0xCF,
DIOMAPPING2_DIO5_00 : 0x00, // Default
DIOMAPPING2_DIO5_01 : 0x10,
DIOMAPPING2_DIO5_10 : 0x20,
DIOMAPPING2_DIO5_11 : 0x30,
DIOMAPPING2_MAP_MASK : 0xFE,
DIOMAPPING2_MAP_PREAMBLEDETECT : 0x01,
DIOMAPPING2_MAP_RSSI : 0x00, // Default
PLLHOP_FASTHOP_MASK : 0x7F,
PLLHOP_FASTHOP_ON : 0x80,
PLLHOP_FASTHOP_OFF : 0x00, // Default
TCXO_TCXOINPUT_MASK : 0xEF,
TCXO_TCXOINPUT_ON : 0x10,
TCXO_TCXOINPUT_OFF : 0x00, // Default
PADAC_20DBM_MASK : 0xF8,
PADAC_20DBM_ON : 0x07,
PADAC_20DBM_OFF : 0x04, // Default
BITRATEFRAC_MASK : 0xF0,
PLL_BANDWIDTH_MASK : 0x3F,
PLL_BANDWIDTH_75 : 0x00,
PLL_BANDWIDTH_150 : 0x40,
PLL_BANDWIDTH_225 : 0x80,
PLL_BANDWIDTH_300 : 0xC0, // Default
};

function SX(options) {
  this.spi = options.spi;
  this.cs = options.cs;
  this.rst = options.rst;
  if (this.rst)
    digitalPulse(this.rst,0,1); // 1ms low
  setTimeout(this.init.bind(this), 7);
  this.options = {};
  this.state = "";
}

SX.prototype.w = function(a,v) {
  if ("number"!=typeof a)throw"!";
  if ("number"==typeof v && isNaN(v))throw"!";
  this.spi.write(a|128,v, this.cs);
};

SX.prototype.r = function(a, s) {
  if ("number"!=typeof a)throw"!";
  if (s) {
    var d = new Uint8Array(s+1);
    d[0]=a&127;
    d = this.spi.send(d, this.cs);
    return new Uint8Array(d.buffer, 1);
  } else {
    // no size, just 1
    return this.spi.send([a&127,0], this.cs)[1];
  }
};

SX.prototype.mask = function(a,mask,v) {
  this.w( a, this.r(a) & mask | v);
};

SX.prototype.setOpMode = function(v) {
 this.mask( REG.OPMODE, RF.OPMODE_MASK, v );
};

SX.prototype.init = function() {
  var v = this.r(REG.VERSION);
  if (v===0 || v==255) throw new Error("Radio not found!");
  
  this.setOpMode(RF.OPMODE_SLEEP);
  this.mask(REG.OPMODE, RF.OPMODE_LONGRANGEMODE_MASK, RF.OPMODE_LONGRANGEMODE_ON ); 
  this.w(REG.DIOMAPPING1, 0x00);
  this.w(REG.DIOMAPPING2, 0x00);
  this.w(REG.PAYLOADMAXLENGTH, 0x40);
};

SX.prototype.rx = function(callback) {
  this.rxCallback = callback;
  if (this.options.iqInverted) {
    this.mask(REG.INVERTIQ, RF.INVERTIQ_TX_MASK & RF.INVERTIQ_RX_MASK,
              RF.INVERTIQ_RX_ON | RF.INVERTIQ_TX_OFF);
    this.w(REG.INVERTIQ2, RF.INVERTIQ2_ON );
  } else {
    this.mask(REG.INVERTIQ, RF.INVERTIQ_TX_MASK & RF.INVERTIQ_RX_MASK,
              RF.INVERTIQ_RX_OFF | RF.INVERTIQ_TX_OFF );
    this.w(REG.INVERTIQ2, RF.INVERTIQ2_OFF );
  }  
  // TODO: ERRATA 2.3 - Receiver Spurious Reception of a LoRa Signal?
  if (this.options.freqHopOn) {
    this.w( REG.IRQFLAGSMASK,
          RF.IRQFLAGS_VALIDHEADER |
          RF.IRQFLAGS_TXDONE |
          RF.IRQFLAGS_CADDONE |
          RF.IRQFLAGS_CADDETECTED );

    // DIO0=RxDone, DIO2=FhssChangeChannel
    this.mask(REG.DIOMAPPING1, RF.DIOMAPPING1_DIO0_MASK & RF.DIOMAPPING1_DIO2_MASK,
              RF.DIOMAPPING1_DIO0_00 | RF.DIOMAPPING1_DIO2_00);
  } else {
    this.w( REG.IRQFLAGSMASK,
          RF.IRQFLAGS_VALIDHEADER |
          RF.IRQFLAGS_TXDONE |
          RF.IRQFLAGS_CADDONE |
          RF.IRQFLAGS_FHSSCHANGEDCHANNEL |
          RF.IRQFLAGS_CADDETECTED );

    // DIO0=RxDone
    this.mask(REG.DIOMAPPING1, RF.DIOMAPPING1_DIO0_MASK, RF.DIOMAPPING1_DIO0_00 );
  }
  this.w( REG.FIFORXBASEADDR, 0 );
  this.w( REG.FIFOADDRPTR, 0 );
 
  this.state = "RX_RUNNING";
  this.setOpMode( this.options.rxContinuous ? RF.OPMODE_RECEIVER : RF.OPMODE_RECEIVER_SINGLE );
};

SX.prototype.tx = function() {
  if (this.options.freqHopOn) {
    this.w(REG.IRQFLAGSMASK, RF.IRQFLAGS_RXTIMEOUT |
           RF.IRQFLAGS_RXDONE |
           RF.IRQFLAGS_PAYLOADCRCERROR |
           RF.IRQFLAGS_VALIDHEADER |
           RF.IRQFLAGS_CADDONE |
           RF.IRQFLAGS_CADDETECTED );
    // DIO0=TxDone, DIO2=FhssChangeChannel
    this.mask(REG.DIOMAPPING1, 
              RF.DIOMAPPING1_DIO0_MASK & RF.DIOMAPPING1_DIO2_MASK,
              RF.DIOMAPPING1_DIO0_01 | RF.DIOMAPPING1_DIO2_00 );
  } else {
    this.w(REG.IRQFLAGSMASK, RF.IRQFLAGS_RXTIMEOUT |
           RF.IRQFLAGS_RXDONE |
           RF.IRQFLAGS_PAYLOADCRCERROR |
           RF.IRQFLAGS_VALIDHEADER |
           RF.IRQFLAGS_CADDONE |
           RF.IRQFLAGS_FHSSCHANGEDCHANNEL |
           RF.IRQFLAGS_CADDETECTED );
    // DIO0=TxDone
    this.mask(REG.DIOMAPPING1, RF.DIOMAPPING1_DIO0_MASK, RF.DIOMAPPING1_DIO0_01);
  }

  this.state = "TX_RUNNING";
  this.setOpMode(RF.OPMODE_TRANSMITTER);
};

SX.prototype.sleep = function() {
    this.setOpMode( RF.OPMODE_SLEEP );
    this.state = "IDLE";
};
SX.prototype.standby = function() {
    this.setOpMode( RF.OPMODE_STANDBY );
    this.state = "IDLE";
};

SX.prototype.send = function(data, callback) {
  this.txCallback = callback;
  if(this.options.iqInverted) {
    this.mask(REG.INVERTIQ, RF.INVERTIQ_TX_MASK & RF.INVERTIQ_RX_MASK,
              RF.INVERTIQ_RX_OFF | RF.INVERTIQ_TX_ON);
    this.w(REG.INVERTIQ2, RF.INVERTIQ2_ON );
  } else {
    this.mask(REG.INVERTIQ, RF.INVERTIQ_TX_MASK & RF.INVERTIQ_RX_MASK,
              RF.INVERTIQ_RX_OFF | RF.INVERTIQ_TX_OFF );
    this.w(REG.INVERTIQ2, RF.INVERTIQ2_OFF );
  }

  // Initializes the payload size
  this.w( REG.PAYLOADLENGTH, data.length );
  // Full buffer used for Tx
  this.w( REG.FIFOTXBASEADDR, 0 );
  this.w( REG.FIFOADDRPTR, 0 );

  var s = (function () {    
    this.w(REG.FIFO, data);
    this.tx();
  }).bind(this);
  
  // FIFO operations can not take place in Sleep mode
  if((this.r(REG.OPMODE) & ~RF.OPMODE_MASK) == RF.OPMODE_SLEEP) {
    this.standby();
    setTimeout(s, 1);
  } else {
    s();
  }
};

SX.prototype.getStatus = function() {
  var f = this.r(REG.IRQFLAGS);
  return {
    rxDone : !!(f&RF.IRQFLAGS_RXDONE),
    rxTimeout : !!(f&RF.IRQFLAGS_RXTIMEOUT),
    crcError : !!(f&RF.IRQFLAGS_PAYLOADCRCERROR),
    validHeader : !!(f&RF.IRQFLAGS_VALIDHEADER),
    txDone : !!(f&RF.IRQFLAGS_TXDONE),
    cadDone : !!(f&RF.IRQFLAGS_CADDONE),
    changedChannel : !!(f&RF.IRQFLAGS_FHSSCHANGEDCHANNEL),
    cadDetected : !!(f&RF.IRQFLAGS_CADDETECTED),
  };
};

SX.prototype.onIRQ = function() {
  var irqFlags = this.r(REG.IRQFLAGS);
  if (irqFlags&RF.IRQFLAGS_RXDONE) {    
    this.w( REG.IRQFLAGS, RF.IRQFLAGS_RXDONE ); // clear 
    if (irqFlags & RF.IRQFLAGS_PAYLOADCRCERROR) {
      this.w( REG.IRQFLAGS, RF.IRQFLAGS_PAYLOADCRCERROR ); // clear 

      if (!this.options.rxContinuous)
        this.state = "IDLE";
      if (this.rxCallback) this.rxCallback("RxError");
      return;
    }

    var inf = {};
    inf.snr = this.r( REG.PKTSNRVALUE );
    inf.rssi = this.r( REG.PKTRSSIVALUE );
    // TODO: some fiddling of snr/rssi
    var nBytes = this.r( REG.RXNBBYTES );
    inf.data = this.r( REG.FIFO, nBytes);
    

    if (!this.options.rxContinuous)
      this.state = "IDLE";
    if (this.rxCallback) 
      this.rxCallback(null, inf);
  }
  if (irqFlags&RF.IRQFLAGS_TXDONE) {    
    this.w( REG.IRQFLAGS, RF.IRQFLAGS_TXDONE ); // clear 
    if (this.txCallback) this.txCallback();
  }
};

SX.prototype.commonSetConfig = function(options) {
  options.freq = options.freq||868000000;
  var f = 0|(options.freq / 61.03515625 );
  this.w( REG.FRFMSB, ( f >> 16 ) & 0xFF );
  this.w( REG.FRFMID, ( f >> 8 ) & 0xFF );
  this.w( REG.FRFLSB, f & 0xFF );
  
  options.power = options.power||14;//dbM
  options.bandwidth = 0|options.bandwidth;//[0: 125 kHz, 1: 250 kHz, 2: 500 kHz]
  if( options.bandwidth > 2 )
    throw new Error("When using LoRa modem only bandwidths 125, 250 and 500 kHz are supported");
  options.bandwidth += 7;
  options.datarate = options.datarate||7; // spreading factor, 7..12  
  options.datarate = E.clip(options.datarate,6,12);  
  if(((options.bandwidth == 7 ) && 
       ((options.datarate == 11 ) || (options.datarate == 12 ))) ||
     ((options.bandwidth == 8 ) && ( options.datarate == 12 ))) {
    this.LowDatarateOptimize = 0x01;
  } else {
    this.LowDatarateOptimize = 0x00;
  }
  options.coderate = options.coderate||1; // [1: 4/5, 2: 4/6, 3: 4/7, 4: 4/8]
  options.preambleLen = options.preambleLen||8;
  options.fixLen = 0|options.fixLen; // fixed length payload? 0/1
  options.crcOn = 0|options.crcOn; // CRC on? 0/1
  options.freqHopOn = 0|options.freqHopOn; // frequency hopping on? 0/1  
  options.iqInverted = 0|options.iqInverted; // 0/1
  options.rxContinuous = 0|options.rxContinuous; // continuous reception?
  options.symbTimeout = options.symbTimeout||5; // symbol timeout when rxContinuous = true
  
  for (var i in options)
    this.options[i]=options[i];
  
  if(this.freqHopOn)   {
    options.hopPeriod = options.hopPeriod||4;
    this.mask( REG.PLLHOP, RF.PLLHOP_FASTHOP_MASK, RF.PLLHOP_FASTHOP_ON );
    this.w( REG.HOPPERIOD, options.hopPeriod );
  }
  
  this.mask( REG.MODEMCONFIG1, 
         RF.MODEMCONFIG1_BW_MASK &
         RF.MODEMCONFIG1_CODINGRATE_MASK &
         RF.MODEMCONFIG1_IMPLICITHEADER_MASK,
        ( options.bandwidth << 4 ) | ( options.coderate << 1 ) | options.fixLen );  
  this.mask(REG.MODEMCONFIG3, RF.MODEMCONFIG3_LOWDATARATEOPTIMIZE_MASK,
            ( this.LowDatarateOptimize << 3 ));
  
  this.mask( REG.DETECTOPTIMIZE, 
            RF.DETECTIONOPTIMIZE_MASK,
            (options.datarate == 6) ? RF.DETECTIONOPTIMIZE_SF6 : RF.DETECTIONOPTIMIZE_SF7_TO_SF12);
  this.w( REG.DETECTIONTHRESHOLD, (options.datarate == 6) ? RF.DETECTIONTHRESH_SF6 : RF.DETECTIONTHRESH_SF7_TO_SF12 );
  
  return options;
};

SX.prototype.setRxConfig = function( options ) {
  options = this.commonSetConfig(options);

  this.mask( REG.MODEMCONFIG2,
         RF.MODEMCONFIG2_SF_MASK &
         RF.MODEMCONFIG2_RXPAYLOADCRC_MASK &
         RF.MODEMCONFIG2_SYMBTIMEOUTMSB_MASK,
        ( options.datarate << 4 ) | ( options.crcOn << 2 ) |
        ( ( options.symbTimeout >> 8 ) & ~RF.MODEMCONFIG2_SYMBTIMEOUTMSB_MASK ) );


  this.w( REG.SYMBTIMEOUTLSB, options.symbTimeout & 0xFF );
  this.w( REG.PREAMBLEMSB, ( options.preambleLen >> 8 ) & 0xFF );
  this.w( REG.PREAMBLELSB,  options.preambleLen & 0xFF );

  if (options.fixLen)
    this.w( REG.PAYLOADLENGTH, options.payloadLen );

  // TODO: erratas
};

SX.prototype.setTxConfig = function( options ) {
  options = this.commonSetConfig(options);
  var paConfig = this.r( REG.PACONFIG );
  var paDac = this.r( REG.PADAC );    

  paConfig = ( paConfig & RF.PACONFIG_PASELECT_MASK ) | RF.PACONFIG_PASELECT_RFO;
  // TODO: if 525000000 and  SX1276MB1LAS , use PABOOST, not RFO
  paConfig = ( paConfig & RF.PACONFIG_MAX_POWER_MASK ) | 0x70;

  if (paConfig & RF.PACONFIG_PASELECT_PABOOST) {
    if (options.power > 17) 
      paDac = ( paDac & RF.PADAC_20DBM_MASK ) | RF.PADAC_20DBM_ON;
    else
      paDac = ( paDac & RF.PADAC_20DBM_MASK ) | RF.PADAC_20DBM_OFF;
    if (paDac & RF.PADAC_20DBM_ON) {
      options.power = E.clip(options.power,5,20);
      paConfig = ( paConfig & RF.PACONFIG_OUTPUTPOWER_MASK ) | ( options.power - 5 ) & 0x0F;
    } else {
      options.power = E.clip(options.power,2,17);
      paConfig = ( paConfig & RF.PACONFIG_OUTPUTPOWER_MASK ) | ( options.power - 2 ) & 0x0F;
    }
  } else {
    options.power = E.clip(options.power,-1,14);
    paConfig = ( paConfig & RF.PACONFIG_OUTPUTPOWER_MASK ) | ( options.power + 1 ) & 0x0F;
  }
  this.w( REG.PACONFIG, paConfig );
  this.w( REG.PADAC, paDac );

  this.mask(REG.MODEMCONFIG2, RF.MODEMCONFIG2_SF_MASK & RF.MODEMCONFIG2_RXPAYLOADCRC_MASK,
            ( options.datarate << 4 ) | ( options.crcOn << 2 ) );

  this.w( REG.PREAMBLEMSB, ( options.preambleLen >> 8 ) & 0x00FF );
  this.w( REG.PREAMBLELSB, options.preambleLen & 0xFF );
};

exports.connect = function(options) {
  return new SX(options);
};


