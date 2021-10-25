import { rangeEqual } from '../classes/where-clause/where-clause-helpers';
import { cmp } from '../functions/cmp';
import {
  DBCoreQuery,
  DBCoreTable,
  DBCoreTransaction,
} from '../public/types/dbcore';

export async function* chunkedQuery(
  trans: DBCoreTransaction,
  table: DBCoreTable,
  query: DBCoreQuery,
  maxChunkSize: number
): AsyncIterator<any[]> {
  let { result } = await table.query({
    trans,
    values: true,
    limit: maxChunkSize,
    query,
  });
  yield result;
  const {
    schema: { primaryKey },
  } = table;
  let { index, range } = query;
  while (result.length === maxChunkSize) {
    const lastRow = result[maxChunkSize - 1];
    let lastKey = index.extractKey(lastRow);
    let i = maxChunkSize - 2;
    const STOP = primaryKey.outbound ? 0 : Math.floor(maxChunkSize / 2);

    while (i >= STOP && cmp(lastKey, index.extractKey(result[i])) === 0) {
      // Last two keys are same. We can't just use key to go for next chunk
      --i;
    }
    if (i === STOP) {
      // Lots of keys same in end of result. Need to use continuePrimaryKey
      const lastId = primaryKey.outbound
        ? (
            // outbound - damn it! We can't extract id from value.
            // Must redo the query using getAllKeys() this time:
            await table.query({
              trans,
              values: false,
              limit: maxChunkSize,
              query: { index, range },
            })
          ).result[maxChunkSize - 1]
        : primaryKey.extractKey(lastRow);

      const cursor = await table.openCursor({
        trans,
        query: {
          index,
          range: rangeEqual(lastKey),
        },
        values: true,
      });
      await cursor.next(lastKey, lastId); // Jump to last entry
      await cursor.next(); // Move to entry after the last primary key
      let bridgeChunk = [];
      while (!cursor.done && cmp(cursor.key, lastKey) === 0) {
        bridgeChunk.push(cursor.value);
        if (bridgeChunk.length === maxChunkSize) {
          yield bridgeChunk;
          bridgeChunk = [];
        }
        await cursor.next();
      }
      if (bridgeChunk.length > 0) yield bridgeChunk;
      // Now that we've emitted all entries on lastKey, let range span
      // from the first value after lastKey:
      range = { ...range, lower: lastKey, lowerOpen: true };
    } else {
      // There might be more entries on lastKey, keep lowerOpen to false
      // for next go and use a jumpOver strategy instead:
      range = { ...range, lower: lastKey, lowerOpen: false };
    }
    const jumpOvers = i > STOP
      ? maxChunkSize - i - 1
      : 0;

    result = (
      await table.query({
        trans,
        values: true,
        limit: maxChunkSize,
        query: {
          index,
          range,
        },
      })
    ).result;
    yield i > STOP ? result.slice(jumpOvers) : result;
  }
}
