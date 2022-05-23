





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

module.exports.virtual = virtual_method;
