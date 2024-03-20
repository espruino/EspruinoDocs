<!--- Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bangle.js Internationalisation
==============================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Bangle.js+Locale. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Bangle.js,Development,App Loader,App,Locale,Language,Internationalisation,Internationalization,Translate,Translation,Lang,Intl,Date
* USES: Bangle.js

If you have an app (eg by following the [Bangle.js First App](/Bangle.js+First+App)
tutorial), you might want to have a go at making it so that users in other countries
can use it easily.

For this, we provide a `locale` module. By default an `en_GB` locale module is built
into Bangle.js's firmware, but you can install the `Language` app from [the App Loader](https://banglejs.com/apps/)
to use a different language.

We also provide a `date_utils` module. It is built on `locale` module to provide date-related localized functions.

`locale` module
---------------

How do you use it?
------------------

Simply call `require("locale")` in your code and use the provided object.

For instance, if you want to write a date in a locale-friendly way, just use:

```JS
var myDate = new Date();
var dateString = require("locale").date(myDate);
g.drawString(dateString);
```

It's easiest to show some examples (for the `de_DE` locale):

**Note:** Some strings may not render
correctly in the console. They may need to be rendered with
[a 6x8 or other ISO10646-1 font](/Fonts).

```JS
// The name of the Locale
>require("locale").name
="de_DE"

// Day of the week from Date (long)
>require("locale").dow(new Date()) // or dow(new Date(), 0)
="Donnerstag"

// Day of the week from Date (short)
>require("locale").dow(new Date(), 1)
="Do"

// Month of the year from Date (long)
>require("locale").month(new Date())
="April"

// Month of the year from Date (short)
>require("locale").month(new Date(), 1)
="Apr"

// Number to formatted String
>require("locale").number(4.98)
="4.98"

// Distance/Length (in meters) to formatted String
>require("locale").distance(150)
="150m"

// Automatic unit selection for larger distances
>require("locale").distance(15000)
="15km"

// Speed (in kph) formatted String
>require("locale").speed(150)
="150kmh"

// Temperature (in Centigrade) to String
>require("locale").temp(150)
="150°C"

// Translate test or a phrase
>require("locale").translate("off")
="aus"

// Date to date string (long)
>require("locale").date(new Date())
="Donnerstag, 02. April 2020"

// Date to date string (short)
>require("locale").date(new Date(), 1)
="02.04.2020"

// Date to time string (long)
>require("locale").time(new Date())
="15:49:39"

// Date to time string (short)
>require("locale").time(new Date(), 1)
="15:49"

// Date to meridian (text describing morning/evening)
>require("locale").meridian(new Date())
="" // or "pm" for en_GB
```

`date_utils` module
-------------------

```JS
> require("date_utils")

// Return an array of all the days of the week starting
// from the i-th day (long) (0 = Sunday, 1 = Monday, etc.)
> require("date_utils").dows(1) // or dows(1, 0)
=[
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag"
 ]

// Return an array of all the days of the week starting
// from the i-th day (short)
> require("date_utils").dows(1, 1)
=[
  "Mo",
  "Di",
  "Mi",
  "Do",
  "Fr",
  "Sa",
  "So"
 ]

// Return an array of all the days of the week starting
// from the i-th day (first letter only)
> require("date_utils").dows(1, 2)
=[
  "M",
  "D",
  "M",
  "D",
  "F",
  "S",
  "S"
 ]

// Return the i-th day of week (long) (0 = Sunday)
>require("date_utils").dow(1) // or dow(1, 0)
="Montag"

// Return the i-th day of week (short)
>require("date_utils").dow(1, 1)
="Mo"

// Return the i-th day of week (first letter only)
>require("date_utils").dow(1, 2)
="M"

// Return an array of all 12 months (long)
>require("date_utils").months() // or months(0)
=[
  "Januar",
  "Februar",
  "M\xE4rz",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember"
 ]

// Return an array of all 12 months (short)
>require("date_utils").months(1)
=[
  "Jan",
  "Feb",
  "M\xE4r",
  "Apr",
  "Mai",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Okt",
  "Nov",
  "Dez"
 ]

// Return an array of all 12 months (first letter only)
>require("date_utils").months(2)
=[
  "J",
  "F",
  "M",
  "A",
  "M",
  "J",
  "J",
  "A",
  "S",
  "O",
  "N",
  "D"
 ]

// Return the i-th month (long) (1 = January)
>require("date_utils").month(1) // or month(1, 0)
="Januar"

// Return the i-th month (short)
>require("date_utils").month(1, 1)
="Jan"

// Return the i-th month (first letter only)
>require("date_utils").month(1, 2)
="J"
```

App Translations
----------------

Every app is automatically translated in the current language when it is installed, however the app itself _must_ support translation.

To make your app _translations-ready_ you must:

1. Write any text in English as usual
2. Put the `/*LANG*/` placeholder in front of any text that should be translated. Eg.:
```JS
const menu = {
  "": { "title": /*LANG*/"Repeat Alarm" },
  "< Back": () => { ... },
  /*LANG*/"Once": { ... },
  /*LANG*/"Workdays": { ... },
  /*LANG*/"Weekends": { ... },
  /*LANG*/"Every Day": { ... },
  /*LANG*/"Custom": { ... }
};
```
3. Upon upload, the app is scanned for these strings, and they are replaced if they are found in the translation file in the [lang folder](https://github.com/espruino/BangleApps/blob/master/lang/).

You can run `bin/language_scan.js` to get a list of all the missing translations.

Currency (deprecated)
---------------------

~~`require("locale").currencySym` will return the pound character: `£`.~~

~~`require("locale").currency(4.98)` will return the number formatted as a currency in pounds: `£4.98`.~~

Translations (deprecated)
-------------------------

~~`require("locale").translate` will attempt to translate the **English** text that is supplied to it. Currently it only handles very specific words:~~

* ~~Yes~~
* ~~No~~
* ~~Ok~~
* ~~On~~
* ~~Off~~

~~However it is expected that it will become slightly better in the future, translating a wider variety of words even when used with other characters.~~

~~**`E.showMenu / E.showMessage / E.showPrompt / E.showAlert` all use the translate function internally** - as such any menu that is displayed should already have basic translation included as long as you use one of the supported translated words.~~

Adding your own locale
----------------------

All you need to do is form the BangleApps loader as you would have done
for [adding an app to the Bangle.js App Loader](/Bangle.js+App+Loader).

Now, edit the [apps/locale/locales.js file](https://github.com/espruino/BangleApps/blob/master/apps/locale/locales.js) -
you can easily add your own date/time formats and translations.
