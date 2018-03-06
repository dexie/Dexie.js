import { KeyRangeQuery, Cursor } from "../dbcore";


export function getCountAndGetAllEmulation(openCursor: (query: KeyRangeQuery) => Promise<Cursor>) {
  return {
    getAll: (query: KeyRangeQuery) => {
      const result = [];
      const want = query.want;
      return openCursor(query).then(cursor => {
        return cursor.start(want === 'primaryKeys' ? () => {
          result.push(cursor.primaryKey);
          cursor.continue();
        } : want === 'keys' ? () => {
          result.push(cursor.key);
          cursor.continue();
        } : () => {
          result.push(cursor.value);
          cursor.continue();
        });
      }).then(() => result);
    },

    count: (query: KeyRangeQuery) => {
      let result = 0;
      return openCursor({ ...query, want: 'primaryKeys' }).then(cursor => {
        return cursor.start(() => {
          ++result;
          cursor.continue();
        });
      }).then(() => result);
    }
  }
}
