"use strict";

const winston = require('winston');
let Logger = require('winston/lib/winston/logger');
Logger.Logger && (Logger = Logger.Logger);

let oldLog = Logger.prototype.log;

Logger.prototype.log = function (level) {
  let keys = Object.keys(this.transports);
  let countAll = 0;
  let countLogged = 0;
  let args = [].slice.call(arguments);
  let last = args[args.length - 1];
  let callback = typeof last == 'function'? last: false;

  if(!callback) {
    return oldLog.apply(this, args);
  }

  args.pop();

  keys.map((key) => {
    let transport = this.transports[key];
    
    if(this.levels[transport.level] >= this.levels[level]) {
      countAll += 1;
    }
    else {
      return;
    }

    function onLogged () {
      transport.removeListener('logged', onLogged);
      transport.removeListener('error', onError);
      let p = Promise.resolve();

      if(transport._opening || transport.opening) {        
        p = new Promise((resolve) => {
          function onOpen () {
            transport.removeListener('open', onOpen);
            resolve();
          }

          transport.on('open', onOpen);
        });       
      }

      p.then(() => {
        countLogged++;

        if(countAll <= countLogged) {
          callback();
        }
      });      
    }

    function onError (err) {
      transport.removeListener('error', onError);
      transport.removeListener('logged', onLogged);
      callback(err);
    }

    transport.on('logged', onLogged);
    transport.on('error', onError);
  });

  let res = oldLog.apply(this, args);  
  !countAll && callback();
  return res;
};

module.exports = winston;