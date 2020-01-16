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
  let failed = false;
  let fn = callback;

  return new Promise((resolve, reject) => {
    if(fn) {
      args.pop();
    }

    callback = err => {
      if(err) {
        return reject(err);
      }
  
      fn && fn();
      resolve();
    };
  
    keys.map((key) => {
      let transport = this.transports[key];
      
      if(!transport.silent && this.levels[transport.level] >= this.levels[level]) {
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
          p = new Promise((_resolve) => {
            function onOpen () {
              transport.removeListener('open', onOpen);
              _resolve();
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
        !failed && callback(err);
        failed = true;
      }
  
      transport.on('logged', onLogged);
      transport.on('error', onError);
    });
  
    oldLog.apply(this, args);  
    !countAll && callback();
  });  
};

module.exports = winston;