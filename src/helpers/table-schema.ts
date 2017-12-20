import { IndexSpec } from '../public/types/index-spec';
import { TableSchema } from '../public/types/table-schema';
import { createIndexSpec } from './index-spec';
import { arrayToObject } from '../functions/utils';

export function createTableSchema (
  name: string,
  primKey: IndexSpec,
  indexes: IndexSpec[]
): TableSchema {
  return {
    name,
    primKey,
    indexes,
    mappedClass: null,
    idxByName: arrayToObject(indexes, index => [index.name, index])
  };
}
