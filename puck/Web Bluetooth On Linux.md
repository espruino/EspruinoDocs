<!--- Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Web Bluetooth on Ubuntu 16.04 / Linux Mint 18
==============================================

* KEYWORDS: Tutorials,Puck.js,Web Bluetooth,Linux,Ubuntu,Mint
* USES: Puck.js,Web Bluetooth

**Note:** Alan Assis worked this out and documented it [here](https://acassis.wordpress.com/2016/06/28/how-to-get-chrome-web-bluetooth-working-on-linux/).
All I've done is tweak it slightly to use a newer bluez (and to modify things that didn't work for me)

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
wget http://www.kernel.org/pub/linux/bluetooth/bluez-5.43.tar.xz

# Extract it:
tar xvf bluez-5.43.tar.xz

# Configure and compile it:
cd bluez-5.43
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
chrome://flags first!). Maybe give the Web IDE a go: https://espruino.github.io/EspruinoWebIDE/

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
