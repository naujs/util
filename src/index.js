var _ = require('lodash')
  , _s = require('underscore.string')
  , fs = require('fs');

module.exports = {
  setupExports(dir, options = {}) {
    options = _.defaults(options, {
      skips: [],
      camelCase: true
    });

    options.skips.push('index.js');

    var exports = {};
    var methods = fs.readdirSync(dir);
    for (var i in methods) {
      var method = methods[i];
      if (options.skips.indexOf(method) != -1) {
        continue;
      }

      var methodName = method.split('.')[0];
      if (options.camelCase) {
        methodName = _s.camelize(methodName);
      }
      var methodRequirePath = dir + '/' + method;
      exports[methodName] = require(methodRequirePath);
    }

    return exports;
  }
};
