export function isPromiseLike(p): p is PromiseLike<any> {
  return p && typeof p.then === 'function';
}
