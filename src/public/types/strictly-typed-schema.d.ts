import { Dexie, TableProp } from './dexie';
import { IndexableType, IndexableTypeArray } from './indexable-type';
import { Table } from './table';

// Indexable arrays on root level only
type ArrayProps<T> = {
  [K in keyof T]: K extends string
    ? T[K] extends IndexableTypeArray
      ? K
      : never
    : never;
}[keyof T];

type NumberProps<T> = {
  [K in keyof T]: K extends string ? (T[K] extends number ? K : never) : never;
}[keyof T];

type StringProps<T> = {
  [K in keyof T]: K extends string ? (T[K] extends string ? K : never) : never;
}[keyof T];

type IgnoreObjects =
  | RegExp
  | DataView
  | Map<any, any>
  | Set<any>
  | CryptoKey
  | Promise<any>
  | ReadableStream<any>
  | ReadableStreamDefaultReader<any>
  | ReadableStreamDefaultController<any>
  | { whenLoaded: Promise<any> }; // Y.Doc

// Nested indexable arrays (configurable max depth)
type ArrayKeyPaths<
  T,
  MAXDEPTH = 'III',
  CURRDEPTH extends string = ''
> = CURRDEPTH extends MAXDEPTH
  ? ArrayProps<T>
  :
      | ArrayKeyPaths<T, MAXDEPTH, `${CURRDEPTH}I`>
      | {
          [K in keyof T]: K extends string
            ? T[K] extends object
              ? `${K}.${keyof T[K] extends string
                  ? ArrayKeyPaths<T[K], MAXDEPTH, `${CURRDEPTH}I`>
                  : never}`
              : never
            : never;
        }[keyof T];

// Indexable root properties
type IndexableProps<T> = {
  [K in keyof T]: K extends string
    ? T[K] extends IndexableType
      ? K
      : never
    : never;
}[keyof T];

// Keypaths of indexable properties and nested properteis (configurable MAXDEPTH)
type IndexableKeyPaths<
  T,
  MAXDEPTH = 'III',
  CURRDEPTH extends string = ''
> = CURRDEPTH extends MAXDEPTH
  ? IndexableProps<T>
  : {
      [K in keyof T]: K extends string
        ? T[K] extends IndexableType
          ? K
          : T[K] extends IgnoreObjects
          ? never
          : T[K] extends object
          ? `${K}.${keyof T[K] extends string
              ? IndexableKeyPaths<T[K], MAXDEPTH, `${CURRDEPTH}I`>
              : never}`
          : never
        : never;
    }[keyof T];

// Compound index syntax
type Combo<
  T,
  MAXDEPTH = 'III',
  CURRDEPTH extends string = ''
> = CURRDEPTH extends MAXDEPTH
  ? never
  : {
      [P in keyof T]: P extends string
        ? keyof Omit<T, P> extends never
          ? P
          : P | `${P}+${Combo<Omit<T, P>, MAXDEPTH, `${CURRDEPTH}I`>}`
        : never;
    }[keyof T];

type IndexablePathObj<T> = {
  [P in IndexableKeyPaths<T>]: true;
};

type SingleCombound<T> = {
  [P in IndexableKeyPaths<T>]: `[${P}]`;
}[IndexableKeyPaths<T>];

// -------

// Main generic type for Dexie index syntax
type DexieIndexSyntax<T> =
  | `&${IndexableKeyPaths<T>}`
  | IndexableKeyPaths<T>
  | `*${ArrayKeyPaths<T>}` // Wildcard for array keys
  | Exclude<`[${Combo<IndexablePathObj<T>>}]`, SingleCombound<T>> // Combined non-array keys
  | `&${Exclude<`[${Combo<Pick<T, IndexableProps<T>>>}]`, SingleCombound<T>>}`; // Combined non-array keys

type DexiePrimaryKeySyntax<T> =
  | ''
  | `++${NumberProps<T>}`
  | `@${StringProps<T>}`
  | `&${IndexableKeyPaths<T>}`
  | `${IndexableKeyPaths<T>}`
  | `${IndexableKeyPaths<T>}:Y.Doc`
  | `${Exclude<`[${Combo<IndexablePathObj<T>>}]`, SingleCombound<T>>}` // Combined non-array keys
  | `&${Exclude<`[${Combo<IndexablePathObj<T>>}]`, SingleCombound<T>>}`;

type TypedProperties<T> = {
  [K in keyof T]: K extends string
    ? T[K] extends { whenLoaded: Promise<any> }
      ? `${K}:Y.Doc`
      : never
    : never;
}[keyof T];

type LooseStoresSpec = { [tableName: string]: string | null | string[] };

type StoresSpec<DX extends Dexie> =  TableProp<Omit<DX, keyof Dexie>> extends never ? LooseStoresSpec :
  Dexie extends DX ? LooseStoresSpec :
    {
      [TN in TableProp<DX>]?: DX[TN] extends Table<infer T, any, any>
        ?
            | string
            | null
            | [
                DexiePrimaryKeySyntax<T>,
                ...(DexieIndexSyntax<T> | TypedProperties<T>)[]
              ]
        : string | string[] | null;
    };
