class VirtualMethodCall extends TypeError {
  constructor(name) {
    this.message = `Attempting to call virtual method ${name}.`;
  }
}

class VirtualMethodNotImplemented extends TypeError {
  constructor(name) {
    this.message = `Virtual method ${name} not implemented.`;
  }
}

const __virtualMethod = (name) => () => {
  if(__DEV__) {
    throw new VirtualMethodCall(name);
  }
};

module.exports = function(...properties) {
  const virtualMethods = {};
  properties.forEach((name) => virtualMethods[name] = __virtualMethod(name));
  class Virtual {
    constructor() {
      if(__DEV__) {
        properties.forEach((name) => {
          if(this[name] === virtualMethods[name]) {
            throw new VirtualMethodNotImplemented(name);
          }
        });
      }
    }
  }
  Object.assign(Virtual.prototype, virtualMethods);

  return Virtual;
};
