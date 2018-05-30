<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Writing and Submitting Tutorials (or changes)
=======================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Writing+Tutorials. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: writing tutorials,creating tutorials,tutorials,howto,submitting,pull request

Writing and submitting tutorials is really easy, and it's great for the community when more people contribute.

* Get a [GitHub](http://github.com) account
* Visit https://github.com/espruino/EspruinoDocs and click 'Fork' in the top-right. You'll now have your own copy of all the documentation in your GitHub account.
* Click on the `tutorials` folder, and at the top where it says `EspruinoDocs / tutorials / +`, click on the `+`
* Name your tutorial (try and keep this bit simple as it will be the URL) and add `.md` to the end, a bit like `Traffic Lights.md`. For this we'll use `My Tutorial.md`
* Copy and paste the following template into the file:

<!-- note use of KEYWORDS_ and USES_ below to stop build.js messing it up -->

    <!--- Copyright (c) 2014 Your Name. See the file LICENSE for copying permission. -->
    My Tutorial's Proper Title
    =======================

    * KEYWORDS: Comma,separated,list,of,search,words
    * USES: Comma,separated,list

    Introduction
    -----------

    ...

    Wiring Up
    --------

    ...

    Software
    --------

    ...

    ```
    My().code.in.here
    ```

    ...


* Start writing your tutorial! To get it formatted nicely you just need to write it in a slightly special way, called Markdown. [See this link](https://help.github.com/articles/github-flavored-markdown) for examples of how to use it, and maybe look at the other tutorials.

   **Note:** Images are handled slightly differently... Put your images in a folder named after your tutorial (eg. `My Tutorial`) and then write the following: ```![Image Description](My Tutorial/image filename)```

* Make sure the `* USES:` line contains the hardware that your tutorial uses. If it uses only the Espruino board, type `* USES: Only Espruino Board`. You can get the correct names by looking at the `.md` files for other tutorials, or the `.md` file in [devices](https://github.com/espruino/EspruinoDocs/tree/master/devices) that corresponds to what your device uses, and finding out what it says after `APPEND_USES`.

* Click `Commit New File`. You can always click on the file later and then click 'edit' in the top right if you want to change it.

* When you have it as you want, when looking at your GitHub repository's main page, click on `Pull Request`.

* Make sure it's showing the right stuff, and then click `Click to create a pull request for this comparison` and enter a short description.

* Finally click `Send pull request` and you're done! We'll be able to take in your changes and merge them with everything else!
