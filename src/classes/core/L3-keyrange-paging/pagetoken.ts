import { exceptions } from '../../../errors';
import { unstringifyKey, stringifyKey } from '../../../functions/stringify-key';
import { Key, Cursor } from '../L1-dbcore/dbcore';

export class KeyRangePageToken {
  type: 'lastKey' | 'cursor' | 'offset' | null;
  lastKey?: Key; // Will be there if type='lastKey'. If no lastPrimaryKey, getAll() will be used.
  lastPrimaryKey?: Key; // May be there if type='lastKey'. If so, a cursor will be opened and used until next key.
  cursor?: Cursor; // Will be there if type='cursor'
  offset?: number; // Will be there if type='offset'. May be needed to continue from multiEntry getAll() queries

  toString() {
    const [key, primaryKey] = this.type === 'lastKey' ?
      [this.lastKey, this.lastPrimaryKey || undefined] :
      [this.cursor.key, this.cursor.primaryKey];

    return JSON.stringify(this.type === 'offset' ? {
      type: 'offset',
      offset: this.offset
    } : {
      type: 'lastKey',
      lastKey: key && stringifyKey(key),
      lastPrimaryKey: primaryKey && stringifyKey(primaryKey)
    });
  }

  constructor (obj: KeyRangePageToken) {
    Object.assign(this, obj);
  }

  static parse (stringifiedToken: string) {
    try {
      const obj = JSON.parse(stringifiedToken);
      if (obj.key) obj.key = unstringifyKey(obj.key);
      if (obj.primaryKey) obj.primaryKey = unstringifyKey(obj.primaryKey);
      return new KeyRangePageToken(obj);
    } catch (err) {
      throw new exceptions.InvalidArgument("Invalid PageToken: " + stringifiedToken, err);
    }
  }
}
