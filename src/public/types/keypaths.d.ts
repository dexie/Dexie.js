type KeyPathIgnoreObject =
  | ArrayBuffer
  | ArrayBufferView
  | RegExp
  | Blob
  | FileList
  | FileSystemFileHandle
  | FileSystemDirectoryHandle
  | DataView
  | ImageBitmap
  | ImageData
  | Map<any, any>
  | Set<any>
  | CryptoKey
  | Promise<any>
  | ReadableStream<any>
  | ReadableStreamDefaultReader<any>
  | ReadableStreamDefaultController<any>
  | { whenLoaded: Promise<any> }; // Y.Doc

export type KeyPaths<T, MAXDEPTH = 'II', CURRDEPTH extends string = ''> = {
  [P in keyof T]: P extends string
    ? CURRDEPTH extends MAXDEPTH
      ? P
      : T[P] extends Array<infer K>
      ? K extends any[] // Array of arrays (issue #2026)
        ? P | `${P}.${number}` | `${P}.${number}.${number}`
        : K extends object // only drill into the array element if it's an object
        ? P | `${P}.${number}` | `${P}.${number}.${KeyPaths<Required<K>>}`
        : P | `${P}.${number}`
      : T[P] extends (...args: any[]) => any // Method
      ? never
      : T[P] extends KeyPathIgnoreObject // Not valid in update spec or where clause (+ avoid circular reference)
      ? P
      : T[P] extends object
      ? P | `${P}.${KeyPaths<Required<T[P]>, MAXDEPTH, `${CURRDEPTH}I`>}`
      : P
    : never;
}[keyof T];

export type KeyPathValue<T, PATH> = PATH extends `${infer R}.${infer S}`
  ? R extends keyof T
    ? KeyPathValue<Required<T[R]>, S>
    : T extends any[]
    ? PATH extends `${number}.${infer S}`
      ? KeyPathValue<Required<T[number]>, S>
      : void
    : void
  : PATH extends `${number}`
  ? T extends any[]
    ? T[number]
    : void
  : PATH extends keyof T
  ? T[PATH]
  : any;
