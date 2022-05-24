/* global Promise, describe, it, __dirname, process*/
const ENVIRONMENT = process.env.NODE_ENV;
const ChangeEnv = require('change-env')(require);
const util = require('util');

const {expect, assert} = require('chai');

const {virtual} = require(`../`);

const t = {args_correct_for_virtual: [class example{}, 'name_virtual_method'],
          args_for_disable_testing: [class example{}, 'name_virtual_method'],
          enabling_flag: true};
Object.freeze(t);


describe('Virtual features and errors', () => {
  it('virtual is a function', () => {
    expect(virtual).to.be.a('function');
  });
  it('virtual with wrong disabling flag throws error', () => {
    for(let wrong_flag of [undefined, [], [1,2,3], 0, 5, -8, {}]){
      expect(()=>{virtual(wrong_flag);}).to.throw('The flag for disabling Virtual is wrong');
    }
  });
  it('virtual already defined throws error', () => {
    class user_class{static staticMethodAlreadyDefined(){}; methodAlreadyDefined(){}};
    const list_virtual_method = ['methodAlreadyDefined', {name: 'staticMethodAlreadyDefined', static: true}];
    expect(()=>{virtual(t.enabling_flag)(user_class, ...list_virtual_method);}).to.throws('virtual method is already present in class');
  });
  it('virtual non static already defined throws error', () => {
    class user_class{methodAlreadyDefined(){}};
    const list_virtual_method = ['methodAlreadyDefined'];
    let class_with_virtual;
    expect(()=>{class_with_virtual = virtual(t.enabling_flag)(user_class, ...list_virtual_method);}).to.throw('virtual method is already present in class');
  });
  const wrong_args = {notClass: [{}, 'name_virtual_method'],
                      method_not_string: [function(){}, 'name', 5, 'previous_isnt_string'],
                      method_without_static: [function(){}, 'name', {name: 'name_method'}, 'previous_hasnt_static_property'],
                      method_without_name: [function(){}, 'name', {static: false}, 'previous_hasnt_name_property'],
                      method_with_no_correct_name: [function(){}, 'name', {name: 5, static: false}, 'previous_hasnt_correct_name'],
                      method_with_no_correct_static: [function(){}, 'name', {name: 'name_method', static: 'incorrect value'}, 'previous_hasnt_correct_static']};
  for(let wrong in wrong_args){
    it(`virtual with ${wrong} / wrong args ${util.inspect(wrong_args[wrong])} : throws error`, () => {
      expect(()=>{virtual(t.enabling_flag)(...wrong_args[wrong]);}).to.throws('incorrect virtual method or user_class');
    });
  }

  
});
describe('Enabling', () => {
  class user_class{static staticMethodAlreadyDefined(){}; methodAlreadyDefined(){}};
  const list_of_virtual_methods = ['methodAlreadyDefined', {name: 'staticMethodAlreadyDefined', static: true},
                                    'otherVirtualethodNotDefined', {name: 'otherStaticVirtualMethodNotDefined', static: true}];
  describe('Virtual disabled', () => {
    it('flag false disables Virtual', () => {
      testVirtualDisabled(virtual(false),user_class, list_of_virtual_methods);
    });
    it('flag string that doesnt match with environment disables Virtual', () => {
      const ENVIRONMENT = 'this doesnt match';
      testVirtualDisabled(virtual(ENVIRONMENT),user_class, list_of_virtual_methods);
    });
  });
  describe('Virtual enabled', () => {
    it('flag true enables Virtual', () => {
      testVirtualEnabled(virtual(true),user_class, list_of_virtual_methods);
    });
    it('flag string that matchs with environment enables Virtual', () => {
      const ENVIRONMENT = 'this matches';
      ChangeEnv(ENVIRONMENT, ()=>{
        testVirtualEnabled(virtual(ENVIRONMENT),user_class, list_of_virtual_methods);
      });
    });
  });
});

function testVirtualDisabled(virtual, user_class, list_of_virtual_methods){
  const class_with_virtual = virtual(user_class, ...list_of_virtual_methods);
  expect(()=>{callMethodForActivateCheck(class_with_virtual);}).to.not.throw();
  expect(()=>{callConstructorForActivateCheck(class_with_virtual);}).to.not.throw();
}
function testVirtualEnabled(virtual, user_class, list_of_virtual_methods){
  let class_with_virtual;
  expect(()=>{class_with_virtual = virtual(user_class, ...list_of_virtual_methods);}).to.throw('virtual method is already present in class');
}

function callMethodForActivateCheck(user_class){
  user_class.anyMethodorProperty;
}
function callConstructorForActivateCheck(user_class){
  new user_class();
}
describe('Virtual usage', () => {
  it('derived class that doesnt implements any virtual methods (NON static), throws error', () => {
    const user_class =  class{constructor(arg){this.constructor_classe_base = arg;}};
    const class_with_virtual = virtual(t.enabling_flag)(user_class, 'notDefinedVirtualMethod');
    makeSureThatBaseClassThrowsError(class_with_virtual, 'virtual method is not implemented');
    const derived_user_class = class extends class_with_virtual{
      constructor(arg){super(arg); this.prova_che_constructor_chiamato = arg;}
    };
    expect(()=>{callConstructorForActivateCheck(derived_user_class);}).to.throw('virtual method is not implemented');
  });
  it('derived class that implements each virtual methods (NON static), doesnt throw error', () => {
    const user_class =  class{constructor(arg){this.constructor_classe_base = arg;}};
    const class_with_virtual = virtual(t.enabling_flag)(user_class, 'notDefinedVirtualMethod');
    makeSureThatBaseClassThrowsError(class_with_virtual, 'virtual method is not implemented');
    const derived_user_class = class extends class_with_virtual{
      constructor(arg){super(arg); this.prova_che_constructor_chiamato = arg;}
      notDefinedVirtualMethod(){/* body */}
    };
    expect(()=>{callConstructorForActivateCheck(derived_user_class);}).to.not.throw();
  });
  it('derived class that doesnt implements any virtual methods (STATIC), throws error', () => {
    const user_class =  class{constructor(arg){this.constructor_classe_base = arg;}};
    const class_with_virtual = virtual(t.enabling_flag)(user_class, {name: 'notDefinedStaticVirtualMethod', static: true});
    makeSureThatBaseClassThrowsErrorWithStaticMethod(class_with_virtual, 'virtual method is not implemented');
    
    const derived_user_class = class extends class_with_virtual{
      constructor(arg){super(arg); this.prova_che_constructor_chiamato = arg;}
    };
    expect(()=>{callMethodForActivateCheck(derived_user_class);}).to.throw('virtual method is not implemented');
  });
  it.skip('derived class that implements each virtual methods (STATIC), doesnt throw error', () => {
    //// al momento bisogna trovare una soluzione per trovare static definite o meno attraverso la chiamata di metodi,
    //// sembra che il problema sia extends che innesca la trappola su get prototype
    //// e successivamente nella derivata non si trovano i metodi nuovi definiti
    const user_class =  class{constructor(arg){this.constructor_classe_base = arg;}};
    const class_with_virtual = virtual(t.enabling_flag)(user_class, {name: 'notDefinedStaticVirtualMethod', static: true});
    makeSureThatBaseClassThrowsErrorWithStaticMethod(class_with_virtual, 'virtual method is not implemented');
    const derived_user_class = class extends class_with_virtual{
      constructor(arg){super(arg); this.prova_che_constructor_chiamato = arg;}
      static notDefinedStaticVirtualMethod(){/* body */}
    };

    expect(()=>{callMethodForActivateCheck(derived_user_class);}).to.not.throw();
  });
  it.skip('the virtual static method missed in derived class is found also if user doesnt get static method but make constructor functionality', () => {
    /// da implementare, usando {construct: {get: }} come handler per proxy-tracker
    const user_class =  class{constructor(arg){this.constructor_classe_base = arg;}};
    const class_with_virtual = virtual(t.enabling_flag)(user_class, {name: 'notDefinedStaticVirtualMethod', static: true});
    makeSureThatBaseClassThrowsErrorWithStaticMethod(class_with_virtual, 'virtual method is not implemented');
    
    const derived_user_class = class extends class_with_virtual{
      constructor(arg){super(arg); this.prova_che_constructor_chiamato = arg;}
    };
    expect(()=>{callConstructorForActivateCheck(derived_user_class);}).to.throw('virtual method is not implemented');
  });
  it.skip('the virtual method missed in derived instance class is found also if user doesnt construct instance but make get functionality', () => {
    /// anche questo, da implemnetare con handler {get: callback che simula creazione istanza per cercare presenza metodo}
  });
  it.skip('derived of class with virtual derived from base class with or without virtual', () => {
    
  });
});

function makeSureThatBaseClassThrowsError(user_class, error){
  expect(()=>{callConstructorForActivateCheck(user_class);}).to.throw(error);
}
function makeSureThatBaseClassThrowsErrorWithStaticMethod(user_class, error){
  expect(()=>{callMethodForActivateCheck(user_class);}).to.throw(error);
}
