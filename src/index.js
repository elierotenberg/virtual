/* global process */

const assert = require('assert');
const {ProxyTracker} = require('proxy-tracker');

const errors = {};
errors.not_implemented = (name) =>{ return "".concat(name===undefined?"":name, ' ','virtual method is not implemented');};
errors.method_already_present = (name) =>{ return "".concat(name===undefined?"":name, ' ','virtual method is already present in class');};


function Virtual(user_class, ...list_virtual_method){
  checkVirtualArgs(user_class, list_virtual_method);
  checkIfVirtualStaticMethodsAreAlreadyPresentInClass(user_class, list_virtual_method);
  
  return classWithCheckVirtualMethod(user_class, list_virtual_method);
}
function checkVirtualArgs(user_class, list_virtual_method){
  assert(typeof user_class === 'function', 'incorrect virtual method or user_class');
  assert(()=>{list_virtual_method === undefined ||
                eachVirtualMethodIsStringOrObjectWithPropertyStatic(list_virtual_method);},
                'incorrect virtual method or user_class').doesNotThrow();
}
function eachVirtualMethodIsStringOrObjectWithPropertyStatic(list_virtual_method){
  return list_virtual_method.every(met => {
                                    return typeof met === 'string' ||
                                      (typeof met === 'object' && 'static' in met && typeof met.static === 'boolean'
                                                               && 'name'   in met && typeof met.name === 'string');});
}

function checkIfVirtualStaticMethodsAreAlreadyPresentInClass(user_class, list_virtual_method){
  const list_static_virtual_methods =  list_virtual_method.filter(elem => {return isStaticMethod(elem);});
  for(let name_method of list_static_virtual_methods){
    assert(!(name_method in user_class), errors.method_already_present(name_method));
  }
}

function classWithCheckVirtualMethod(user_class, list_virtual_method){
  const static_virtual_methods =  list_virtual_method.filter(elem => {return isStaticMethod(elem);});
  const virtual_methods_of_instance = list_virtual_method.filter(elem => {return !isStaticMethod(elem);});
  const handler_class = handlerForCheckingInClass(static_virtual_methods);
  const handler_instance = handlerForCheckingInInstance(virtual_methods_of_instance);
  return new ProxyTracker(user_class, handler_class, handler_instance);
}
function isStaticMethod(method){
  return typeof method === 'object' && method.static === true;
}
function handlerForCheckingInClass(list_method){
  return {get: [checkIfExtendedClassImplementedVirtualMethod(list_method)]};
}
function handlerForCheckingInInstance(list_method){
  return {construct: checkIfInstanceOfExtendedClassImplementedVirtualMethod(list_method)};
}

function checkIfExtendedClassImplementedVirtualMethod(list_virtual_method){
  return function(value, target){
    for(let virtual_method of list_virtual_method){
      assert(typeof target[virtual_method] === 'function', errors.not_implemented());
    }
  };
}
function checkIfInstanceOfExtendedClassImplementedVirtualMethod(list_virtual_method){
  return function(value){
    for(let virtual_method of list_virtual_method){
      assert(typeof value[virtual_method] === 'function', errors.not_implemented());
    }
  };
}




module.exports.virtual = disablingVirtual;

function disablingVirtual(arg){
  let environment = process.env.NODE_ENV;
  assert(typeof arg === 'boolean' || typeof arg === 'string');
  
  if(arg === true || arg === environment) return Virtual;
  else return VirtualDisabled;
}
function VirtualDisabled(user_class){
  return user_class;
}



//// da eliminare se test passano
function insertMethodThatThrowsError(list_virtual_method){
  return function(value, target){
    for(let virtual_method of list_virtual_method){
      if(!(virtual_method in target)){
        target[virtual_method] = functionThrowNotImplementedError;
        assert.fail(errors.not_implemented());
      }
    }
  };
}
function functionThrowNotImplementedError(){
  throw new TypeError(errors.not_implemented());
}
