# Install 
`npm install winston winston-callback`

# About
It allows you to call a handler after the completion of all transports. 
You should install __winston__ by yourself. It is a peer dependency.

# Example

```js
const winston = require('winston-callback');
/* 
  or: 
  require('winston-callback');
  const winston = require('winston');  
*/

const options = {
  transports: [
    new (winston.transports.Console)({
        level: 'info',
        colorize: true
    }),
    new (winston.transports.File)({
        name: 'f1'
        filename: "logs/error.log",
        level: 'error'
    }),
    new (winston.transports.File)({
        name: 'f2'
        filename: "logs/info.log",
        level: 'info'
    })
    //... other transports
  ]
}

const logger = winston.createLogger
  ? winston.createLogger(options) // for v3
  : new (winston.Logger)(options); // for v2 

logger.error('a callback handling', function (err) {
  process.exit();
});

logger.info('a promise handling').finally(function () {
  process.exit();
});
```



