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
  describe('.setupExports', () => {
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

  describe('.getGlobalVariable', () => {
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

  describe('.isNode', () => {
    it('should detect node runtime', () => {
      expect(util.isNode()).toBe(true);
    });
  });

  describe('.isBrowser', () => {
    beforeEach(setupBrowserTest);

    it('should detect browser runtime', () => {
      expect(util.isBrowser()).toBe(true);
    });

    afterEach(cleanUpBrowserTest);
  });

  describe('.getEnv', () => {
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
});
