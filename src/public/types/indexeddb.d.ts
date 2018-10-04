export type IndexableTypePart =
string | number | Date | ArrayBuffer | ArrayBufferView | DataView | Array<Array<void>>;

export type IndexableTypeArray = Array<IndexableTypePart>;
export type IndexableTypeArrayReadonly = ReadonlyArray<IndexableTypePart>;
export type IndexableType = IndexableTypePart | IndexableTypeArrayReadonly;

