"use strict";

var _slice = Array.prototype.slice;
var _inherits = function (child, parent) {
  child.prototype = Object.create(parent && parent.prototype, {
    constructor: {
      value: child,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (parent) child.__proto__ = parent;
};

require("6to5/polyfill");
var _ = require("lodash");
var should = require("should");
var Promise = (global || window).Promise = require("bluebird");
var __DEV__ = process.env.NODE_ENV !== "production";
var __PROD__ = !__DEV__;
var __BROWSER__ = typeof window === "object";
var __NODE__ = !__BROWSER__;
if (__DEV__) {
  Promise.longStackTraces();
}
var VirtualMethodCall = (function () {
  var _TypeError = TypeError;
  var VirtualMethodCall = function VirtualMethodCall(name) {
    this.message = "Attempting to call virtual method " + name + ".";
  };

  _inherits(VirtualMethodCall, _TypeError);

  return VirtualMethodCall;
})();

var VirtualMethodNotImplemented = (function () {
  var _TypeError2 = TypeError;
  var VirtualMethodNotImplemented = function VirtualMethodNotImplemented(name) {
    this.message = "Virtual method " + name + " not implemented.";
  };

  _inherits(VirtualMethodNotImplemented, _TypeError2);

  return VirtualMethodNotImplemented;
})();

var __virtualMethod = function (name) {
  return function () {
    if (__DEV__) {
      throw new VirtualMethodCall(name);
    }
  };
};

module.exports = function () {
  var properties = _slice.call(arguments);

  var virtualMethods = {};
  properties.forEach(function (name) {
    return virtualMethods[name] = __virtualMethod(name);
  });
  var Virtual = function Virtual() {
    var _this = this;
    if (__DEV__) {
      properties.forEach(function (name) {
        if (_this[name] === virtualMethods[name]) {
          throw new VirtualMethodNotImplemented(name);
        }
      });
    }
  };

  Object.assign(Virtual.prototype, virtualMethods);

  return Virtual;
};