<!--- Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Web Bluetooth on Linux
======================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Web+Bluetooth+On+Linux. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Puck.js,Web Bluetooth,Linux,Ubuntu,Mint,Bluez,Bluetoothd
* USES: Puck.js,Web Bluetooth,BLE,Only BLE

First, you should type `bluetoothd --version` in the terminal,
and see which version of Bluez you have - then follow the
correct set of instructions below:


Bluez 5.41 and later: Ubuntu 16.10 and newer
---------------------------------------

Bluetooth *may* work out of the box - try following the [Web Bluetooth getting
started code](/Puck.js Quick Start) and see if it works.

If it doesn't we'd recommend installing the latest Bluez version as it seems
significantly more reliable, but Bluez 5.41 can still work with Web Bluetooth.
See the headings below in either case...


Recommended - Install latest Bluez from Debian
----------------------------------------------

This advice originally [came from here](https://gist.github.com/MichaelLawton/a56371969a18d2f735a77ed1ac4b5512).
You can also compile from source as well (see below), but this method is very easy if you have Debian, Ubuntu ot Linux Mint.

Look in the Debian package repository or the latest version of Bluez:

* Go to http://ftp.debian.org/debian/pool/main/b/bluez/
* Look a filename of the form `bluez_*_amd64.deb` (or whatever your platform is)
and download it. As of writing this is `bluez_5.47-1+b1_amd64.deb`
* Bluez needs a later version of libreadline too, so look in http://ftp.debian.org/debian/pool/main/r/readline/
* Find a file of the form `	libreadline*_amd64.deb` and download it. As of writing it is `libreadline7_7.0-3_amd64.deb`
* Install `libreadline` with `sudo dpkg -i libreadline7_7.0-3_amd64.deb`
* Install `bluez` with `sudo dpkg -i bluez_5.47-1+b1_amd64.deb`
* Restart `bluetoothd` with `sudo /etc/init.d/bluetooth restart`

And you're done!


Bluez 5.41
----------

Bluez 5.41 comes installed by default on a few systems now and does work,
however you still need to enable the Experimental flags. Edit
the Bluetooth config and add the experimental flag there:

```
sudo nano /lib/systemd/system/bluetooth.service
```

And update the line:

```
ExecStart=/usr/lib/bluetooth/bluetoothd
```

so it reads:

```
ExecStart=/usr/lib/bluetooth/bluetoothd --experimental
```

Save and exit. Then reload Bluez.

```
sudo systemctl daemon-reload
sudo systemctl restart bluetooth
```

(Originally from [Adafruit](https://learn.adafruit.com/install-bluez-on-the-raspberry-pi/installation))


Installing latest Bluez from Source (Bluez before 5.41)
--------------------------------------------------

**Note:** Alan Assis worked this out and documented it [here](https://acassis.wordpress.com/2016/06/28/how-to-get-chrome-web-bluetooth-working-on-linux/).
All I've done is tweak it slightly to use a newer bluez

**Note 2:** Ubuntu 16.10 comes with `bluez` 5.41 already, but the experimental interface flag is needed for this version. This means you'll have to build it again with the appropriate flag.

As of writing, Ubuntu 16.04 comes with version 5.37 of `bluez`, the Bluetooth tools.
While this provides some Bluetooth functionality, it's not very good at exposing it.
As a result, for Web Bluetooth on Chrome to work, you need to update your `bluez`
version to a newer version, which exposes functionality in a way that Chrome can
access without needing special permissions.

```
# Install the dependecies:
sudo apt-get -y install automake autotools-dev bison check clang flex lcov libcap-ng-dev libdbus-glib-1-dev libdw-dev libglib2.0-dev libical-dev libreadline-dev libtool libudev-dev

# create temp directory
mkdir tmp
cd tmp

# Download new bluez
wget http://www.kernel.org/pub/linux/bluetooth/bluez-5.45.tar.xz

# Extract it:
tar xvf bluez-5.45.tar.xz

# Configure and compile it:
cd bluez-5.45
./configure --prefix=/usr           \
            --mandir=/usr/share/man \
            --sysconfdir=/etc       \
            --localstatedir=/var    \
            --enable-library        \
            --disable-systemd       \
            --disable-android       
make

# install everything
sudo make install

# Stop existing bluetooth and start a new one
sudo /etc/init.d/bluetooth stop
sudo /usr/libexec/bluetooth/bluetoothd
```

Now you can test Web Bluetooth out in Chrome (make sure you enable it in
chrome://flags first!). Maybe give the Web IDE a go: https://www.espruino.com/ide

If that all works, we want to make sure it runs properly after a reboot.

Ctrl-C to stop the existing bluetoothd.

```
# Replace the old bluetoothd with the new one:
sudo cp /usr/libexec/bluetooth/bluetoothd /usr/lib/bluetooth/bluetoothd
```

Now you can re-start the service and you're good to go!

```
sudo /etc/init.d/bluetooth start
```
