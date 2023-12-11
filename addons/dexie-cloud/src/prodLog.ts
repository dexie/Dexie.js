/** A way to log to console in production without terser stripping out
 * it from the release bundle.
 * This should be used very rarely and only in places where it's
 * absolutely necessary to log something in production.
 * 
 * @param level 
 * @param args 
 */
export function prodLog(level: 'log' | 'warn' | 'error' | 'debug', ...args: any[]) {
  globalThis["con"+"sole"][level](...args);
}
