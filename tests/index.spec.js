var util = require('../build');

function cleanUpBrowserTest() {
  delete global.window;
  util.__refreshGlobalNamespace();
}

function setupBrowserTest() {
  global.window = {};
  util.__refreshGlobalNamespace();
}

describe('util', () => {
  describe('#setupExports', () => {
    it('should automatically grab all files in a folder', () => {
      var e = util.setupExports(__dirname + '/setup_exports');
      expect(e.methodName).toBeDefined();
    });

    it('should use file name as method name', () => {
      var e = util.setupExports(__dirname + '/setup_exports', {
        camelCase: false
      });
      expect(e.method_name).toBeDefined();
      expect(e.methodName).not.toBeDefined();
    });

    it('should skip index.js by default', () => {
      var e = util.setupExports(__dirname + '/setup_exports');
      expect(e.index).not.toBeDefined();
    });

    it('should skip files', () => {
      var e = util.setupExports(__dirname + '/setup_exports', {
        skips: ['skip.js']
      });
      expect(e.methodName).toBeDefined();
      expect(e.skip).not.toBeDefined();
    });
  });

  describe('#getGlobalVariable', () => {
    beforeEach(() => {
      global.test = 'test';
    });

    it('should get global variable in node runtime', () => {
      expect(util.getGlobalVariable('test')).toEqual('test');
    });

    it('should get global variable in browser runtime', () => {
      setupBrowserTest();
      global.window.test = 'window';
      expect(util.getGlobalVariable('test')).toEqual('window');
    });

    afterEach(cleanUpBrowserTest);
  });

  describe('#isNode', () => {
    it('should detect node runtime', () => {
      expect(util.isNode()).toBe(true);
    });
  });

  describe('#isBrowser', () => {
    beforeEach(setupBrowserTest);

    it('should detect browser runtime', () => {
      expect(util.isBrowser()).toBe(true);
    });

    afterEach(cleanUpBrowserTest);
  });

  describe('#getEnv', () => {
    beforeEach(() => {
      process.env.TEST = 'node';
    });

    it('should get env variable in node', () => {
      expect(util.getEnv('test')).toEqual('node');
    });

    it('should get env variable in browser', () => {
      setupBrowserTest();
      global.window.TEST = 'browser';
      expect(util.getEnv('test')).toEqual('browser');
    });

    afterEach(cleanUpBrowserTest);
  });

  describe('#tryPromise', () => {
    it('should convert normal value into a promise resolving to that value', () => {
      function fn() {
        return 1;
      };

      return util.tryPromise(fn()).then(function(result) {
        expect(result).toEqual(1);
      });
    });

    it('should handle undefined', () => {
      function fn() {};

      return util.tryPromise(fn()).then(function(result) {
        expect(result).toBeUndefined();
      });
    });

    it('should reject if having an instance of Error', () => {
      function fn() {
        return new Error('test');
      };

      return util.tryPromise(fn()).then(function(result) {
        throw 'Should not resolve';
      }, function(err) {
        expect(err.message).toEqual('test');
      });
    });
  });

  fdescribe('#eachPromise', () => {
    var Promise;

    beforeEach(() => {
      Promise = util.getPromise();
    });

    it('should execute each promise in the provided order', () => {
      var results = [];
      var promises = [
        Promise.resolve(0).then((result) => {
          results.push(result);
        }),
        Promise.resolve(2).then((result) => {
          results.push(result);
        }),
        Promise.resolve(1).then((result) => {
          results.push(result);
          return result;
        }),
      ];

      return util.eachPromise(promises, () => {

      }).then((result) => {
        expect(results).toEqual([0, 2, 1]);
      });
    });

    it('should call process function after each promise execution', () => {
      var process = jasmine.createSpy('process');
      var promises = [
        Promise.resolve(0),
        Promise.resolve(2),
        Promise.resolve(1)
      ];

      return util.eachPromise(promises, process).then((result) => {
        expect(process.calls.count()).toBe(3);
        expect(process.calls.argsFor(0)).toEqual([0]);
        expect(process.calls.argsFor(1)).toEqual([2]);
        expect(process.calls.argsFor(2)).toEqual([1]);
      });
    });

    it('should stop when there is a rejection', () => {
      var process = jasmine.createSpy('process');
      var promises = [
        Promise.resolve(0),
        Promise.reject(2),
        Promise.resolve(1)
      ];

      return util.eachPromise(promises, process).then(fail, (error) => {
        expect(error).toBe(2);
        expect(process.calls.count()).toBe(1);
        expect(process.calls.argsFor(0)).toEqual([0]);
      });
    });

    it('should support an array of values', () => {
      var results = [];
      var values = [
        1,
        2,
        3
      ];

      return util.eachPromise(values, (value) => {
        results.push(value * value);
      }).then(() => {
        expect(results).toEqual([
          1,
          4,
          9
        ]);
      });
    });
  });

  describe('#defer', () => {
    it('should return a deferred object', (done) => {
      var deferred = util.defer();

      deferred.promise.then((result) => {
        expect(result).toEqual(1);
      }).then(done, fail);

      deferred.resolve(1);
    });

    it('should allow rejection', (done) => {
      var deferred = util.defer();

      deferred.promise.then(fail, (error) => {
        expect(error).toEqual(1);
      }).then(done);

      deferred.reject(1);
    });
  });

});
