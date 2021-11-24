export type KeyPaths<T> = {
  [P in keyof T]: P extends string
    ? T[P] extends any[]
      ? P
      : T[P] extends (...args: any[])=>any // Method
      ? never
      : T[P] extends object
      ? P | `${P}.${KeyPaths<T[P]>}`
      : P
    : never;
}[keyof T];

type Extract<T, P> = P extends keyof T ? T[P] : void;

export type KeyPathValue<T, PATH> = PATH extends `${infer R}.${infer S}`
  ? R extends keyof T
    ? Extract<T[R], S>
    : void
  : Extract<T, PATH>;
