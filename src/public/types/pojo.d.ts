import { MethodProps } from "./insert-type";

/** Pojo<T> is the stored representation of a class instance where methods are stripped away.
 * 
 * Given T is a class or interface with methods, Pojo<T> is a type that omits the methods.
 * Used represent the data stored in indexedDB, when objects are provided to reading-hook
 * and other API surfaces before they are returned to the user in the form of a class instance
 * with methods attached on its prototype.
 */
export type Pojo<T> = Omit<T, MethodProps<T>>;
