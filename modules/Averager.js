/* Copyright (c) 2020 Gordon Williams. See the file LICENSE for copying permission. */

/** Create a new Series of 'size' elements,
with the given options:
{
  scale : optional scale to store data in a Int16Array (default 1)
  offset : optional offset to store data in a Int16Array (default 0)
}
*/
function Series(size, options) {
  options = options||{};
  options.scale = options.scale||1;
  options.offset = options.offset||0;
  options.format = options.format||Int16Array;
  // TODO: store in one array to get better packing?
  Object.assign(this,{
    options : options,
    buckets : new options.format(size), ///< current readings
    lastBuckets : new options.format(size), ///< last readings
    avr : new options.format(size), ///< average readings
    avrCnt : 0, ///< number of readings in average
    sum : 0, ///< Current bucket sum
    cnt : 0, ///< Current number of readings in bucket
    lastBucket : 0, ///< The current bucket number
  });
}
Series.prototype.add = function(value, bucket) {
  //print(bucket, this.lastBucket);
  if (bucket != this.lastBucket) {
    this.sum = this.cnt = 0;
    if (bucket < this.lastBucket) {
      // setup last set of readings
      this.lastBuckets.set(this.buckets);
      // handle average
      if (this.avrCnt==0) {
        this.avr.set(this.buckets);
      } else {
        var n = this.avrCnt;
        for (var i=0;i<this.lastBucket;i++)
          this.avr[i] = (this.avr[i]*n + this.buckets[i]) / (n+1);
      }
      this.avrCnt++;
      // clear current readings
      this.buckets.fill(0);
    }
    this.lastBucket = bucket;
  }
  this.sum += (value - this.options.offset) * this.options.scale;
  this.cnt ++;
  this.buckets[bucket] = Math.round(this.sum/this.cnt);
};
/// Get the current array of values
Series.prototype.getCurrent = function() {
  return this.buckets.slice().map(x => (x/this.options.scale)+this.options.offset );
};
/// Get an array for the last series
Series.prototype.getLast = function() {
  return this.lastBuckets.slice().map(x => (x/this.options.scale)+this.options.offset );
};
/// Get an array for the average
Series.prototype.getAvr = function() {
  return this.avr.slice().map(x => (x/this.options.scale)+this.options.offset );
};

/// Create a new Averager with series for hours, days and months. See Series for options
function Averager(options) {
  this.series = {
    hours : new Series(24*4, options),
    days : new Series(31, options),
    months : new Series(12, options),
  };
}
/// Add a new value to the averager. If date is not specified, the current date is used
Averager.prototype.add = function(value, date) {
  if (date===undefined)
    date = new Date();
  this.series.hours.add(value, Math.round(date.getHours()*4 + date.getMinutes()/15));
  this.series.days.add(value, date.getDate()-1);
  this.series.months.add(value, date.getMonth());
};
/// Print all the current data from all series' as JSON
Averager.prototype.print = function() {
  print('{');
  var last = Object.keys(this.series).pop();
  for (var k in this.series) {
    print('"'+k+'":{"current":',this.series[k].getCurrent(),',');
    print('"avr":',this.series[k].getAvr(),',');
    print('"last":',this.series[k].getLast(),k==last?'}}':'},');
  }
};

exports.Series = Series;
exports.Averager = Averager;
