/* Copyright (c) 2025 Joe Teglasi. License: MIT */

/**
 * @file server.js
 * @description A stripped-down implementation of the [serverjs](serverjs.io) module, designed for Espruino.
 * @module server
 * @requires promise-reduce.js
 * @requires tracer.js (optional, for enhanced logging)
 * @example
 * const get = server.router.get;
 * const status = server.reply.status;
 * const server = require('server.js')({PORT:81},[
 *   get('/hello/:name', function(ctx){
 *     return status(200).send("Hello, "+ctx.params.name+"!");
 *  })
 * ]);
 * fetch('http://localhost:81/hello/World').then(r=>r.text()).then(console.log);
 * // output: "Hello, World!"
 */

/**
 * Espruino's version of the http.IncomingMessage object
 * @external httpSRq
 * @class 
 * @property {string} method The HTTP method of the request (e.g. 'GET', 'POST', etc)
 * @property {Object} headers The HTTP headers of the request
 * @property {string} url The full URL of the request
 */

/**
 * @external httpSRs Espruino's version of the http.ServerResponse object
 * @class
 * 
 * @method writeHead writeHead Function to write the response headers
 * @param {number} statusCode The HTTP status code to write
 * @param {Object} headers The HTTP headers to write
 * @returns {void}
 * 
 * @method write 
 * @param {string} data The data to write to the response body. Should be a string as per Espruino documentation.
 * @returns {false} As per Espruino documentation, returns false
 * 
 * @method end Function to end the response
 * @returns {void}
 */

/**
 * @class RequestContext
 * @description The context object passed to middleware and route handlers.
 * @extends httpSRq
 * @param {httpSRq} req The original HTTP server-request object
 * @param {httpSRs} res The original HTTP server-response objecy
 * @property {httpSRq} req The original HTTP server-request object
 * @property {httpSRs} res The original HTTP server-response object
 * @property {string} path The request path
 * @property {Object} params Contains the parsed route parameters, if applicable
 * @property {Object} query The parsed query parameters
 * @property {Promise<string|false>} [body] A promise that resolves to the request body (for POST/PUT requests). As per Espruino documentation, request body must be a string. If there is no body provided, or it times out, it resolves to false.
 * @property {Promise<string|false>} [data] Alias for body
 */

/**
 * @class ServerReply
 * @description A class for constructing HTTP responses to send to the client.
 * @param {RequestContext} ctx The request context
 * @property {httpSRs} res The original HTTP server-response object
 * 
 * @method headers
 * @param {Object} pairs An object containing header key-value pairs
 * @returns {ServerReply} The ServerReply instance (for chaining)
 * 
 * @method status
 * @param {number} code The HTTP status code to set
 * @returns {ServerReply} The ServerReply instance (for chaining)
 * 
 * @method send
 * @param {string} str The string to send as the response body
 * @returns {ServerReply} The ServerReply instance (for chaining)
 * 
 * @method json
 * @param {Object} data The JSON object to send as the response body
 * @returns {ServerReply} The ServerReply instance (for chaining)
 */

/**
 * @callback Middleware
 * @param {RequestContext} ctx The request context
 * @returns {(ServerReply|Object|string|Promise|undefined)} The response to send (stop processing further middleware and routes), or undefined to continue to the next middleware
 */

/**
 * @callback RouteHandler
 * @param {string} route The route path, e.g. '/users/:id'
 * @param {Middleware} func The handler function for the route
 * @property {string} route The route path
 */

/**
 * @typedef {Middleware|RouteHandler|Array<Middleware|RouteHandler|MiddlewareAndRoutes>} MiddlewareAndRoutes A single Middleware or RouteHandler, or an array of Middlewares, RouteHandlers, and/or nested arrays of them
 */

/**
 * @class ServerRouter
 * @description A class containing static methods for creating route handlers (get, post, put, del).
 * 
 * @static @method get
 * @param {string} route The route path, e.g. '/users/:id'
 * @param {Middleware} func The handler function for the route
 * @returns {RouteHandler} The route handler function
 * 
 * @static @method put
 * @param {string} route The route path, e.g. '/users/:id'
 * @param {Middleware} func The handler function for the route
 * @returns {RouteHandler} The route handler function
 * 
 * @static @method post
 * @param {string} route The route path, e.g. '/users/:id'
 * @param {Middleware} func The handler function for the route
 * @returns {RouteHandler} The route handler function
 * 
 * @static @method del
 * @param {string} route The route path, e.g. '/users/:id'
 * @param {Middleware} func The handler function for the route
 * @returns {RouteHandler} The route handler function
 */


/**
 * @typedef {Object} ServerParams The server options object. Currently only supports PORT.
 * @property {number} [PORT=80] The port number to listen on.
 */


/**
 * @function server
 * @description Creates and starts an HTTP server with the specified options and middleware/route handlers.
 * @throws {Error} If no arguments are provided
 * 
 * @overload
 * @param {ServerParams} options The port number to listen on.
 * @param {...MiddlewareAndRoutes} middlewareAndRoutes One or more middleware functions, route handlers, or arrays of them
 * @returns {httpSrv} server class instance. Espruino's version of http.Server
 * 
 * @overload
 * @param {...MiddlewareAndRoutes} middlewareAndRoutes One or more middleware functions, route handlers, or arrays of them
 * @returns {httpSrv} server class instance. Espruino's version of http.Server
 * 
 * @property {ServerRouter} router The ServerRouter class for creating route handlers
 * @property {ServerReply} reply The ServerReply class for constructing HTTP responses
 */


const promiseReduce = require('promise-reduce.js');

function createServerModule() {
  let log, info, debug, warn, error;
  try {
    const logger = require('tracer.js')('server.js');
    log = logger.log;
    info = logger.info;
    debug = logger.debug;
    warn = logger.warn;
    error = logger.error;
  } catch (e) {
    console.log('tracer.js not found, using console for logging.');
    log = console.log;
    info = console.info;
    debug = console.debug;
    warn = console.warn;
    error = console.error;
  }
  class RequestContext {
    constructor(req, res) {
      this.complete = false;
      this.req = req;
      Object.assign(this, req);
      this.res = res;
      this._url = url.parse(req.url, true);
      this.path = this._url.pathname || '/';
      this.query = this._url.query;
      if (['POST', 'PUT'].includes(req.method)) {
        //Create a Promise with a timeout for receiving the request body
        this.body = new Promise((r, j) => {
          const timeout = setTimeout(function () {
            //reject on timeout
            j('No Data for request (timeout)');
            req.removeAllListeners('data');
          }, process.env.REQ_BODY_TIMEOUT || 5e3);
          req.on('data', function (data) {
            // Clear timeout on data receipt,
            // and resolve with the string body
            clearTimeout(timeout);
            r(data);
          });
        }).catch(e => {
          //On timeout or error, log the error and resolve to false
          error(e);
          return false;
        });
        this.data = this.body;
      }
    }
  }

  class ServerRouter { }

  ServerRouter.__splitPath = function (path) {
    return path.split('/').filter(x => x);
  };

  //Checks if the path matches the route, and extracts params if applicable
  ServerRouter.__routeComp = function (routeSplit, pathSplit) {
    //quick check for mismatched number of segments
    if (routeSplit.length !== pathSplit.length) return false;

    const params = {};
    //iterate through each segment
    for (let i = 0; i < routeSplit.length; i++) {
      if (routeSplit[i][0] === ':') {
        //if the segment is a parameter, extract the param value
        params[routeSplit[i].slice(1)] = pathSplit[i];
      } else if (routeSplit[i] !== pathSplit[i]) {
        //non-param segment mismatch
        return false;
      }
    }
    return params;
  };

  //Creates a route handler for the specified method and route
  ServerRouter.__createRoute = function (method, route, func) {
    if (!method || !route || !func) throw new Error(`ServerRouter.__createRoute(): Invalid Input. method: ${method}=${!!method}| route: ${route} ${!!route}| func: ${func} ${!!func}.  `);

    const routeSplit = ServerRouter.__splitPath(route);
    
    //This is the actual route handler function
    const routeHandler = function (ctx) {
      if (ctx.method === method) {
        //ServerRouter.__routeComp returns false if no match, or the params object if matches
        const params = ServerRouter.__routeComp(routeSplit, ServerRouter.__splitPath(ctx.path));
        if (params !== false) {
          ctx.params = params;
          return func(ctx);
        }
      }
    };
    routeHandler.route = route;
    return routeHandler;
  };

  ServerRouter.get = function (route, func) {
    return ServerRouter.__createRoute('GET', route, func);
  };
  ServerRouter.put = function (route, func) {
    return ServerRouter.__createRoute('PUT', route, func);
  };
  ServerRouter.post = function (route, func) {
    return ServerRouter.__createRoute('POST', route, func);
  };
  ServerRouter.del = function (route, func) {
    return ServerRouter.__createRoute('DELETE', route, func);
  };

  /**
   * This is used to construct HTTP responses to send to the client.
   */
  class ServerReply {
    constructor(ctx) {
      this.res = ctx.res;
      this._status = ctx.statusCode || 200;
      this._headers = ctx.responseHeaders || {};
    }
    headers(pairs) {
      this._headers = pairs;
      return this;
    }
    status(code) {
      this._status = code;
      return this;
    }
    send(str) {
      this.res.writeHead(this._status, this._headers);
      if (str) this.res.write(str);
      return this;
    }
    json(data) {
      if (data) this.send(JSON.stringify(data));
      return this;
    }
    end() {
      return this.res.end();
    }
  }


  /*
   * Note: promiseReduce executes functions sequentially.
   */
  function execArgs(args, ctx) {
    return promiseReduce(args.map(arg => () => {
      if (ctx.isComplete) return; //skip if response is already sent

      switch (true) {
        case Array.isArray(arg):
          //recursively handle nested array of MiddlewareAndRoutes
          return execArgs(arg, ctx);

        case typeof arg === 'function': {
          let response = arg(ctx);

          // Middleware MUST return undefined to continue to next Middleware/RouteHandler
          if (response !== undefined) {
            ctx.isComplete = true;

            switch (true) {
              case response instanceof ServerReply:
                //ServerReply was returned explicitly
                return response.end();
              case response instanceof Promise:
                //handle async response
                return response.then(
                  result => {
                    if (typeof result === 'object') {
                      new ServerReply(ctx).json(result).end();
                    } else {
                      new ServerReply(ctx).send(result).end();
                    }
                  }
                ).catch(e => new ServerReply(ctx).json({ success: false, error: e }).end());
              case typeof response === 'object': 
                // treat object as JSON-stringifiable
                return new ServerReply(ctx).json(response).end();
              default:
                //treat as stringifiable primitive
                return new ServerReply(ctx).send(response).end();
            }
          }
        } break;

        default:
          return;
      }
    }));
  }

  function server() {
    if (arguments.length === 0) {
      error('server(): missing at least one argument');
      throw new Error('server: server(): missing at least one argument');
    }

    const options = {
      PORT: arguments[0].PORT || (process.env.PORT) || 80
    };

    //TO-DO: insert handling for using different espruino modules (http, tls, net, etc)

    const _server = require('http').createServer(function handleReq(req, res) {
      const ctx = new RequestContext(req, res);
      execArgs(arguments, ctx);
    }).listen(options.PORT);

    _server.on('error', error);

    log(`Server now running at ${process.env.local_ip || require('Wifi').getIP().ip}:${options.PORT}`);

    return _server;
  }

  server.reply = ServerReply;
  server.ServerReply = ServerReply;

  server.router = ServerRouter;
  return server;
}

module.exports = createServerModule();


