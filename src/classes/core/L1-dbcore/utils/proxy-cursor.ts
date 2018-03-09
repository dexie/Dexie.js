import { Cursor, Key } from '../dbcore';

export interface ProxyCursorHooks {
  // Methods
  proxyOnNext?: (onNext: ()=>void) => ()=>void;
  getKey?: () => Key;
  getPrimaryKey?: () => Key;
  getValue?: ( )=> any;
  provideKey?: (key: Key) => Key;
  providePrimaryKey?: (key: Key) => Key;
}

export function ProxyCursor (
  cursor: Cursor, {
    proxyOnNext,
    getKey,
    getPrimaryKey,
    getValue,
    provideKey,
    providePrimaryKey
  }: ProxyCursorHooks
) : Cursor
{
  let skipOrUpNext;
  let upNext = skipOrUpNext = ()=>{};
  
  const props: PropertyDescriptorMap = {
    start: {
      value: (onNextUpper: ()=>void, key?: Key, primaryKey?: Key) => {
        if (key && provideKey) key = provideKey(key);
        if (primaryKey && providePrimaryKey) primaryKey = providePrimaryKey(primaryKey);
        skipOrUpNext = upNext = onNextUpper;
        return cursor.start(proxyOnNext ? proxyOnNext(()=>skipOrUpNext()) : onNextUpper, key, primaryKey);
      }
    }
  };
  if (getKey) props.key = {get: getKey};
  if (getPrimaryKey) props.primaryKey = {get: getPrimaryKey};
  if (getValue) props.value = {get: getValue};
  if (proxyOnNext) props.advance = {
    value: (count: number) => {
      if (count > 1) skipOrUpNext = () => {
        if (--count === 1) skipOrUpNext = upNext;
        cursor.continue();
        return;
      }
      cursor.continue();
    }
  };
  if (provideKey) {
    props.continue = {
      value: (key?: Key) => key == null ?
        cursor.continue() :
        cursor.continue(provideKey(key))
    }
    props.continuePrimaryKey = {
      value: (key: Key, primaryKey: Key) => {
        cursor.continuePrimaryKey(provideKey(key), providePrimaryKey ? providePrimaryKey(primaryKey) : primaryKey);
      }
    }
  }
  return Object.create(cursor, props);
}
