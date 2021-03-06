Virtual
=======

Userland, runtime-checked virtual classes for ES6.

Pass in `NODE_ENV=development` to get runtime checks. Pass in `NODE_ENV=production` to disable them.

### Example

```js
// create a new class with 2 virtual methods
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
  // 2 missing implems
  new AbstractClass();
}
catch(err) {
  didThrow = true;
}
didThrow.should.be.true;

didThrow = false;
try {
  // 1 missing implem
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
```
