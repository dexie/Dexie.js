export function associate<T extends object,M>(factory: (x: T)=>M): (x: T) => M {
  const wm = new WeakMap<T, M>();
  return (x: T) => {
    let rv = wm.get(x);
    if (!rv) {
      rv = factory(x);
      wm.set(x, rv);
    }
    return rv;
  }
}
