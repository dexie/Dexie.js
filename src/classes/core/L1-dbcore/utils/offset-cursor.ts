import { Cursor } from '../dbcore';

export const OffsetCursor = (cursor: Cursor, offset: number) =>
  cursor && Object.create(cursor, {
    start: {
      value: (onNext) =>
        offset <= 0 ?
          cursor.start(onNext) :
          cursor.start(() => {
            offset === 1 ?
              cursor.stop() :
              (cursor.advance(offset - 1), offset = 1)
          }).then(()=>cursor.start(onNext))
    }
  }) as Cursor;
