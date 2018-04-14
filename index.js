"use strict";

const winston = require('winston');

let Logger = winston.Logger;
let oldLog = Logger.prototype.log;

Logger.prototype.log = function (level) {
  let keys = Object.keys(this.transports);
  let countAll = 0;
  let countLogged = 0;
  let args = [].slice.call(arguments);
  let last = args[args.length - 1];
  let callback = typeof last == 'function'? last: false;
  let result = [];

  if(!callback) {
    return oldLog.apply(this, args);
  }

  args[args.length - 1] = function (err) {
    if(err || !countAll) {
      callback(err);
    }

    result = arguments;
  };

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
      countLogged++;

      if(countAll <= countLogged) {
        callback.apply(callback, result);
      }
    }

    function onError (err) {
      transport.removeListener('error', onError);
      callback(err);
    }

    transport.on('logged', onLogged);
    transport.on('error', onError);
  });

  return oldLog.apply(this, args);
};

module.exports = winston;