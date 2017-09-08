# Install 
`npm install winston winston-callback`

# About
Add to winston.Logger.prototype.log new callback handling.  
This allows you to call handler after completion of all transports.  

## Starting ^1.0.0
You should install winston yourself. It is peer dependency.

# Example
```js
const winston = require('winston-callback');

/* 
    or: 
    const winston = require('winston');
    require('winston-callback');
*/
const logger = new (winston.Logger)({
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
});

logger.error('surprise', function(err) {
  process.exit(1); // or something else  
}) 

// process.exit will be run after completion of all logger transports.
```



