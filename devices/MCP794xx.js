const C = {
    /// RTC & SRAM access
    addr: 0b1101111,
    /// EEPROM access address
    eepA: 0b1010111
}
let bcd2dec = (val) => ((val >> 4) * 10) + (val & 0xF)
let dec2bcd = (val) => (val / 10) << 4 | (val % 10)

class MCP794xx {
    constructor(i2c) {
        this._i2c = i2c
    }


    _rd (reg, cnt) { this._i2c.writeTo(C.addr, reg); return this._i2c.readFrom(C.addr, cnt || 1); }
    _wr (reg, data) { this._i2c.writeTo(C.addr, [reg].concat(data)); }

    /// read from the "eeprom" address of the MCP
    _eRd (reg, cnt) { this._i2c.writeTo(C.eepA, reg); return this._i2c.readFrom(C.eepA, cnt || 1); }

    // write to the "eeprom" address of the MCP
    _eWr (reg, data) { this._i2c.writeTo(C.eepA, [reg].concat(data)); }

    /// reads current date&time and returns it as a Date object
    getDateTime () {
        var d = this._rd(0, 7);
        var sec = bcd2dec(d[0] & 0x7f);
        var min = bcd2dec(d[1] & 0x7f);

        var hr = bcd2dec(d[2] & 0x7f);
        if (d[2] & 0b1000000) {
            // bit 6 = 1 -> we are in 12hour format
            hr = bcd2dec(d[2] & 0x7f);
            if (hr == 12) { hr = 0; }
            // bit 5 AM/PM: AM/PM Indicator bit
            // 1 = PM
            // 0 = AM
            if (d[2] & 0b100000) { hr += 12; }
        }
        var day = bcd2dec(d[4] & 0x3f);
        var month = bcd2dec(d[5] & 0x1f);
        var year = bcd2dec(d[6]);
        return new Date(2000 + year, month - 1, day, hr, min, sec);
    }

    // Sets the date from the given Date object
    setDateTime (d) {
        if (!(d instanceof Date)) { throw "I need a Date object!" }
        var year = dec2bcd(d.getFullYear() - 2000)
        var month = dec2bcd(d.getMonth() + 1)
        var day = dec2bcd(d.getDate())
        var hour = dec2bcd(d.getHours())
        var min = dec2bcd(d.getMinutes())
        var sec = dec2bcd(d.getSeconds()) | 0x80 // bit 7 ST: Start Oscillator bit
        this._wr(0, [sec, min, hour])
        this._wr(4, [day, month, year])
    }

    enableVbat() {
        var rtcwkreg = this._rd(3, 1)
        // bit 3 VBATEN: External Battery Backup Supply (VBAT) Enable bit
        // 1 = VBAT input is enabled
        // 0 = VBAT input is disabled
        this._wr(3, rtcwkreg | 0b1000)
    }

    /// Reads the factory programmed 48 bit EUI. Only for MCP794x1
    readEUI48() { return this._eRd(0xf2, 6) }

    /// Reads the factory programmed 64 bit EUI. Only for MCP794x2
    readEUI64(){ return this._eRd(0xf0, 8) }

    /// Read bytes from the battery backed SRAM
    sramRead(startAddress, numBytes) {
        if (startAddress < 0x20) { throw "invalid startAddress!" }
        if (startAddress + numBytes > 0x5f + 1) { throw "too many bytes!" }
        return this._rd(startAddress, numBytes)
    }

    /// Writes bytes to the battery backed SRAM
    sramWrite (startAddress, data) {
        if (startAddress < 0x20) { throw "invalid startAddress!" }
        if (startAddress + data.length > 0x5f + 1) { throw "too many bytes!" }
        return this._wr(startAddress, data);
    }

    /// Reads data from the EEPROM
    eepromRead(startAddress, numBytes) {
        if (startAddress + numBytes > 0x7f + 1) { throw "too many bytes!" }
        return this._eRd(startAddress, numBytes)
    }

    /// Writes data to the EEPROM. Handles paging, you can give as much data, as much data as you want
    eepromWrite(startAddress, data) {
        var len = data.length
        if (startAddress + len > 0x7f + 1) { throw "too many bytes!" }
        var startIndex = 0

        /// writing to the eeprom must be done in pages. 
        /// if data goes over the page boundary, bytes overflow to the begining of the page ->
        /// writing must respect paging: write only till the end of the page, and write again to the next page
        /// a recursive solution would be trivial, but can overflow the stack...
        while (len > 0) {
            var pagePos = startAddress % 8
            var morePage = pagePos + len > 8
            if (morePage) {
                var inThisPage = 8 - pagePos
                // print(`wr ${startAddress}, sI: ${startIndex}, iTP: ${inThisPage}`)
                // .splice could be more memory effecient, but TypedArrays don't have splice
                var d = data.slice(startIndex, startIndex + inThisPage)
                // print('d: ', d)
                this._eWr(startAddress, d)

                startAddress += inThisPage
                startIndex += inThisPage
                len -= inThisPage
            } else {
                // print(`last write to ${startAddress}, sI: ${startIndex}, len: ${len}`)
                var d = data.slice(startIndex)
                // print('d: ', d)
                this._eWr(startAddress, d)
                return
            }
        }
    }
}
exports.connect = (i2c) => new MCP794xx(i2c)
