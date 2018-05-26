/*<!-- Copyright (c) 2018 Gordon Williams. See the file LICENSE for copying permission. -->
Pixl.js Temperature Display
===========================

* KEYWORDS: Temperature Sensor,Display
* USES: Pixl.js,Graphics

![Pixl.js Temperature Display](Pixl.js Temperature Display.jpg)

[Pixl.js](/Pixl.js) has an on-chip temperature sensor, and can be set up to
display the temperature with tiny amount of code.

Simply upload this to [Pixl.js](/Pixl.js) and it'll display the temperature
on the screen in a large font.

*/

function onTimer() {
  // Get the temperature as a string
  var t = E.getTemperature().toFixed(1);
  // Clear display
  g.clear();
  // Use the small font for a title
  g.setFontBitmap();
  g.drawString("Temperature:");
  // Use a large font for the value itself
  g.setFontVector(40);
  g.drawString(t, (g.getWidth()-g.stringWidth(t))/2,10);
  // Update the screen
  g.flip();
}

// Update temperature every 2 seconds
setInterval(onTimer,2000);
// Update temperature immediately
onTimer();
