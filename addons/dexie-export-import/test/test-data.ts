import {DexieExportJsonStructure} from '../src/json-structure';

export function getSimpleImportData(databaseName: string): DexieExportJsonStructure {
  const importData: DexieExportJsonStructure = {
    formatName: "dexie",
    formatVersion: 1,
    data: {
      databaseName,
      databaseVersion: 1,
      tables: [{
        name: "friends",
        schema: "++id,name,age",
        rowCount: NaN
      }],
      data: [{
        inbound: true,
        tableName: "friends",
        rows: [{
          id: 1,
          name: "Foo",
          age: 33
        },{
          id: 2,
          name: "Bar",
          age: 44,
        },{
          id: 3,
          name: "Bee",
          age: 55
        }]
      }]
    }
  }
  // Set correct row count:
  importData.data.tables[0].rowCount = importData.data.data[0].rows.length;

  return importData;
}
