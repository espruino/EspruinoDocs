<!--- Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bangle.js App Customiser
========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Bangle.js+Custom. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Bangle.js,Development,Custom,Customizer,customiser,App,Apps,Application
* USES: Bangle.js

In the app loader, it is possible to customise some apps before they are
uploaded. We'll explain how to do that here.

We'll assume you've been through [adding an app to the Bangle.js App Loader](/Bangle.js+App+Loader)
already so you know what's involved in submitting an app and have one that you want
to customise.

The idea behind the customiser is pretty simple. You create a webpage which
helps the user customise their app. When you click the button in the app
loader, the webpage pops up, and when complete the webpage gives the App Loader
a list of files it should upload to the Bangle.

We're going to create a simple app that displays the text that's
been entered on the HTML page.

So first, we need an HTML file. There are a few basics here - a CSS style
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
        // build the app's text using a templated String
        var app = `
var txt = ${JSON.stringify(text)};
g.clear(1);
g.setFontAlign(0,0);
g.setFont("6x8");
g.drawString(txt,120,120);
`;
        // send finished app (in addition to contents of metadata.json)
        sendCustomizedApp({
          storage:[
            {name:"myapp.app.js", url:"app.js", content:app},
          ]
        });
      });

    </script>
  </body>
</html>
```

Now edit your app's JSON and add the line `"custom": "custom.html",` just
before `"storage"`.

Since you're now supplying your app's JS file directly you can also
change `{"name":"myapp.app.js", "url":"app.js"},` to just `{"name":"myapp.app.js"},`
and remove the original app's `app.js` file.

**Note:** we specify a `url:"app.js"` for JS files in `sendCustomizedApp` even though
`app.js` doesn't exist and will never be loaded. This is so the app loader can tell if
it's a JavaScript file based on the extension, and if so it can minify and pretokenise it.

And now you're ready to go! When you start the App Loader you'll be able
to create a custom app.

**Note:** Here we're creating our app's complete JS each time, but there's
no specific need to do that. For instance the [OpenStreetMap app](https://github.com/espruino/BangleApps/tree/master/apps/openstmap)
uploads the app text from a file, and then just upload extra JSON files and text.
