"use strict";

const winston = require('winston');

let Logger = winston.Logger;
let oldLog = Logger.prototype.log;
let oldLazyDrain = winston.transports.File.prototype._lazyDrain;

Logger.prototype.log = function(level) {
  let keys = Object.keys(this.transports);
  let countAll = 0;
  let countLogged = 0;
  let args = [].slice.call(arguments);
  let callback = typeof args[args.length - 1] == 'function'? args[args.length - 1]: false;

  if(!callback) {
    return oldLog.apply(this, args);
  }

  args.pop();

  args.push(function (err) {
    if(err || !countAll) {
      callback(err);
    }
  });

  keys.map((key) => {
    let transport = this.transports[key];

    if(this.levels[transport.level] >= this.levels[level]) {
      countAll += 1;
    }
    else {
      return;
    }

    function onLogged() {
      transport.removeListener('logged', onLogged);
      countLogged++;

      if(countAll <= countLogged) {
        callback();
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