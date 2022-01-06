<!--- Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bangle.js App Loader Customisation
==================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Bangle.js+App+Loader+Custom. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Bangle.js,Development,App Loader,App Store,App
* USES: Bangle.js

It's easy to make copies of the [Bangle.js App Loader](http://banglejs.com/apps)
and customise them for your own purposes:

* Your school/university might want a specific set of apps for a class
* Your company might have a specific product
* You might be providing Bangle.js to someone who wants an extremely simplified experience

Forking and Enabling GitHub pages
----------------------------------

Follow the tutorial on [Adding an app to the Bangle.js App Loader](/Bangle.js+App+Loader)
to get a GitHub fork set up with GitHub pages.

Your own App Loader should now be available on https://your_user_name.github.io/BangleApps/

**Note:** You can host the App Loader yourself, but it must be on an HTTPS
server (not HTTP) for Web Bluetooth to work.


Adding and Removing apps
------------------------

All the information on apps is stored in `metadata.json` 

The simplest form of modification is to just remove these files from apps
that you don't want.

* Go to https://github.com/your_user_name/BangleApps
* Click on `apps` then on the folder of the app you don't want
* Click on the little 'garbage can' icon in the top right
* repeat for any other app you don't want.


Changing Default apps
---------------------

The list of default apps installed when you click `Install default apps` is listed in
`defaultapps_banglejs1.json` and `defaultapps_banglejs2.json` for the given devices.

Simple remove or add app IDs from `metadata.json` to modify it.


Changing Look and Feel
----------------------

BangleApps is a standard HTML application, so you can simple edit
`index.html` or the CSS files to change how it looks.
