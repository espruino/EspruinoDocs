<!--- Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bangle.js Internationalisation
==============================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Bangle.js+Locale. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Bangle.js,Development,App Loader,App,Locale,Languale,Internationalisation,Internationalization
* USES: Bangle.js

If you have an app (eg by following the [Bangle.js First App](/Bangle.js+First+App)
tutorial), you might want to have a go at making it so that users in other countries
can use it easily.

For this, we provide a `locale` module. By default an `en_GB` locale module is built
into Bangle.js's firmware, but you can install the `Language` app from [the App Loader](https://banglejs.com/apps/)
to use a different language.

How do you use it?
-------------------

Simply `require("locale")` in your code and use the provided object.

For instance, if you want to write a date in a locale-friendly way,
just use:

```JS
var myDate = new Date();
var dateString = require('locale').date(myDate);
g.drawString(dateString);
```

What's provided
---------------

It's easiest to show examples (for the `de_DE` locale):

**Note:** Some strings (eg `currencySym`) may not render
correctly in the console. They may need to be rendered with
[a 6x8 or other ISO10646-1 font](/Fonts).

```JS
// The name of the Locale
>require('locale').name
="de_DE"

// Symbol used for currency
>require('locale').currencySym
="€"

// Day of the week from Date (long)
>require('locale').dow(new Date())
="Donnerstag"

// Day of the week from Date  (short)
>require('locale').dow(new Date(), 1)
="Do"

// Month of the year from Date (long)
>require('locale').month(new Date())
="April"

// Month of the year from Date (short)
>require('locale').month(new Date(), 1)
="Apr"

// Number to formatted String
>require('locale').number(4.98)
="4.98"

// Currency to formatted String
>require('locale').currency(4.98)
="4.98€"

// Distance/Length (in meters) to formatted String
>require('locale').distance(150)
="150m"

// Automatic unit selection for larger distances
>require('locale').distance(15000)
="15km"

// Speed (in kph) formatted String
>require('locale').speed(150)
="150kmh"

// Temperature (in Centigrade) to String
>require('locale').temp(150)
="150°C"

// Translate test or a phrase
>require('locale').translate("off")
="aus"

// Date to date string (long)
>require('locale').date(new Date())
="Donnerstag, 02. April 2020"

// Date to date string (short)
>require('locale').date(new Date(),1)
="02.04.2020"

// Date to time string (long)
>require('locale').time(new Date())
="15:49:39"

// Date to time string (long)
>require('locale').time(new Date(),1)
="15:49"

// Date to meridian (text describing morning/evening)
>require('locale').medidian(new Date())
="" // or "pm" for en_GB
```

Translation
------------

`require('locale').translate` will attempt to translate the **English** text
that is supplied to it. Currently it only handles very specific
words:

* Yes
* No
* Ok
* On
* Off

However it is expected that it will become slightly better in the future,
translating a wider variety of words even when used with other characters.

**`E.showMenu / E.showMessage / E.showPrompt / E.showAlert` all use the
translate function internally** - as such any menu that is displayed
should already have basic translation included as long as you use
one of the supported translated words.


Adding your own locale
------------------------

All you need to do is form the BangleApps loader as you would have done
for [adding an app to the Bangle.js App Loader](/Bangle.js+App+Loader).

Now, edit the [apps/locale/locales.js file](https://github.com/espruino/BangleApps/blob/master/apps/locale/locales.js) -
you can easily add your own date/time formats and translations.
