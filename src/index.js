'use strict';

var _ = require('lodash')
  , _s = require('underscore.string')
  , EventEmitter = require('events');

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

const NODE = Symbol('node');
const BROWSER = Symbol('browser');

class Util extends EventEmitter {
  // internal methods intended for testing purposes
  __refreshGlobalNamespace() {
    detechGlobalNamespace();
  }

  getGlobalVariable(attr, defaultValue = null) {
    return typeof globalNamespace[attr] !== 'undefined'
            ? globalNamespace[attr]
            : defaultValue;
  }

  setupExports(dir, options = {}) {
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
  }

  // Promise

  getPromise() {
    return this.getGlobalVariable('Promise', require('bluebird'));
  }

  tryPromise(value) {
    if (_.isFunction(value.then)) {
      return value;
    }

    let Promise = this.getPromise();
    return new Promise((resolve) => {
      resolve(value);
    });
  }

  eachPromise(promises, progress) {
    let promise = promises.shift();

    return this.tryPromise(promise).then((result) => {
      if (progress) {
        progress(result);
      }

      if (promises.length) {
        return this.eachPromise(promises, progress);
      }
      return result;
    });
  }

  // Cross-runtime thingy

  getRuntime() {
    if (typeof window !== 'undefined') {
      return BROWSER;
    } else if (typeof global !== 'undefined') {
      return NODE;
    } else {
      throw 'Unable to find global namespace';
    }
  }

  isNode() {
    return this.getRuntime() == NODE;
  }

  isBrowser() {
    return this.getRuntime() == BROWSER;
  }

  getEnv(attr) {
    if (this.isNode()) {
      return process.env[attr.toUpperCase()];
    } else {
      return this.getGlobalVariable(attr.toUpperCase());
    }
  }
}

module.exports = new Util();
