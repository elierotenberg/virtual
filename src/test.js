const Virtual = require('../');

const AbstractClass = Virtual('virtualMethodFoo', 'virtualMethodBar');

class NotTotallyAbstractClass extends AbstractClass {
  constructor() {
    super();
  }

  virtualMethodFoo() {
    console.log('foo!');
  }
}

class ActuallyConcreteClass extends NotTotallyAbstractClass {
  constructor() {
    super();
  }

  virtualMethodBar() {
    console.log('bar!');
  }
}
let didThrow = false;
try {
  new AbstractClass();
}
catch(err) {
  didThrow = true;
}
didThrow.should.be.true;

didThrow = false;
try {
  new NotTotallyAbstractClass();
}
catch(err) {
  didThrow = true;
}
didThrow.should.be.true;

didThrow = false;
try {
  new ActuallyConcreteClass();
}
catch(err) {
  didThrow = true;
}
didThrow.should.be.false;
