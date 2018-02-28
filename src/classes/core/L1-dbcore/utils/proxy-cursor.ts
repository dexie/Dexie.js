import { Cursor, Key, OpenCursorResponse } from '../dbcore';
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

export function openProxyCursor(res: OpenCursorResponse, methods: ProxyCursorMethods, getters: ProxyCursorGetters, options?: ProxyCursorOptions) {
  const props: PropertyDescriptorMap = {};
  let {cursor, iterate} = res;
  Object.keys(methods).forEach(method => props[method] = {value: methods[method]});
  Object.keys(getters).forEach(getter => props[getter] = {get: getters[getter]});
  let upNext: ()=>void;
  let tmpOnNext: ()=>void;
  if (options.adv) {
    iterate = (onNext: ()=>void) => {
      upNext = tmpOnNext = onNext;
      return res.iterate(() => {
        tmpOnNext();
      });
    };
    props.advance = {value: function(count: number) {
      if (count > 1) upNext = () => {
        if (--count === 1) upNext = _onNextImpl;
        this.continue();
    }
    this.continue();
  
    }}
  }
  return {
    cursor: Object.create(res.cursor, props),
    iterate
  }
}
