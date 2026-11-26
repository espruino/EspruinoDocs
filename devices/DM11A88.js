/* Copyright (c) 2026  MaBecker, See the file LICENSE for copying permission. */

const ROW_MASKS = new Uint8Array([0xFE, 0xFD, 0xFB, 0xF7, 0xEF, 0xDF, 0xBF, 0x7F]);

/**
 * Connect to one or more cascaded DM11A88 8x8 LED matrix modules.
 * @param {object} options
 * @param {SPI} options.spi - Configured SPI object (e.g., SPI1)
 * @param {Pin} options.lat - Latch / CS pin (e.g., B6)
 * @param {number} [options.modules=1] - Number of cascaded 8x8 modules
 * @param {number} [options.interval=1.5] - Row scan interval in ms (min 0.5)
 * @param {boolean} [options.reverseOrder=false] - Set true if wired right-to-left
 * @returns {Graphics} Espruino Graphics instance with .start() and .stop()
 */
exports.connect = function(options) {
  options = options || {};
  const spi = options.spi;
  const lat = options.lat;
  if (!spi || !lat) throw new Error("DM11A88: 'spi' and 'lat' are required.");

  const numModules = options.modules || 1;
  const lastMod = numModules - 1;
  const reverseOrder = !!options.reverseOrder;
  let scanInterval = Math.max(0.5, options.interval || 1.5);

  const g = Graphics.createArrayBuffer(8 * numModules, 8, 1, { msb: true });
  const buf = new Uint8Array(g.buffer);
  const txBuf = new Uint8Array(2 * numModules);
  const send = spi.send.bind(spi);

  let row = 0;
  let timerId = null;

  function clearDisplay() {
    for (let m = 0; m < numModules; m++) {
      txBuf[m << 1] = 0xFF;       // Rows OFF (active-low)
      txBuf[(m << 1) + 1] = 0x00; // Columns OFF (active-high)
    }
    send(txBuf, lat);
  }

  function scanNextRow() {
    const rowMask = ROW_MASKS[row];
    const rowOffset = row * numModules;
    for (let m = 0; m < numModules; m++) {
      const txIdx = m << 1;
      const modIdx = reverseOrder ? m : (lastMod - m);
      txBuf[txIdx]     = rowMask;
      txBuf[txIdx + 1] = buf[rowOffset + modIdx];
    }

    send(txBuf, lat);
    row = (row + 1) & 7;
  }

  g.start = function() {
    if (timerId === null) {
      timerId = setInterval(scanNextRow, scanInterval);
    }
    return g;
  };

  g.stop = function() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
    clearDisplay();
    return g;
  };

  g.setScanInterval = function(ms) {
    scanInterval = Math.max(0.5, ms);
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = setInterval(scanNextRow, scanInterval);
    }
    return g;
  };
  return g.start();
};
