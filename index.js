const winston = require('winston');

let Logger = winston.Logger;
let old = Logger.prototype.log;
    
Logger.prototype.log = function(level) {
    let keys = Object.keys(this.transports);
    let countAll = 0;
    let countLogged = 0;
    let args = [].slice.call(arguments);    
    let callback = typeof args[args.length - 1] == 'function'? args[args.length - 1]: false;
    let error = null;
    
    if(!callback) {
        return old.apply(this, args);
    }
    
    args.pop();    
    
    args.push(function (err) {
        if(err) {
            callback(err);
        }
    })
    
    keys.map((key) => {
        let transport = this.transports[key];
       
        if(this.levels[transport.level] >= this.levels[level]) {
            countAll += 1;
        }
        
        let onLogged = () => {
            countLogged++;                       
            transport.removeListener('logged', onLogged);
            
            if(countAll <= countLogged) {
                callback();
            }
        }
        
        let onError = (err) => {
            transport.removeListener('error', onError);
            callback(err);
        }
        
        transport.on('logged', onLogged);
        transport.on('error', onError);
    });
    
    return old.apply(this, args);
}

module.exports = winston;