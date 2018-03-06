import { Cursor, Key } from '../dbcore';
/* Inkomplett! Får se om denna behövs!
*/
export interface ProxyCursorMethods {
  // Methods
  continue?: (key?: Key) => void;
  continuePrimaryKey?: (key: Key, primaryKey: Key) => void;
  advance?: (count: number) => void;
  close?: ()=>void;
  fail?: (error:Error)=>void;
}
  // Smart Methods
  //continueNext?: ()=>void;
export interface ProxyCursorGetters {
  // Getters
  key?: ()=>Key;
  primaryKey?: ()=>Key;
  value?: ()=>any;
}

export interface ProxyCursorOptions {
  adv?: boolean;
  onNext?: (upNext: ()=>void) => ()=>void;
}

export function openProxyCursor(cursor: Cursor, methods: ProxyCursorMethods, getters: ProxyCursorGetters, options?: ProxyCursorOptions) {
  const props: PropertyDescriptorMap = {};
  Object.keys(methods).forEach(method => props[method] = {value: methods[method]});
  Object.keys(getters).forEach(getter => props[getter] = {get: getters[getter]});
  let upNext: ()=>void;
  let tmpOnNext: ()=>void;
  if (options.adv) {
    props.start = {value: (onNext: ()=>void, key?, primaryKey?) => {
      // TODO: How should we take care of key or primaryKey?
      upNext = tmpOnNext = onNext;
      return cursor.start(() => {
        tmpOnNext();
      });
    }};
    props.advance = {value: function(count: number) {
      if (count > 1) tmpOnNext = () => {
        if (--count === 1) tmpOnNext = upNext;
        this.continue();
        return;
      }
      this.continue();
    }}
  }
  return Object.create(cursor, props);
}
