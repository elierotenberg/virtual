/* global Promise, describe, it, __dirname, process*/
const ENVIRONMENT = process.env.NODE_ENV;
const {changeEnv} = require('change-env');
const util = require('util');

const {expect, assert} = require('chai');

const {virtual} = require(`../`);

const t = {args_correct_for_virtual: [class example{}, 'name_virtual_method'],
          args_for_disable_testing: [class example{}, 'name_virtual_method'],
          enablig_flag: true};
Object.freeze(t);


describe('Virtual features and errors', () => {
  it('virtual is a function', () => {
    expect(virtual).to.be.a('function');
  });
  it('virtual with wrong disabling flag throws error', () => {
    for(let wrong_flag of [undefined, [], [1,2,3], 0, 5, -8, {}]){
      expect(()=>{virtual(wrong_flag);}).to.throw('Virtual method is not implemented');
    }
  });
  it('virtual already defined throws error', () => {
    const user_class = class {staticMethodAlreadyDefined(){}; methodAlreadyDefined(){}};
    const list_virtual_method = ['methodAlreadyDefined', {name: 'staticMethodAlreadyDefined', static: true}];
    expect(()=>{virtual(t.enablig_flag)(user_class, ...list_virtual_method);}).to.throws('virtual method is already present in class')
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
describe('Virtual disabled', () => {
  it.skip('flag false disables Virtual', () => {
    
  });
  it.skip('flag string that doesnt match with environment disables Virtual', () => {
    
  });
});