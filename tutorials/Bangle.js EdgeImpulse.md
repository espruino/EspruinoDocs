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
This part will guide you how to use your watch to collect multiple samples for one gesture type at a time.

1. Pair your computer with the watch using Espruino Web IDE
2. Paste the below *Gesture collection code* to your watch into the *right side* in the Espruino Web IDE (adapted from [this code](https://github.com/gfwilliams/workshop-nodeconfeu2019/blob/master/step4.md#getting-more-data))
    * the code will create a text file in the watch memory
3. Name the event you are going to collect samples for by changing the line `event="left";`
    * use e.g. `event="left";` for twitching your watch hand left and later on `event="right";` for the opposite direction
    * upload the code to **RAM**
4. Perform the gesture 
    * repeat the gesture *many* times, the more the merrier!
       * wait a second between each
    * the gesture collecting code will append each sample to the .CSV-file
    * a graph will also be shown on your watch screen
5. Repeat steps 3-4 above, remember to change `event="<gesture>";` where `<gesture>` is the hand movement you will collect
6. The devil is in the details, do not e.g. remove the seemingly insignificant semi-colon `;` !

*Gesture collecting code:*
```
// ******* Gesture collecting code ********
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
------------------
**Transfer .CSV-files from Bangle.js to your computer**
-----------------
This part will guide you how to transfer the .CSV-files from your watch to your computer.
* In Espruino Web IDE, click the Storage icon (4 discs) in the middle of the screen
* Search for your file/files, they start with the event name you provided in earlier steps e.g. `left.1.csv (StorageFile)`
* Click on `Save` (the floppy disc icon) for one file at a time and save the files to a folder of your choice, e.g. to `c:\temp`

------------------
**Split .CSV-files using Python**
-----------------
This part will guide you how to split the .CSV-files you've downloaded from your watch into separate .CSV-files. The reason for this is that Edge Impulse requires one .CSV-file per sample.
1.  Copy the below Python code (shamelessly copied from [Stackoverflow](https://stackoverflow.com/questions/546508/how-can-i-split-a-file-in-python)) into your favourite Python editor.
2.  Replace the path on the second line (starting with `PATENTS = ...`) with the full path and filename for the first file you want to split. I.e. the file you downloaded in previous steps.
3. Run the code in your Python editor
   * The program will search for the string `'timestamp, x, y, z'` in the original file and for each time (= sample) it finds, create a new file.
   * If you don't use Python, you'd need to split the file for each sample using some other method, manual or automatic. Remember that the samples aren't all of the same size so the amount of rows will vary.
   * You should now have several .CSV-files in the folder you chose. The files will be named like `left.1.csv (StorageFile)-15.csv` where `-15` at the end is a running number.
4. Repeat steps 2-3 above for each file you downloaded from your watch.

```
import re
PATENTS = 'C:/temp/left.1.csv (StorageFile)'

def split_file(filename):
    # Open file to read
    with open(filename, "r") as r:

        # Counter
        n=0

        # Start reading file line by line
        for i, line in enumerate(r):

            # If line match with template -- <?xml --increase counter n
            if re.match(r'timestamp, x, y, z', line):
                n+=1

                # This "if" can be deleted, without it will start naming from 1
                # or you can keep it. It depends where is "re" will find at
                # first time the template. In my case it was first line
                if i == 0:
                    n = 0               

            # Write lines to file    
            with open("{}-{}.csv".format(PATENTS, n), "a") as f:
                f.write(line)

split_file(PATENTS)
```

----------------------
**Use Edge Impulse**
---------------------
In this part you will learn how to upload the sample files you've created earlier, create a machine learning model, train and finally test it. This tutorial will only cover the  essential steps needed for Bangle.js. To learn more about Edge Impulse, see e.g. [getting started](https://docs.edgeimpulse.com/docs/getting-started) and [continuous motion recognition](https://docs.edgeimpulse.com/docs/continuous-motion-recognition).

####  Log in and create a project
* Log in to [Edge Impulse](https://www.edgeimpulse.com/), using the credentials for the free account you created in the beginning.
* Create a new project and give it a name, why not Bangle.js
* Select `Accelerometer data ` when asked for the  type of data you are dealing with.
* Click `Let's get started`

#### Upload sample data
* Select `Data acquisition` from the left hand menu
* Click on the icon labeled `Upload existing data` 
* Click on `Choose files`
  * Navigate to the folder you used to store the .CSV-files (e.g. c:\temp)
  * Select **all** the sample files that were created earlier, but **not** the original files you downloaded from your watch. I.e. select only the .CSV-files with a number at the end of the file name, e.g. `left.1.csv (StorageFile)-0.csv`.
  * You can also upload smaller batches at a time
  * `Automatically split between training and testing` and `Infer from filename` should both be selected
* Click `Begin upload` - this will now quickly upload the files to your project.
    * The upload process is shown on the right side, if everything goes well, you should at the end see a message like this: `Done. Files uploaded successful: 85. Files that failed to upload: 0.
Job completed`
    * Take a look at a sample by selecting any row


