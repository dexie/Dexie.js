import { DBCore, DBCoreTable } from '../../public/types/dbcore';
import { LiveQueryContext } from '../live-query';

export function isCachableContext(ctx: LiveQueryContext, table: DBCoreTable) {
  return (
    ctx.trans.mode === 'readonly' &&
    !!ctx.subscr &&
    !ctx.trans.explicit &&
    ctx.trans.db._options.cache !== 'disabled' &&
    !table.schema.primaryKey.outbound
  );
}

