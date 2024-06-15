/** Some tests (jest) for the air velocity calculations */

const fs3000 = require('./FS3000');

/**
 * Air velocity tables form the datasheet
 * 
 * FS3000-1005 
 * | Air Velocity (m/sec) | Output (Count) |
 * | 0    | 409  |
 * | 1.07 | 915  |
 * | 2.01 | 1522 |
 * | 3.00 | 2066 |
 * | 3.97 | 2523 |
 * | 4.96 | 2908 |
 * | 5.98 | 3256 |
 * | 6.99 | 3572 |
 * | 7.23 | 3686 |
 * 
 * FS3000-1015
 * | Air Velocity (m/sec) | Output (Count) |
 * | 0     | 409  |
 * | 2.00  | 1203 |
 * | 3.00  | 1597 |
 * | 4.00  | 1908 |
 * | 5.00  | 2187 |
 * | 6.00  | 2400 |
 * | 7.00  | 2629 |
 * | 8.00  | 2801 |
 * | 9.00  | 3006 |
 * | 10.00 | 3178 |
 * | 11.00 | 3309 |
 * | 13.00 | 3563 |
 * | 15.00 | 3686 |
 */

test('The minimum value should return 0 for both variants', () => {
    let fs1005 = fs3000.connect({})
    expect(fs1005._calc(409)).toBe(0);

    let fs1015 = fs3000.connect({}, true)
    expect(fs1015._calc(409)).toBe(0);
});

test('Values over the maximum should return the maximum air velocity', () => {
    let fs1005 = fs3000.connect({})
    expect(fs1005._calc(4000)).toBe(7.23);

    let fs1015 = fs3000.connect({}, true)
    expect(fs1015._calc(4000)).toBe(15);
});

test('Test some values', () => {
    /**
     * FS3000-1005
     * | 3.97 | 2523 |
     * | 4.96 | 2908 |
     * halfway between 2523 and 2908 is 2715.5
     * 3.97 + (4.96 - 3.97) * (2715.5 - 2523) / (2908 - 2523) = 4.46
     */
    let fs1005 = fs3000.connect({})
    expect(fs1005._calc(2715)).toBeCloseTo(4.46);

    /** FS3000-1015
     * | 10.00 | 3178 |
     * | 11.00 | 3309 |
     * halfway between 3178 and 3309 is 3243
     * 10 + (11 - 10) * (3243 - 3178) / (3309 - 3178) = 10.496
     */
    let fs1015 = fs3000.connect({}, true)
    expect(fs1015._calc(3243)).toBeCloseTo(10.496);
});