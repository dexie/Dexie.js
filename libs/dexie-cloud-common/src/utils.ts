export function assert(b: boolean): asserts b is true {
  if (!b) throw new Error('Assertion Failed');
}

const _hasOwn = {}.hasOwnProperty;
export function hasOwn(obj, prop) {
    return _hasOwn.call(obj, prop);
}

type SetByKeyPathTarget =
  | { [keyPath: string]: SetByKeyPathTarget }
  | SetByKeyPathTarget[];

export function setByKeyPath(
  obj: SetByKeyPathTarget,
  keyPath: string | ArrayLike<string>,
  value: any
) {
  if (!obj || keyPath === undefined) return;
  if ('isFrozen' in Object && Object.isFrozen(obj)) return;
  if (typeof keyPath !== 'string' && 'length' in keyPath) {
    assert(typeof value !== 'string' && 'length' in value);
    for (var i = 0, l = keyPath.length; i < l; ++i) {
      setByKeyPath(obj, keyPath[i], value[i]);
    }
  } else {
    var period = keyPath.indexOf('.');
    if (period !== -1) {
      var currentKeyPath = keyPath.substr(0, period);
      var remainingKeyPath = keyPath.substr(period + 1);
      if (remainingKeyPath === '')
        if (value === undefined) {
          if (Array.isArray(obj)) {
            if (!isNaN(parseInt(currentKeyPath)))
              obj.splice(parseInt(currentKeyPath), 1);
          } else delete obj[currentKeyPath];
          // @ts-ignore: even if currentKeyPath would be numeric string and obj would be array - it works.
        } else obj[currentKeyPath] = value;
      else {
        //@ts-ignore: even if currentKeyPath would be numeric string and obj would be array - it works.
        var innerObj = obj[currentKeyPath];
        //@ts-ignore: even if currentKeyPath would be numeric string and obj would be array - it works.
        if (!innerObj || !hasOwn(obj, currentKeyPath)) innerObj = (obj[currentKeyPath] = {});
        setByKeyPath(innerObj, remainingKeyPath, value);
      }
    } else {
      if (value === undefined) {
        if (Array.isArray(obj) && !isNaN(parseInt(keyPath)))
          // @ts-ignore: even if currentKeyPath would be numeric string and obj would be array - it works.
          obj.splice(keyPath, 1);
          //@ts-ignore: even if currentKeyPath would be numeric string and obj would be array - it works.
        else delete obj[keyPath];
        //@ts-ignore: even if currentKeyPath would be numeric string and obj would be array - it works.
      } else obj[keyPath] = value;
    }
  }
}

export const randomString = typeof self !== 'undefined' && typeof crypto !== 'undefined' ? (bytes: number, randomFill: ((buf: Uint8Array) => void)=crypto.getRandomValues.bind(crypto)) => {
  // Web
  const buf = new Uint8Array(bytes);
  randomFill(buf);
  return self.btoa(String.fromCharCode.apply(null, buf as any));
} : typeof Buffer !== 'undefined' ? (bytes: number, randomFill:((buf: Uint8Array) => void)=simpleRandomFill) => {
  // Node
  const buf = Buffer.alloc(bytes);
  randomFill(buf);
  return buf.toString("base64");
} : ()=>{throw new Error("No implementation of randomString was found");}

function simpleRandomFill(buf: Uint8Array) {
  for (let i=0; i<buf.length; ++i) {
    buf[i] = Math.floor(Math.random() * 256);
  }
}