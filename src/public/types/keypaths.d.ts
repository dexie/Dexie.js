export type KeyPaths<T> = {
  [P in keyof T]: P extends string
    ? T[P] extends any[]
      ? P | `${P}.${number}` | `${P}.${number}.${KeyPaths<T[P][number]>}`
      : T[P] extends (...args: any[]) => any // Method
      ? never
      : T[P] extends object
      ? P | `${P}.${KeyPaths<T[P]>}`
      : P
    : never;
}[keyof T];

export type KeyPathValue<T, PATH> = PATH extends `${infer R}.${infer S}`
  ? R extends keyof T
    ? KeyPathValue<T[R], S>
    : T extends any[]
    ? PATH extends `${number}.${infer S}`
      ? KeyPathValue<T[number], S>
      : void
    : void
  : PATH extends `${number}`
  ? T extends any[]
    ? T[number]
    : void
  : PATH extends keyof T
  ? T[PATH]
  : void;
