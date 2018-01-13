<!--- Copyright (c) 2017 Allan Brazute. See the file LICENSE for copying permission. -->
Espruino WebServer Module
=========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/WebServer. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Espruino,webserver,Internet,http,ajax,html

Espruino WebServer let your Espruino act like a real web server and serve static and server generated content, including from an SD card.

**Note:** You don't absolutely have to use this WebServer module as you can
just use [the built-in web server directly](/Internet#server) - however this
module does automate the task of serving multiple files.

To use the `WebServer.js` module, you must be connected to WiFi/Ethernet/etc.

How to use the WebServer module
-------------------------------

```javascript
var WebServer = require("WebServer");

var webs = new WebServer({
	port: 80,
	default_type: 'text/plain',
	default_index: 'index.html',
	file_system: '/some/path',
	memory: {
		'info.html': { 
			'content': '<html>Hello World!</html>',
			'type': 'text/html'
		},
		'info.txt': { 
			'content': 'Hello World!'
		},
		'info.njs': {
			'content': function(){
				return {
					'type': 'text/html',
					'content': '<html>Hello World.</html>'
				}
			}
		}
	}
});
```


Available events
----------------

```javascript
webs.on('start', function(request, WebServer){
	console.log('WebServer listening on port ' + WebServer.port);
});

webs.on('request', function(request, response, parsedUrl, WebServer){
	console.log('WebServer requested', parsedUrl);
});

webs.on('error', function(error, WebServer){
	console.log('WebServer Error', error);
});
```


The web server setup parameters
-------------------------------

- **port**: The listening port. Default is "80".

- **default_type**: The default Content_type for pages. Default is "text/plain".

- **default_index**: The default index page to serve on /. Default is "index.html".
default_not_found: The default File Not Found text. Default is plain "File not found"

- **file_system**: An optional string with a path on your SDCARD or Disk with pages and files to serve.<br> 
For every file, you may have another file with a "`.type/`" added to its name with the original file mime type text. For example, for a `favicon.ico` file, you may have a `favicon.ico.type` file containing "`image/x-icon`" (without quotes).
If the file has "`.njs`" extension it will be a server side javascript file. In this case it will be required to have a function that outputs the object containing the `content` string and `type` string or `header` object.<br> 
If you want web service endpoints like, just make a folder to each endpoint with an `index.njs` file, and set the `default_index` to it.

- **memory**: An optional object holding files to serve. It takes precedence over the file_system. <br>
The object is as follow: 
```js
	{
		"file_name.ext": {
			"type": "mime_type",
			"header": {"Content-stuff"},
			"content": "the_file_body_content"
		}
	}
```
The `content` may be a function. In this case, the file must have the `.njs` extension, to indicate a server side interpreted file, and it must return the object containing the `content` string and `type` string or `header` object.



Working Espruino Example Code
-----------------------------

- Copy and Paste this code into the WebIDE right panel
- Send to Espruino
- If it is running on Espruino hardware, connect to the `Espruino_Server` Access Point
- Open your browser and go to [http://192.168.4.1:8080](http://192.168.4.1:8080) 
- If it is running local on your machine, go to [http://127.0.0.1:8080](http://127.0.0.1:8080)<br>
*You need to access it via your local network IP to load the favicon icon*

```javascript
var wifi = require('Wifi'), WebServer = require('WebServer');

function onInit() {
	if (wifi)
		wifi.startAP('Espruino_Server', {}, startServer);
	else
		startServer();
}

function startServer() {
	var webs = new WebServer({
		port: 8080,
		file_system: '/var/www/',
		memory: {
			'index.html': { 
				'type': 'text/html',
				'content': '<html><head><script src="index.js"></script></head><body>' +
					'<p>Hello from in memory HTML!</p>' +
					'<br><button onclick="hello()"> Run client side JavaScript</button>' +
					'<br><br><button onclick="window.open(\'index.njs\', \'_top\')"> Run server side JavaScript</button>' +
					'<br><br><button onclick="window.open(\'index.txt\', \'_top\')"> Go to a simple text</button>' +
					'<br><p align="right"> <small>Espruino WebServer</small> </p>' +
					'</body></html>'
			},
			'index.txt': { 
				'content': 'Hello from in memory text!'
			},
			'index.js': {
				'type': 'application/javascript',
				'content': "function hello(){ alert('Hello from in memory client side javascript'); }",
			},
			'index.njs': {
				'content': index_njs
			},
			'favicon.ico': {
				'type': 'image/x-icon',
				'content': "\0\0\x01\0\x01\0\x10\x10\x10\0\x01\0\x04\x00\xf0\0\0\0\x16\0\0\x00\x89PNG\x0d\x0a\x1a\x0a\0\0\0\x0dIHDR\0\0\0\x10\0\0\0\x10\x08\x06\0\0\0\x1f\xf3\xffa\0\0\x00\xb7IDAT8\x8d\xa5S\xc1\x0d\x03!\x0csN\xb7\x91w\xcaP\xde)3\xd1G\x09\x0a\x85\xab\xa8\xea\x0f\x02\x82c\x1b0\x92x\x82\xbb\xb7:\x8f\x08D\x84\xd5\xb5\x1b\x00H\xb6>N\x04uN\x12\x92\x10\x11S\xcd]\x0b\xbf\xa9\xe9\x8a\x00\xa0I\x1a*\x06A\x97\xb7\x90\xd4\x8e$A\x12\xee\xde\xb2vR\x90$\xc8q\xf6\x03\xbc\x15Ldw]\x88zpc\xab*\x8c\x08H\xb2A\x90\x1e\x97\xce\x1bd3\x00\xb8v\x9b\xa7p\xf7\xb6\x10\x9cb\xc9\xe0Wd\x06\x17\x80v\xe2\xfb\x09\x17\x00H\xfa\x8b\xc0\xba\x9c\xe3CU\xf1\xc8@\xd2\x08fW\xf8i3?U\x12\x18z\x16\xf5A\x9ddc_\xee\xbd~e{*z\x01|\xcdnfT\x03\x0an\0\0\0\x00IEND\xaeB`\x82"
			}
		}
	});

	webs.on('start', function (WebServer) {
		console.log('WebServer listening on port ' + WebServer.port);
	});
	webs.on('request', function (request, response, parsedUrl, WebServer) {
		console.log('WebServer requested', parsedUrl);
	});
	webs.on('error', function (error, WebServer) {
		console.log('WebServer error', error);
	});

	webs.createServer();
}

function index_njs(req, res, uri, webs) {
	return {
		type: 'text/html',
		content: '<html>' + 
			'<p>Hello from in memory server side javascript!</p>' +
			'<p><b>Espruino Memory Usage: </b><br>' + JSON.stringify(process.memory()) + '</p>' + 
			'<p><b>Espruino Flash Usage: </b><br>' + JSON.stringify(require('Flash').getFree()) + '</p>' + 
			'</html>'
	};
}
```
