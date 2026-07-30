# Tracer
===============================
Copyright (c) 2022 Joe Teglasi. License: MIT

* KEYWORDS: logging, logger, trace

This module provides a simple logging tool to track when and where logs are generated from, and to optionally pipe them into another Serial interface (e.g. for streaming to a log file with a separate event handler on that Serial interface).

Objects provided to args will be automatically JSON.stringify-ed.

Inspired by the [tracer](https://github.com/baryon/tracer) npm package.

## Basic Usage

```js
const logger = require('tracer.js')('your-file-name.js')

/*
The output of any `logger.method(...args)` call will be:
`YYYY-MM-DDTHH:mm:ss.sss <METHOD> your-file-name.js: ...args`
*/

logger.log('hello', {world: 1}, [5,6,7]);
//output:
//YYYY-MM-DDTHH:mm:ss.sss <LOG> your-file-name.js: hello {"world",1} [5,6,7]
```

## API

```ts
interface Logger {
  log: (...args: any[]): void;
  info: (...args: any[]): void;
  debug: (...args: any[]): void;
  warn: (...args: any[]): void;
  error: (...args: any[]): void;
}
declare function tracer(fileName): Logger
```

