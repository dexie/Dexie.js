export type IsStrictlyAny<T> = (T extends never ? true : false) extends false ? false : true;
