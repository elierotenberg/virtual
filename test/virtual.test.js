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
  it.skip('new Abstract class throws error also if constructor implements the definition of virtual methods', () => {
    //// new features / probably fix. As implemented, constructor(){this.virtualMethod = ...} avoids the check.
    //// eg of fix: in construct of Proxy,
    ////let proto = Object.assign({}, target.prototype); proto.constructor = function(){void}; let value = Reflect.construct(proto, undefined, receiver)
    //// and check 'virtualMethod' in value;
  });
  it.skip('derived class that doesnt implements any virtual methods (non static), throws error', () => {
    const user_class =  class{};
    const class_with_virtual = virtual(t.enabling_flag)(user_class, 'notDefinedVirtualMethod');
    makeSureThatBaseClassThrowsError(class_with_virtual, 'virtual method is not implemented');
  });
  it.skip('derived class that implements each virtual methods, doesnt throw error', () => {
    
  });
  it.skip('derived of class with virtual derived from base class with or without virtual', () => {
    
  });
});

function makeSureThatBaseClassThrowsError(user_class, error){
  expect(()=>{callConstructorForActivateCheck(user_class);}).to.throw(error);
  
}
