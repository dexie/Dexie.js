import { IndexSpec } from '../public/types/index-spec';
import { TableSchema } from '../public/types/table-schema';
import { arrayToObject } from '../functions/utils';

export function createTableSchema(
  name: string,
  primKey: IndexSpec,
  indexes: IndexSpec[],
  yProps?: string[]
): TableSchema {
  return {
    name,
    primKey,
    indexes,
    mappedClass: null,
    yProps: yProps?.map((prop) => ({
      prop,
      updatesTable: `$${name}.${prop}_updates`,
    })),
    idxByName: arrayToObject(indexes, (index) => [index.name, index]),
  };
}
