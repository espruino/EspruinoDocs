<!--- Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Adding an app to the Bangle.js App Loader
=========================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Bangle.js+App+Loader. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Bangle.js,Development,App Loader,App Store,Submit,App
* USES: Bangle.js

If you have an app (eg by following the [Bangle.js First App](/Bangle.js+First+App)
tutorial), you might want to add it to the [Bangle.js App Loader](http://banglejs.com/apps) so you or others can
easily install it.

**Note:** To keep things simple for everyone, the [BangleApps](https://github.com/espruino/BangleApps)
Git repository and all code in it are [MIT Licensed](https://en.wikipedia.org/wiki/MIT_License). By
contributing an app you're agreeing that the code in it will be MIT Licensed too,
and you need to be sure you don't include any copyrighted code data or images that you
don't have the right to distribute freely.


Forking
-------

The first step is to 'Fork' the existing Bangle.js App Loader (make your own copy).

* Go to https://github.com/espruino/BangleApps
* Click `Sign In`/`Sign Up` in the top right
* Now click `Fork` up the top right of the BangleApp repository page


Enable GitHub Pages
-------------------

Now, let's enable "GitHub Pages", which allows you to view and use
your own copy of the repository.

* Click `Settings` up the top right of the repository page
* On the left panel, select `Pages`
* Under `Source`, choose `master branch`
* Now click `Save`
* The page will refresh and under `GitHub Pages` it'll then say:

```
Your site is ready to be published at https://your_user_name.github.io/BangleApps/.
```

* You can then click on https://your_user_name.github.io/BangleApps/ and
have your very own copy of the App Loader!

**Note:** You can host the App Loader yourself, but it must be on an HTTPS
server (not HTTP) for Web Bluetooth to work.

Adding your app
---------------

If you followed the [Bangle.js First App](/Bangle.js+First+App) tutorial
you should now have an app with an ID of `timer`, so let's use that. We
should create a new folder of the same name as your app's ID in the `apps`
folder.

An example of what the folder might look like is in: https://github.com/espruino/BangleApps/tree/master/apps/_example_app

**Note:** If you just want to add a feature to an existing app, please consider
modifying that app (see `Making Changes` below) rather than copying the app to
a new one and making your change. Almost identical copies of the same app mean that if a bug
is discovered in one app, someone has to manually copy the fixes over to each copy.

Experienced Git developers will know about cloning a repository to their
local computer, but I'll assume you don't know/want to do that, so we'll
do everything online.

* Go to your `BangleApps` repository at https://github.com/your_user_name/BangleApps
* Click on the `apps` folder
* Click the `Create new file` button
* Now type `timer/app.js` in the name box and copy/paste your app's JavaScript
into the editor box. If you don't have anything and want to try it out, just add:

```
E.showMessage("My\nSimple\nApp","My App")
```

* Now click the `Commit new file` button
* The window will now be in the `BangleApps/apps/timer` folder, and
we now want to add the app icon.
* In [Bangle.js First App](/Bangle.js+First+App) we downloaded a 48px icon
as a `PNG` file, so let's use that.
* Rename the file on your computer to `app.js` (GitHub doesn't provide a way to rename files)
* Click `Upload files` in GitHub's `BangleApps/apps/timer` folder, upload the file, and click `Commit Changes`

Now we need to upload the icon in a form that Bangle.js understands

* Go to http://www.espruino.com/Image+Converter
* Click `Choose File` and upload the `app.png` file
* Check `Use Compression` and `Transparency`
* If your image is in color, change  `Colors` to `3 bit RGB` and check the preview image. If it doesn't look good choose `Optimal 2/3/4 bit` instead - the higher the number the more colors but the more space the image takes up.
* Under `Output As` choose `Image String`
* Now you'll see some text like `var img = E.toArrayBuffer(atob("..."))`. Highlight and copy just the `E.toArrayBuffer(atob("..."))` part - **do not** copy `var img =`
* Go back to GitHub and the `BangleApps/apps/timer` and create a new file called `app-icon.js` with the `E.toArrayBuffer(atob("..."))` code you just copied in it, and click `Commit new file`

At this point you could add a ChangeLog file so others can see what changed if
you release multiple versions of your app, but we're going to skip that for now.

Finally, it's time to add a description of your app. There's an example at https://github.com/espruino/BangleApps/blob/master/apps/_example_app/metadata.json

* Click on the file `metadata.json`
* Click on the little pencil 'edit' icon in the top right
* Now edit the file to contain:

```JSON
{ "id": "timer",
  "name": "My Timer App",
  "shortName":"My Timer",
  "icon": "app.png",
  "version":"0.01",
  "description": "This is a description of my awesome timer app",
  "tags": "",
  "storage": [
    {"name":"timer.app.js","url":"app.js"},
    {"name":"timer.img","url":"app-icon.js","evaluate":true}
  ]
}
```

There is more information about the format of this file on
https://github.com/espruino/BangleApps/blob/master/README.md

* Now click `Commit Changes` and you're done!

**Note:** If you were working with a local copy of the GitHub repository
you could run the `bin/sanitycheck.js` file which would give your app's
description a quick check over to make sure everything looked ok (icons, code, etc).


Using your new App
------------------

* Go back to your personally hosted BangleApps repo at https://your_user_name.github.io/BangleApps/
* You'll see an app called `My Timer App` - click the Upload button next to it
* You can now press the button on your Bangle.js, open the Launcher, and see your app in there!

**Note:** If the App Loader doesn't work, it's almost certainly because of an error
in the `metadata.json` file that was changed earlier.


Documenting your App
--------------------

While there's short field for a description, many apps may need
slightly more documentation about how to use them.

To add this documentation in a way that can be found easily
from the app loader, create a file called `README.md` (a [markdown file](https://en.wikipedia.org/wiki/Markdown))
in your app's folder.

Then, in your app's `metadata.json` file, add:

```
  "readme":"README.md",
```

Now, when anyone sees your app in the App Loader, there'll be a link
saying `Read more...`. When clicked, it'll bring up a window
showing your documentation.


Making Changes
--------------

If you want to change your app you can simply edit the files in your
repository. However if you are publicly submitting your app we'd suggest
that you add a `ChangeLog` file so users can see what has changed.

* Add a file called `BangleApps/apps/timer/ChangeLog` - it should look like:

```
0.01: New App!
0.02: Fixed thingybob
0.03: Added fancy text
```

* Edit `metadata.json` and change the line `"version":"0.01",` in your app
to match the last number in the ChangeLog.

After this, if a user clicks on the version number in the App Loader
they'll be able to see the `ChangeLog` file


Submitting your App to the main App Loader website
--------------------------------------------------

Now you have a working app it's easy to submit it.

_While we will try to accept any apps you send us, we won't be able
to accept any obviously broken or non-child-friendly apps. However
your apps will still be available on https://your_user_name.github.io/BangleApps/
for anyone that wants to upload them_

* In https://github.com/your_user_name/BangleApps (the main repository)
click `Pull request` up the top right
* Scroll down and see exactly which files are set to be changed or
added and make sure it looks ok.
* If it is, click `Create Pull Request`
* In the next page, write a short title and description so we can check up on your app
* Click `Create pull request`

You'll see the pull request as well as yellow test saying `Some checks haven’t completed yet`.

We run the `bin/sanitycheck.js` script on any submissions using [Travis CI](https://travis-ci.org/).
This allows us to do a quick check that everything is ok. It won't detect bugs in your app
but it will ensure that the App Loader stays working.

After a while it'll change to either a green `All checks have passed`
or a red `Checks failed`. If checks fail then we're unlikely to be able
to merge as-is, but you can click `Show all Checks`, `Details` and see
what errors were found. If you correct these in your repository then
the check status will update.


More Info
----------

There are a more [Bangle.js tutorials](/Bangle.js#tutorials) on making apps.

For a reference of the format of apps and the JSON, check out [the Bangle.js App Loader's README file](https://github.com/espruino/BangleApps)

Maintainers of the [espruino/BangleApps](https://github.com/espruino/BangleApps/) repository use the [App Contribution](https://github.com/espruino/BangleApps/wiki/App-Contribution)
checklist as an aid when reviewing pull requests.
