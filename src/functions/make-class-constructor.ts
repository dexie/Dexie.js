import { arrayToObject, derive } from './utils';


export function makeClassConstructor<TConstructor> (prototype: Object, constructor: Function) {
  /*const propertyDescriptorMap = arrayToObject(
    Object.getOwnPropertyNames(prototype),
    propKey => [propKey, Object.getOwnPropertyDescriptor(prototype, propKey)]);

  // Both derive and clone the prototype.
  //   derive: So that x instanceof T returns true when T is the class template.
  //   clone: Optimizes method access a bit (but actually not nescessary)
  const derivedPrototypeClone = Object.create(prototype, propertyDescriptorMap);
  derivedPrototypeClone.constructor = constructor;
  constructor.prototype = derivedPrototypeClone;
  return constructor as any as TConstructor;*/

  // Keep the above code in case we want to clone AND derive the parent prototype.
  // Reason would be optimization of property access.
  // The code below will only create a prototypal inheritance from given constructor function
  // to given prototype.
  derive(constructor).from({prototype});
  return constructor as any as TConstructor;  
}
