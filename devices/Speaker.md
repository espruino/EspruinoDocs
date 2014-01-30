<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Speaker
=======

* KEYWORDS: Speaker,Sound,Buzzer,Audio

![Speaker](speaker.jpg)

Espruino can't output proper audio, but it can output square waves of varying frequencies on some of its IO pins (those marked as [[PWM]]).

Useful sources of speakers are:

* Inside old Personal Computers. They usually also come with a wire and a [[Pin Strip]] connector attached, and look like the larger speaker in the picture above.
* Musical Christmas cards have a small piezoelectric speaker inside them that looks like the small gold disc above. This won't be very loud.
* Old headphones can also be a good source

Please bear in mind that Espruino can supply only 20mA at 3.3v on its outputs, so you shouldn't attach a huge speaker to it!


Using 
-----

* APPEND_USES: Speaker
