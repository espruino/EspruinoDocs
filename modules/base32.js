/* Copyright (c) 2020 Dominik Enzinger. See the file LICENSE for copying permission. */
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/// Decode the supplied encoded base 32 string into an ArrayBuffer
exports.decode = function(encoded) {
  encoded = encoded.toUpperCase();
  const result = new Uint8Array(Math.floor(encoded.length * 5 / 8));
  let buffer = 0,
      next = 0,
      bitsLeft = 0,
      charValue = 0;
  for ( let i in encoded ) {
    charValue = BASE32_CHARS.indexOf(encoded.charAt(i));
    buffer = (buffer << 5) | charValue & 31;
    bitsLeft += 5;
    if (bitsLeft >= 8) {
      bitsLeft -= 8;
      result[next++] = (buffer >> bitsLeft) & 0xFF;
    }
  }
  return result.buffer;
};
