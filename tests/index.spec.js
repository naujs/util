var util = require('../build');

describe('util', function() {
  describe('.setupExports', function() {
    it('should automatically grab all files in a folder', function() {
      var e = util.setupExports(__dirname + '/setup_exports');
      expect(e.methodName).toBeDefined();
    });

    it('should use file name as method name', function() {
      var e = util.setupExports(__dirname + '/setup_exports', {
        camelCase: false
      });
      expect(e.method_name).toBeDefined();
      expect(e.methodName).not.toBeDefined();
    });

    it('should skip index.js by default', function() {
      var e = util.setupExports(__dirname + '/setup_exports');
      expect(e.index).not.toBeDefined();
    });

    it('should skip files', function() {
      var e = util.setupExports(__dirname + '/setup_exports', {
        skips: ['skip.js']
      });
      expect(e.methodName).toBeDefined();
      expect(e.skip).not.toBeDefined();
    });
  });
});
