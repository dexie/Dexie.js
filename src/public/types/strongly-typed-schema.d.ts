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
  :
      | IndexableKeyPaths<T, MAXDEPTH, `${CURRDEPTH}I`>
      | {
          [K in keyof T]: K extends string
            ? T[K] extends object
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
  | IndexableKeyPaths<T>
  | Exclude<`[${Combo<IndexablePathObj<T>>}]`, SingleCombound<T>> // Combined non-array keys
  | `&${Exclude<`[${Combo<IndexablePathObj<T>>}]`, SingleCombound<T>>}`;

type LooseStoresSpec = { [tableName: string]: string | null | string[] };

type StoresSpec<DX extends Dexie> = TableProp<DX> extends never
  ? LooseStoresSpec
  : {
      [TN in TableProp<DX>]?: DX[TN] extends Table<infer T, any, any>
        ? string | null | [DexiePrimaryKeySyntax<T>, ...DexieIndexSyntax<T>[]]
        : never;
    } & LooseStoresSpec;

// -------

/*
type ClazzDecorator<T> = (target: new () => T) => new () => T;
declare function index<T>(
  ...indexSpec: DexieIndexSyntax<T>[]
): ClazzDecorator<T>;

@index(
  "[name+id+tags]",
  "[allanlarson+apansson+name]",
  "ydoc.meta",
  "fredriksod",
  "&[name+bosse+allanlarson]",
  "[allanlarson+apansson+blob.size]",
)

// Test example with the Friend interface
interface Friend {
  name: string;
  age: number;
  tags: string[];
}

// Example usage
const index1: DexieIndexSyntax<Friend> = "name"; // valid
const index2: DexieIndexSyntax<Friend> = "age"; // valid
const index3: DexieIndexSyntax<Friend> = "*tags"; // valid (array field)
const index4: DexieIndexSyntax<Friend> = "&[name+age]"; // valid (combined index)
const index5: DexieIndexSyntax<Friend> = "[age+name]"; // valid (combined index)

// Invalid cases
// const invalidIndex1: DexieIndexSyntax<Friend> = '*name';        // error (* not allowed for non-array fields)
// const invalidIndex2: DexieIndexSyntax<Friend> = '[name+*tags]'; // error (composite index cannot include *tags)
// const invalidIndex3: DexieIndexSyntax<Friend> = '[*tags+age]';  // error (composite index cannot include *tags)

// -------

function stores<DX extends Dexie>(storesSpec: StoresSpec<DX>): void {
  console.log(storesSpec);
}

const db = new Dexie("MyDatabase") as Dexie & {
  friends: EntityTable<Friend, "name">;
  todoItems: EntityTable<TodoItem, "id">;
};

stores<typeof db>({
  //friends: ["&age"],
  todoItems: [
    "&[allanlarson+apansson+blob.size]",
    "[allanlarson+apansson+bosse]",
    "[allanlarson+bosse+name]",
  ],
});
*/
