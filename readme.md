# Install 
`npm install winston-callback`

# About
Add to winston.Logger.prototype.log new callback handling.  
This allows you to call handler after completion of all transports.

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
            filename: "logs/error.log",
            level: 'error'
        })
        //... other transports
    ]
});

logger.error('surprise', function(err) {
    process.exit(1); // or something else  
}) 

// process.exit will be run after completion of all logger transports.
```



