import { DBCoreCursor } from '../public/types/dbcore';

export interface ProxyCursorHooks {
  // Methods
  getKey?: () => any;
  getPrimaryKey?: () => any;
  getValue?: ( )=> any;
  continue?: (key?: any, primaryKey?: any) => void;
  start?: (onNext: ()=>void) => Promise<any>;
}

export function ProxyCursor (
  cursor: DBCoreCursor,
  fixManualAdvance: boolean,
  {
    getKey,
    getPrimaryKey,
    getValue,
    continue: doContinue,
    start
  }: ProxyCursorHooks
) : DBCoreCursor
{
  if (!cursor) return null;
  const props: PropertyDescriptorMap = {};
  if (getKey) props.key = {get: getKey};
  if (getPrimaryKey) props.primaryKey = {get: getPrimaryKey};
  if (getValue) props.value = {get: getValue};
  if (doContinue) {
    props.continue = props.continuePrimaryKey = {value: doContinue};
  }
  if (fixManualAdvance) {
    const continueNext = doContinue || cursor.continue;
    const doStart = start || cursor.start;
    let skip = 0;
    props.start = {
      value: (onNext: ()=>void) => {
        return doStart(() => skip ? (--skip, continueNext()) : onNext());
      }
    };
    props.advance = {
      value: (count: number) => {
        if (count > 1) skip = count;
        continueNext();
      }
    };
  } else if (start) {
    props.start = {value: start};
  }

  return Object.create(cursor, props);
}
