/* Copyright (c) 2017 Allan Brazute. See the file LICENSE for copying permission. */
/*
 Espruino Web Server

 * KEYWORDS: Module,Espruino,webserver,Internet,http,ajax,html

 Webserver let your Espruino unit act like a real web server and serve static and server generated content.

 How to use the WebServer module:

 ```javascript
 // StartAP or connect to WiFi, then...

 var WebServer = require("WebServer");
 var webs = new WebServer({
		port: 80, // Default
		default_type: 'text/html',
		default_index: 'index.html',
		file_system: 'some/path',
		memory: {
			'info.html': { 
				'content': '<html>Hello World!</html>',
				'type': 'text/html'
			},
			'info.txt': { 
				'content': 'Hello World!'
			},
			'info.njs': {
				'content': fnInfo  // Server Side Script. Will call fnInfo(request, response, parsedUrl, WebServer) and serve its output object: {content: 'String', type: '(optional) String', header: {(optional) Object}}
			}
		}
    });

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
*/

/**
 * Try to calculate string bytes
 */
String.prototype.byteLength = function () {
	var total = 0;
	var LOG2_256 = 8;
	var LN2x8 = Math.LN2 * LOG2_256;

	for (var i = 0; i < this.length; i++) {
		total += Math.ceil(Math.log(this[i].charCodeAt()) / LN2x8);
	}

	return total;
}

/**
 * Espruino WebServer
 * @param {Object} cfg Configuration set
 */
function WebServer (cfg) {
	cfg = cfg || {};
	
	this.port = cfg.port || 80;
	this.type = cfg.default_type || 'text/plain';
	this.index = cfg.default_index || 'index.html';
	this.not_found = cfg.default_not_found || 'File not found';
	this.file_system = cfg.file_system || '';
	this.memory = cfg.memory || null;
}

WebServer.prototype.router = function (req, res) {
	var uri = url.parse(req.url, true),
		i = uri.pathname.lastIndexOf('/'),
		header = {'status': 200, 'Content-Type': this.type},
		content = '';

	if (i >= 0) {
		uri.file = uri.pathname.substr(i+1) || this.index;
		uri.isSsS = uri.file.toLowerCase().indexOf('.njs');
	}

	this.emit('request', req, res, uri, this);

	try {
		switch (req.method) {
			case 'TRACE':
				header['Content-Type'] = 'message/http';
				content = this.getTrace(req);
				break;

			default:
				var file = (this.memory && this.memory[uri.file])? this.memory[uri.file] : ((this.file_system)? this.getDiskFile(this.file_system + uri.pathname) : null);
				
				if (file) {
					if (uri.isSsS > 0) {
						if (typeof file.content == 'object') {
							file = this.evalFile(file.content);
						}
						
						if (typeof file.content == 'function') {
							file = file.content(req, res, uri, this);
						}
					}

					if (file.content) {
						content = file.content;
						
						if (file.header) {
							header = file.header;
						} else if (file.type) {
							header['Content-Type'] = file.type;
						}
					}
				}

				
				if (!content) {
					header['status'] = 404;
					header['Content-Type'] = this.type;
					content = this.not_found;
				}

				if (req.method == 'HEAD') {
					content = '';
				}
		}
	} catch (e) {
		this.emit('error', e, this);
		header['status'] = 500;
		header['Content-Type'] = this.type;
		content = e.type + ' on ' + uri.file + ': ' + e.msg;
	}

	if (!header['Content-Length'] && content.byteLength) {
		header['Content-Length'] = content.byteLength();
	}

	this.serveContent(res, header, content);
};

WebServer.prototype.evalFile = function (file) {
	var chunk = txt = '',
		content;

	try {
		while (chunk = file.read(8)) {
			txt += chunk;
		}
		
		file.close();
		content = eval(txt)();
	} catch (e) {
		this.emit('error', e, this);
	}

	return content;
};

WebServer.prototype.serveContent = function (res, header, content) {
	res.writeHead(header.status, header);

	try {
		if (typeof content == 'string') {
			res.end(content);
		} else if (content.pipe) {
			content.pipe(res, {
				complete: function() {
					content.close();
					content = null;
				}
			});
		} else {
			res.end('');
		}
	} catch (e) {
		this.emit('error', e, this);
	}
};

WebServer.prototype.getDiskFile = function (path) {
	var file, fileType, content, type;

	try {
		if ((file = E.openFile(path, 'r')) != 'undefined') {
				if ((fileType = E.openFile(path + '.type', 'r')) != 'undefined') {
					type = fileType.read(55);
					fileType.close();
					fileType = null;
				}

			content = file;
		}
	} catch (e) {
		this.emit('error', e, this);
	}

	return {content: content, type: type};
};

WebServer.prototype.createServer = function () {
	try {
		this.server = require('http').createServer(this.router.bind(this));
		this.server.listen(this.port);
		this.emit('start', this);
	} catch (e) {
		this.emit('error', e, this);
	}
};

WebServer.prototype.getTrace = function (req) {
	var content = '"status": "200"' + "\n";
	content += '"method": "' + req.method + '"' + "\n";
	content += '"url": "' + req.url + '"' + "\n";
	for (var property in req.headers) {
		content += '"' + property + '": "' + req.headers[property] + '"' + "\n";
	}

	return content;
};

module.exports = WebServer;