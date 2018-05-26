/*<!-- Copyright (c) 2018 Gordon Williams. See the file LICENSE for copying permission. -->
Animal Guessing Game
==============

* KEYWORDS: Game,Animal Guess,Guess,Menu
* USES: Pixl.js,Graphics,graphical_menu

![Animal Guessing Game](Animal Guessing Game.jpg)

This is the classic animal guessing game, but using [Pixl.js's](/Pixl.js)
menu library. Think of an animal, then answer the questions and get
told what it is!

This is currently very limited, but please feel free to
[suggest updated animal information!](https://github.com/espruino/EspruinoDocs/blob/master/examples/Animal%20Guessing%20Game.js)


*/

// The data we use to guess what the animal is 
var tree = {
  "No Legs" : "worm",
  "2 Legs" : {
    "No Feathers": "frog",
    "Feathers": "bird",
  },
  "4 Legs" : {
    "Meow": "cat",
    "Woof": "dog",
    "Moo": "cow",
  },
  "6 Legs" : "ant",
  "8 Legs" : "spider"
};

/* Given a menu item, return a function that
either displays the animal name, or calls 'showMenu'
to display another menu */
function getMenuItem(item) {
  if (typeof item == "string") 
    return function() {
      Pixl.menu(); // disable menu
      g.clear();
      g.setFontVector(20);
      g.drawString(item, (g.getWidth()-g.stringWidth(item))/2, 10);
      g.setFontBitmap();
      g.drawString("Press BTN3 to start again",15,40);
      g.flip();
      setWatch(startGame, BTN3);
    };
  else
    return function() {
      showMenu(item);
    };
}

/* Work through a set of guesses, building
and displaying a menu */
function showMenu(items) {
  var menu = {
    "":{"title":"-= Animal Guesser =-"}
  };
  for (var i in items)
    menu[i] = getMenuItem(items[i]);
  Pixl.menu(menu);
}

/* At the start of the game start off with
the most basic set of questions */
function startGame() {
  showMenu(tree);
}

startGame();
