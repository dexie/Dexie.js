export interface TableSchema {
    name: string;
    primKey: IndexSpec;
    indexes: IndexSpec[];
    mappedClass: Function;
    idxByName: {[indexName: string]: IndexSpec}
}

export interface IndexSpec {
    name: string;
    keyPath: string | string[];
    unique: boolean;
    multi: boolean;
    auto: boolean;
    compound: boolean;
    src: string;
}
