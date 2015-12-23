'use strict';

var _ = require('lodash'),
    _s = require('underscore.string');

var globalNamespace;
detechGlobalNamespace();

function detechGlobalNamespace() {
  if (typeof window !== 'undefined') {
    globalNamespace = window;
  } else if (typeof global !== 'undefined') {
    globalNamespace = global;
  } else {
    throw 'Unable to find global namespace';
  }
}

module.exports = {
  NODE: Symbol('node'),
  BROWSER: Symbol('browser'),

  // internal methods intended for testing purposes
  __refreshGlobalNamespace: function __refreshGlobalNamespace() {
    detechGlobalNamespace();
  },
  getGlobalVariable: function getGlobalVariable(attr) {
    var defaultValue = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return typeof globalNamespace[attr] !== 'undefined' ? globalNamespace[attr] : defaultValue;
  },
  setupExports: function setupExports(dir) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    options = _.defaults(options, {
      skips: [],
      camelCase: true
    });

    options.skips.push('index.js');

    var exports = {};
    var methods = require('fs').readdirSync(dir);
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
  },
  getPromise: function getPromise() {
    return this.getGlobalVariable('Promise', require('bluebird'));
  },
  getRuntime: function getRuntime() {
    if (typeof window !== 'undefined') {
      return this.BROWSER;
    } else if (typeof global !== 'undefined') {
      return this.NODE;
    } else {
      throw 'Unable to find global namespace';
    }
  },
  isNode: function isNode() {
    return this.getRuntime() == this.NODE;
  },
  isBrowser: function isBrowser() {
    return this.getRuntime() == this.BROWSER;
  },
  getEnv: function getEnv(attr) {
    if (this.isNode()) {
      return process.env[attr.toUpperCase()];
    } else {
      return this.getGlobalVariable(attr.toUpperCase());
    }
  }
};