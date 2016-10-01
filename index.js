const winston = require('winston');

let Logger = winston.Logger;
let old = Logger.prototype.log;
    
Logger.prototype.log = function() {
    let keys = Object.keys(this.transports);
    let countAll = keys.length;
    let countLogged = 0;
    let args = [].slice.call(arguments);    
    let callback = typeof args[args.length - 1] == 'function'? args[args.length - 1]: false;
    let error = null;
    
    if(!callback) {
        return old.apply(this, args);
    }
            
    if(callback) {        
        args.pop();
    }
    
    args.push(function (err) {
        if(error) {
            error = err;
        }
    })
    
    keys.map((key) => {
        let transport = this.transports[key];
        
        let onLogged = () => {
            countLogged++;            
            transport.removeListener('logged', onLogged);
            
            if(countAll == countLogged) {
                if(callback) {
                    callback(error);
                }
            }
        }
        
        let onError = (err) => {
            transport.removeListener('error', onError);
            
            if(callback) {
                callback(err);
            }
        }
        
        transport.on('logged', onLogged);
        transport.on('error', onError);
    });
    
    return old.apply(this, args);
}

module.exports = winston;