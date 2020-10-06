/* Copyright (c) 2020 Dominik Enzinger. See the file LICENSE for copying permission. */
const HMAC = require('hmac');
const base32 = require('base32');

/// For internal use - generates the one time password
function generateOtp(hmac, digits) {
  "compiled";
  const o = hmac[hmac.byteLength - 1] & 0x0F;
  const dt = ((hmac[o] & 0x7f) << 24) | (hmac[o + 1] << 16) | (hmac[o + 2] << 8) | hmac[o + 3];
  let result = '' + dt % Math.pow(10, digits);
  while ( result.length < digits ) {
    result = '0' + result;
  }
  return result;
}

function TOTP(secret) {
  this.hmac = new HMAC.FixedSHA1(base32.decode(secret), 8);
  this.message = new Uint8Array(8);
};

/// Generate a TOTP with the given timestamp, period, and number of digits.
/// For example totp.generate(getTime(), 6/*digits*, 30/*seconds*/) 
TOTP.prototype.generate = function(timestamp, digits, tokenPeriod) {
  const epoch = Math.floor(timestamp / tokenPeriod);
  this.message.set([epoch >> 24 & 0xFF, epoch >> 16 & 0xFF, epoch >> 8 & 0xFF, epoch & 0xFF], 4);
  const hmac = this.hmac.digest(this.message.buffer);
  return generateOtp(hmac, digits);
};

/// Create a TOTP generator with a secret code in base32
exports.create = function(secret) {
  return new TOTP(secret);
};
