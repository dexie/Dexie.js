import { IsStrictlyAny } from "./is-strictly-any";

/** Extract the union of literal method names in T
 */
 export type MethodProps<T> = {
  [P in keyof T]: IsStrictlyAny<T[P]> extends true
    ? never // Plain property of type any (not method)
    : T[P] extends (...args: any[]) => any
    ? P // a function (method)
    : never; // Not function (not method)
}[keyof T];

/** Default insert type of T is a subset of T where:
 *    * given optional props (such as an auto-generated primary key) are made optional
 *    * methods are omitted
 */
 export type InsertType<T, OptionalProps extends keyof T> = Omit<T, OptionalProps | MethodProps<T>> & {[P in OptionalProps]?: T[P]};
