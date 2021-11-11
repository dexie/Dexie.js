export type NonMethods<T> = {[P in keyof T]: T[P] extends (...args: any[]) => any ? never : P}[keyof T];

export type OmitMethods<T> = Pick<T, NonMethods<T>>;
