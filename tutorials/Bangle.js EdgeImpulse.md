<p align="left">
  <img src="https://banglejs.com/img/bangle-leaf.jpg" width="700" title="hover text">
</p>

* KEYWORDS: Tutorials, Bangle.js, Edge Impulse, AI, Machine Learning
* USES: Bangle.js

# Use Bangle.js and Edge Impulse for Machine Learning 

**Introduction…**
-----------------

In this tutorial you will learn how to get started with Machine Learning on your Bangle.js watch. Specifically you will build and train a model learning to recognize different movements of your watch hand. The steps include how to collect data, how to use Edge Impulse for the machine learning part and how to finally upload the learned model back to the watch and utilise it there.

**Prerequisites**
-----------------

**Hardware**

* [Bangle JS, version 1](https://shop.espruino.com/banglejs) (v2 will be supported once it’s available)
  * Theoretically the Bangle Emulator might work as well, but you can’t of course collect real accelerometer or heart rate data with an emulator!
* Computer with Bluetooth (BLE)
* Get the watch up and running by following these [guidelines](https://banglejs.com/start)
… and connected by these [guidelines](https://www.espruino.com/Quick+Start+BLE#banglejs)


**Software**

* Create an Edge Impulse account for free [here](https://www.edgeimpulse.com/)
* [Python](https://www.python.org/downloads/)
   * used to split a file with samples into separate .CSV-files for importing into Edge Impulse
   * not strictly necessary, but very useful if you want to collect lots of samples
   * for information about how to install or use Python, check e.g. [Python documentation](https://www.python.org/doc/)
   * Notepad, Notepad++, Excel etc. can also be used to manually split files, not feasible with lots of samples
----------
**Preparation**
---------------
* Install the app 'Gesture Test' on your watch from the [Bangle App Loader](https://banglejs.com/apps/#gesture)

------------------
**Collect gesture samples**
-----------------
This step will guide you how to use your watch to collect multiple samples for one gesture type at a time.

* Paste the below code to your watch into the *right side* in the Espruino Web IDE (adapted from [this code](https://github.com/gfwilliams/workshop-nodeconfeu2019/blob/master/step4.md#getting-more-data))
  * the code will create a text file in the watch memory
* Name the event you are going to collect samples for by changing the line `event="left;"`
  * use e.g. `event="left;"` for twitching your watch hand left and later on `event="right;"` for the opposite direction
  * upload the code to **RAM**

*Gesture collecting code:*
```
name="Gesture";
event="left";

var fname = 1;

function gotGesture(d) {  
  var f = require("Storage").open(event + "." + fname + ".csv", "a");
  
  print("timestamp, x, y, z");
  f.write("timestamp, x, y, z\n");
  for (var j=0;j<d.length;j+=3) {
       print(j +", ", d[j] + ", " + d[j+1] + ", " + d[j+2] );
       f.write(j + ", " + d[j] + ", " + d[j+1] + ", " + d[j+2] +"\n" );
  }

  g.clear();
  g.setColor(1,1,1);
  var my = g.getHeight()/2;
  var sy = my/128;
  var sx = g.getWidth()/(50*3);
  g.drawLine(0,my,g.getWidth(),my);
  for (var i=0;i<d.length-3;i+=3) {
    for (var c=0;c<3;c++) {
      g.setColor(c==0,c==1,c==2);
      g.drawLine(i*sx, my+d[i+c]*sy, (i+3)*sx, my+d[i+c+3]*sy);
    }
  }
  g.flip(1);
}

Bangle.on('gesture',gotGesture);
```
 

