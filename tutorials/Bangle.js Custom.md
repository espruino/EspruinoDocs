<!--- Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bangle.js App Customiser
========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Bangle.js+Custom. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Bangle.js,Development,Custom,Customizer,customiser,App,Apps,Application
* USES: Bangle.js

In the app loader, it is possible to customise some apps **before** they are
uploaded. We'll explain how to do that here.

Another method is to create an `interface.html` file which allows you to read/write data for an
app that is already installed - you can see how to do that on [the Bangle.js Storage page](/Bangle.js+Storage)

We'll assume you've been through [adding an app to the Bangle.js App Loader](/Bangle.js+App+Loader)
already so you know what's involved in submitting an app and have one that you want
to customise.

The idea behind the customiser is pretty simple. You create a webpage which
helps the user customise their app. When you click the button in the app
loader, the webpage pops up, and when complete the webpage gives the App Loader
a list of files it should upload to the Bangle (in addition to the ones in `metadata.json`).

We're going to create a simple app that displays the text that's
been entered on the HTML page.

First, we'll create an app that displays data from a file on the Bangle itself:

```JS
var txt = require("Storage").readJSON("myapp.json",1)||{}};
g.clear(1);
g.setFontAlign(0,0);
g.setFont("6x8");
g.drawString(txt.value, 120,120);
```

This will read some JSON in the form of `{"value":"Some text"}` from a file called `myapp.json` on the Bangle.

Next, we need an HTML file which will generate `myapp.json`. There are a few basics here - a CSS style
file so the style matches with the rest of the app loader, and a library
to help communicate with the App Loader.

Create a file in your app's folder called `custom.html` and add:

```HTML
<html>
  <head>
    <link rel="stylesheet" href="../../css/spectre.min.css">
  </head>
  <body>

    <p>Some text: <input type="text" id="mytext" class="form-input" value="http://espruino.com"></p>
    <p>Click <button id="upload" class="btn btn-primary">Upload</button></p>

    <script src="../../core/lib/customize.js"></script>

    <script>
      // When the 'upload' button is clicked...
      document.getElementById("upload").addEventListener("click", function() {
        // get the text to add
        var text = document.getElementById("mytext").value;
        var json = {value : text};
        // send app's info (in addition to the contents of metadata.json)
        sendCustomizedApp({
          storage:[
            {name:"myapp.json", content:JSON.stringify(json)},
          ]
        });
      });

    </script>
  </body>
</html>
```

Now edit your app's JSON and add the line `"custom": "custom.html",` just
before `"storage"`.

And now you're ready to go! When you start the App Loader you'll be able
to create a custom app.

**Note:** You can also get information about the currently connected device. To do this
you must tell the app loader the device must be connected first by adding `"customConnect": true,` to
the `metadata.json`, and then you can define an `function onInit(device) { ... }` function that is
called with information about the device, and which can use functions like `Util.readStorage` that
are defined at https://github.com/espruino/EspruinoAppLoaderCore/blob/master/lib/customize.js

**Note:** Previously, this tutorial gave an example of directly writing to a single `myapp.js` with the app
*and* the data inside it, but while that is possible (for instance the [Beer Compass App](https://banglejs.com/apps/?id=beer) still does it)
it's not something we'd recommend as it can make it harder to develop and maintain the app.