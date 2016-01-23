'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = require('lodash'),
    _s = require('underscore.string'),
    EventEmitter = require('events');

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

var NODE = Symbol('node');
var BROWSER = Symbol('browser');

var Util = function (_EventEmitter) {
  _inherits(Util, _EventEmitter);

  function Util() {
    _classCallCheck(this, Util);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Util).apply(this, arguments));
  }

  _createClass(Util, [{
    key: '__refreshGlobalNamespace',

    // internal methods intended for testing purposes
    value: function __refreshGlobalNamespace() {
      detechGlobalNamespace();
    }
  }, {
    key: 'getGlobalVariable',
    value: function getGlobalVariable(attr) {
      var defaultValue = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      return typeof globalNamespace[attr] !== 'undefined' ? globalNamespace[attr] : defaultValue;
    }
  }, {
    key: 'setupExports',
    value: function setupExports(dir) {
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
    }

    // Promise

  }, {
    key: 'getPromise',
    value: function getPromise() {
      return this.getGlobalVariable('Promise', require('bluebird'));
    }
  }, {
    key: 'tryPromise',
    value: function tryPromise(value) {
      if (_.isFunction(value.then)) {
        return value;
      }

      var Promise = this.getPromise();
      return new Promise(function (resolve) {
        resolve(value);
      });
    }
  }, {
    key: 'eachPromise',
    value: function eachPromise(promises, progress) {
      var _this2 = this;

      var promise = promises.shift();

      return this.tryPromise(promise).then(function (result) {
        if (progress) {
          progress(result);
        }

        if (promises.length) {
          return _this2.eachPromise(promises, progress);
        }
        return result;
      });
    }

    // Cross-runtime thingy

  }, {
    key: 'getRuntime',
    value: function getRuntime() {
      if (typeof window !== 'undefined') {
        return BROWSER;
      } else if (typeof global !== 'undefined') {
        return NODE;
      } else {
        throw 'Unable to find global namespace';
      }
    }
  }, {
    key: 'isNode',
    value: function isNode() {
      return this.getRuntime() == NODE;
    }
  }, {
    key: 'isBrowser',
    value: function isBrowser() {
      return this.getRuntime() == BROWSER;
    }
  }, {
    key: 'getEnv',
    value: function getEnv(attr) {
      if (this.isNode()) {
        return process.env[attr.toUpperCase()];
      } else {
        return this.getGlobalVariable(attr.toUpperCase());
      }
    }
  }]);

  return Util;
}(EventEmitter);

module.exports = new Util();