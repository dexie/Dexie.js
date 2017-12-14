
export function makeClassConstructor<TConstructor> (prototype: Object, constructor: Function) {
  constructor.prototype = {
    ...prototype,
    constructor: constructor
  };
  return constructor as any as TConstructor;
}
