"use strict";

const assert = require('chai').assert;
const fs = require('fs-extra-promise');
const winston = require('../index');

let directories = [
  __dirname + '/one',
  __dirname + '/two',
  __dirname + '/three'
];

function removeFolders() {
  directories.map((dir) => {
    fs.removeSync(dir);
  });
}

function createFolders() {
  directories.map((dir) => {
    fs.ensureFileSync(dir + '/error.log');
  });
}

function emptyLogs() {
  directories.map((dir) => {
    fs.writeFileSync(dir + '/error.log', '');
  });
}

describe('WinstonCallback:', function () {
  let message = "I'am happy!";
  let logger;
  let files = [];
  let transports = [];
  let namesCounter = 0;
  let levels = ['info', 'warn', 'error'];

  before(() => {
    removeFolders();
    createFolders();

    directories.map((dir, i) => {
      let filename = dir + '/error.log';

      files.push(filename);
      transports.push(new (winston.transports.File)({
        name: (namesCounter++) + '',
        level: levels[i],
        filename: filename
      }))
    });

    const opts = {
      transports: transports
    };

    logger = winston.createLogger? winston.createLogger(opts): new winston.Logger(opts);
  });

  after(function () {
    removeFolders();
  });

  afterEach(function () {
    emptyLogs();
  });

  describe('.log()', function () {
    function checker(level, fn) {
      return new Promise((res, rej) => {
        logger.log(level, message, (err) => {
          if (err) {
            return rej(err);
          }

          fn();
          res();
        })
      })
    }

    function getCount(level, callback) {
      let counter = 0;

      return checker(level, () => {
        files.map((file) => {
          let res = fs.readFileSync(file, 'utf8') || '{}';
          res = JSON.parse(res);

          if(res.message == message) {
            counter++;
          }
        });

        callback(counter);
      })
    }

    it('check the callback working at the maximal level', function () {
      return getCount('error', (count) => {
        assert.equal(count, 3);
      })
    });

    it('check the callback working at the middle level', function () {
      return getCount('warn', (count) => {
        assert.equal(count, 2);
      })
    });

    it('check the callback working at the bottom level', function () {
      return getCount('info', (count) => {
        assert.equal(count, 1);
      })
    });

    it('check without the founded transport', function () {
      return getCount('verbose', (count) => {
        assert.equal(count, 0);
      })
    });

    it('check without the callback', function () {
      logger.log('verbose', message);
    });

    it('check with a promise', function (done) {
      logger.log('verbose', message).then(done);
    });
  });
});

