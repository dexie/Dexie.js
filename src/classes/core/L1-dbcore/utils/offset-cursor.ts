import { Cursor } from '../dbcore';

export const OffsetCursor = (cursor: Cursor, offset: number) =>
  Object.create(cursor, {
    start: {
      value: (onNext, key?, primaryKey?) =>
        offset <= 0 ?
          cursor.start(onNext, key, primaryKey) :
          cursor.start(() => {
            offset === 1 ?
              cursor.stop() :
              (cursor.advance(offset - 1), offset = 1)
          }, key, primaryKey).then(()=>cursor.start(onNext))
    }
  }) as Cursor;
