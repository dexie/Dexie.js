export type IndexableTypePart =
string | number | Date | ArrayBuffer | ArrayBufferView | DataView | Array<Array<void>>;

export type IndexableTypeArray = Array<IndexableTypePart>;
export type IndexableTypeArrayReadonly = ReadonlyArray<IndexableTypePart>;
export type IndexableType = IndexableTypePart | IndexableTypeArrayReadonly;

export type IsStrictlyAny<T> = (T extends never ? true : false) extends false ? false : true;
export type IDType<T, TKey extends IndexableType> = TKey extends keyof T ? T[TKey] : TKey;
// export type IDType2<T, TKey extends IndexableType> = TKey extends keyof T ? (T[TKey] extends IndexableType ? T[TKey] : TKey) : TKey;
export type IXType<T, TKey extends IndexableType> = IsStrictlyAny<TKey> extends true ? IndexableType : TKey extends keyof T ? T[TKey] extends IndexableType ? T[TKey] : IndexableType : TKey;
