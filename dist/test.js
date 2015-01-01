"use strict";

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
var Virtual = require("../");

var AbstractClass = Virtual("virtualMethodFoo", "virtualMethodBar");

var NotTotallyAbstractClass = (function () {
  var _AbstractClass = AbstractClass;
  var NotTotallyAbstractClass = function NotTotallyAbstractClass() {
    _AbstractClass.call(this);
  };

  _inherits(NotTotallyAbstractClass, _AbstractClass);

  NotTotallyAbstractClass.prototype.virtualMethodFoo = function () {
    console.log("foo!");
  };

  return NotTotallyAbstractClass;
})();

var ActuallyConcreteClass = (function () {
  var _NotTotallyAbstractClass = NotTotallyAbstractClass;
  var ActuallyConcreteClass = function ActuallyConcreteClass() {
    _NotTotallyAbstractClass.call(this);
  };

  _inherits(ActuallyConcreteClass, _NotTotallyAbstractClass);

  ActuallyConcreteClass.prototype.virtualMethodBar = function () {
    console.log("bar!");
  };

  return ActuallyConcreteClass;
})();

var didThrow = false;
try {
  new AbstractClass();
} catch (err) {
  didThrow = true;
}
didThrow.should.be.true;

didThrow = false;
try {
  new NotTotallyAbstractClass();
} catch (err) {
  didThrow = true;
}
didThrow.should.be.true;

didThrow = false;
try {
  new ActuallyConcreteClass();
} catch (err) {
  didThrow = true;
}
didThrow.should.be.false;