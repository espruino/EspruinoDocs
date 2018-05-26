/*<!-- Copyright (c) 2018 Gordon Williams. See the file LICENSE for copying permission. -->
Pixl.js Clock
=============

* KEYWORDS: Clock,Watch,Time,Date,Display
* USES: Pixl.js,Graphics

![Pixl.js Clock](Pixl.js Clock.jpg)

This example turns [Pixl.js](/Pixl.js) into a simple clock,
displaying the current time and date.

Copy this to the right-hand side of the IDE, make sure `Set Current Time`
is set in `Settings` -> `Communications`, and upload.

You can always update the time manually using the command
`setTime(Date.parse("2018-05-16T13:42:34") / 1000)`, with
the correct date string.

*/
// Enable 'Set Current Time' in Settings -> Communications before sending

function onSecond() {
  // Called every second
  var t = new Date(); // get the current date and time
  g.clear();

  // Draw the time
  g.setFontVector(30);
  var time = t.getHours()+":"+("0"+t.getMinutes()).substr(-2);
  var seconds = ("0"+t.getSeconds()).substr(-2);
  g.drawString(time,95 - g.stringWidth(time),10);
  g.setFontVector(20);
  g.drawString(seconds,95,20);
  // Draw the date
  // Get the date as a string by removing the time from the end of it
  var date = t.toString().replace(/\d\d:.*/,"");
  g.setFontBitmap();
  g.drawString(date,0,0);

  g.flip();
}

// Call onSecond every second
setInterval(onSecond, 1000);
