<!--- Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bangle.js Code Guidelines
=========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Bangle.js+Guidelines. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Bangle.js,Bangle,Banglejs,app,widget,Guidelines,rules
* USES: Bangle.js

**For general information on making apps [try this page](/Bangle.js+First+App)**

This a list of suggestions and things that we'd like apps [submitted to the App Loader](Bangle.js+App+Loader)
to do, to make sure everything works together well.


General
-------

* If you need settings, try and use [an `myapp.settings.js` file](https://github.com/espruino/BangleApps#adding-configuration-to-the-settings-menu)
* If you need to run code at boot time, use a file called `myapp.boot.js`
* Try and use [the same code style](/Code+Style) as the rest of Bangle.js
* Where possible, [store large chunks of data in functions](https://www.espruino.com/Code+Style#other-suggestions)
  as this will avoid using RAM
* Once in the App store, [keep a `ChangeLog` file in your app's folder](/Bangle.js+App+Loader#making-changes)
  and increment the version whenever you submit a change to the App Loader.
* Try and use [the `locale` module to format dates/distances/etc](/Bangle.js+Locale) in a way that is correct for multiple countries.
* Please don't include editor config/settings files and things that are not relevant to your application
* Please test your app! Ideally in [your own copy of the App Loader](https://www.espruino.com/Bangle.js+App+Loader#enable-github-pages)


Apps
----

* Add widgets with `Bangle.loadWidgets()` then `Bangle.drawWidgets()` if at all
possible.
* Don't use widgets with any screen modes other than the normal, `unbuffered` screen mode.
* If using Widgets:
  * Don't render in the top or bottom 24px of the screen (reserved for Widgets)
  * Avoid clearing the whole screen with `g.clear()`, but if you do, call `Bangle.drawWidgets()` right after
* Give your app an icon (icons from [icons8.com](https://icons8.com/) are fine)
* Where possible, use `"allow_emulator":true` in `apps.json` to allow your app
to be previewed online in the emulator.


Widgets
-------

* Render inside the box `this.x, this.y, this.x + this.width-1, this.y + 23`
* Call `g.reset()` before rendering to ensure that everything is in a known state
* Don't call `g.clear` (which will clear the whole screen)
* Only call `g.flip()` if you *want* your widget's update to wake the screen
* Be aware that you're running in a constrained environment alongside other
  widgets and apps - try not to use any more RAM than required.
