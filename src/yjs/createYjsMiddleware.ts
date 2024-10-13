import {
  DBCore,
  DBCoreTable,
  DBCoreMutateResponse
} from '../public/types/dbcore';
import { hasOwn } from '../functions/utils';
import { Middleware } from '../public/types/middleware';
import { DbSchema } from '../public/types/db-schema';
import { YjsDoc, YjsLib, YUpdateRow } from '../public/types/yjs-related';

const EMPTY_ARRAY = [] as const; // Optimization of returning empty array frequently in flatMap operaion.

export function createYjsMiddleware(
  dbSchema: DbSchema,
  Y: YjsLib
): Middleware<DBCore> {
  return {
    stack: 'dbcore',
    name: 'yjsMiddleware',
    level: 50,
    create: (downCore: DBCore) =>
      ({
        ...downCore,
        table(tableName: string) {
          const downTable = downCore.table(tableName);
          const dbTableSchema = dbSchema[tableName]; // DBCore don't understand Yjs specific schema - need dexie xchema
          const { yProps } = dbTableSchema;
          if (!yProps || yProps.length === 0) return downTable;
          const tableMiddleware: DBCoreTable = {
            ...downTable,
            mutate(req): Promise<DBCoreMutateResponse> {
              if (req.type !== 'add' && req.type !== 'put') return downTable.mutate(req);
              // From here on, req.type is "add":
              let reqClone = req;
              const updateSources = yProps
                .map((p) => ({
                  p,
                  entries: req.values.flatMap<{
                    // Instead of map().filter() we use flatMap() to avoid creating intermediate arrays.
                    iter: number;
                    u: Uint8Array;
                  }>((value, iter) => {
                    if (!value || typeof value !== 'object')
                      throw new TypeError(`Table ${tableName} (with Y-properties) must only contain objects`);
                    if (!hasOwn(value, p.prop)) return [];
                    // Clone req, req.values and each value so that we can delete yProps from being stored:
                    if (reqClone === req)
                      reqClone = {
                        ...req,
                        values: req.values.map((v) => ({ ...v })),
                      };
                    // Delete prop so that it isn't physically stored in DB
                    delete reqClone.values[iter][p.prop]; 

                    const doc = value[p.prop] as YjsDoc;
                    if (doc === null)
                      throw new TypeError(
                        `Cannot set Y property to null`
                      );
                    // Allow undefined, treat it as if the object didn't have the property at all.
                    if (doc === undefined) return EMPTY_ARRAY;
                    // Check that the property is of type Y.Doc:
                    if (typeof doc !== 'object' || !('whenLoaded' in doc)) {
                      throw new TypeError(
                        `Y properties can only be inited with an Y.Doc instance or undefined to create an empty Y.Doc`
                      );
                    }
                    if (req.type === 'put') 
                      // Don't allow setting y properties on put requests
                      throw new TypeError(`Setting ${tableName}.${p.prop} (declared as ${p.prop}:Y) is only allowed when inserting new objects using db.${tableName}.add(), not put() or update().`);
                    if (Y.encodeStateVector(doc).length === 1) {
                      // Document is empty and has no updates
                      return EMPTY_ARRAY;
                    }
                    // Clone the Yjs state before storing it in the database
                    return {
                      iter,
                      u: Y.encodeStateAsUpdateV2(doc),
                    };
                  }),
                }))
                .filter(({ entries }) => entries.length > 0);
              if (req === reqClone)
                // No object had their Y-props in own props - no need to intercept.
                return downTable.mutate(req);

              // We have a reqClone to forward down the stack. The reqClone
              // is a copy of req, but where some objects have their yProps deleted.
              return downTable.mutate(reqClone).then((res) => {
                if (updateSources.length === 0)
                  // No updates to create (but user provided empty Y.Docs so reqClone was still needed)
                  return res;
                // For each yProp affect, write docs (monolit-updates) to their corresponding tables.
                return Promise.all(
                  updateSources.map(({ p, entries }) => {
                    const updatesTable = downCore.table(p.updatesTable);
                    const updatesToInsert: Omit<YUpdateRow, 'i'>[] =
                      entries.map(
                        ({ iter, u }) =>
                          ({
                            k: res.results[iter],
                            u,
                            f: 1, // Flag as local update (to be included when syncing)
                          } satisfies Omit<YUpdateRow, 'i'>)
                      );
                    return updatesTable.mutate({
                      type: 'add',
                      values: updatesToInsert,
                      trans: req.trans,
                    });
                  })
                ).then(() => res);
              });
            },
          };
          return tableMiddleware;
        },
      } satisfies DBCore),
  };
}
