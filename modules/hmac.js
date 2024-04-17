/* Copyright (c) 2020 Dominik Enzinger. See the file LICENSE for copying permission. */
function bitwiseOr0x36(b) {"compiled"; return b ^ 0x36; }

function bitwiseOr0x5c(b) {"compiled"; return b ^ 0x5c; }

/// Returns an MAC instance using the given hash. Eg. HMAC(key, require('crypto').SHA1, 64, 20)
exports.HMAC = function(key, hash, blockSize, outputSize) {
  if ( key.byteLength > blockSize )
    key = hash(key);
  this.hash = hash;
  this.keyLength = Math.max(blockSize, key.byteLength);
  key = new Uint8Array(key, 0, this.keyLength);
  this.oBuf = new Uint8Array(this.keyLength + outputSize);
  this.oBuf.set(key.map(bitwiseOr0x5c).buffer, 0);
  this.iKeyPad = key.map(bitwiseOr0x36).buffer;
};


/// Take a message as an arraybuffer or string, return an arraybuffer
exports.HMAC.prototype.digest = function(message) {
  const iBuf = new Uint8Array(this.keyLength + message.byteLength);
  iBuf.set(this.iKeyPad, 0);
  iBuf.set(message, this.keyLength);
  this.oBuf.set(this.hash(iBuf), this.keyLength);
  return this.hash(this.oBuf);
};

function FixedHMAC(key, messageSize, hash, blockSize, outputSize) {
  exports.HMAC.call(this, key, hash, blockSize, outputSize);
  this.iBuf = new Uint8Array(this.keyLength + messageSize);
  this.iBuf.set(this.iKeyPad, 0);
  delete this.ikeyPad;
};

/// Take a message as an arraybuffer or string, return an arraybuffer
FixedHMAC.prototype.digest = function(message) {
  this.iBuf.set(message, this.keyLength);
  this.oBuf.set(this.hash(this.iBuf), this.keyLength);
  return this.hash(this.oBuf);
};

/// Create a basic HMAC using SHA1
exports.SHA1 = function(key) {
  return new exports.HMAC(key, require('crypto').SHA1, 64, 20);
};

/// FixedSHA1 is faster than SHA1, but digested message must always be the same fixed length.
exports.FixedSHA1 = function(key, messageSize) {
  return new FixedHMAC(key, messageSize, require('crypto').SHA1, 64, 20);
};

/// Create a basic HMAC using SHA256
exports.SHA256 = function(key) {
  return new exports.HMAC(key, require('crypto').SHA256, 64, 32);
};

/// FixedSHA256 is faster than SHA256, but digested message must always be the same fixed length.
exports.FixedSHA256 = function(key, messageSize) {
  return new FixedHMAC(key, messageSize, require('crypto').SHA256, 64, 32);
};
