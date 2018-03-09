import { QueryRequest, OpenCursorRequest, Cursor, CountRequest } from "../dbcore";

/** Detta lager ska troligen inte med i dbcore. Kanske som hjälp utility till ignore-case delen
 * och/eller andra.
*/

export function getCountAndGetAllEmulation(openCursor: (query: OpenCursorRequest) => Promise<Cursor>) {
  return {
    getAll: (query: QueryRequest) => {
      const result = [];
      return openCursor(query).then(cursor => {
        return cursor.start(!query.values? () => {
          result.push(cursor.primaryKey);
          cursor.continue();
        } : () => {
          result.push(cursor.value);
          cursor.continue();
        });
      }).then(() => result);
    },

    count: (query: CountRequest) => {
      let result = 0;
      return openCursor(query).then(cursor => {
        return cursor.start(() => {
          ++result;
          cursor.continue();
        });
      }).then(() => result);
    }
  }
}
