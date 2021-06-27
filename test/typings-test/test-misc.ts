import Dexie from '../../dist/dexie';

class MyDb extends Dexie {
  friends: Dexie.Table<{name, id}, number>;
  constructor() {
    super("MyDb");
    this.version(1).stores({
      friends: '++id,age'
    });
    
  }
}
/*
interface Addon<XTable=undefined,XCollection=undefined> {
  (db: DB):void;
  XTable?: XTable;
  XCollection?: XCollection;
}

type TblSchema<T=any,K=any> =  {value: T, key: K};
type Schema<TTblScheam extends TblSchema, TSchema extends {[tableName: string]: TTblScheam}> = {};
interface Friend {name: string, id: number};
var x: Schema<{friends: Friend, key: number}}>;

type Addons<A1 extends Addon=undefined,A2 extends Addon=undefined> = {0?: A1, 1?:A2};
type DBX<TSchema extends Schema, TAddons extends Addons> = {schema: TSchema, addons}

class DB<Ext1 =undefined,Ext2=undefined> {
  constructor(options: {addons: {0: Ext1, 1:Ext2}}) {

  }

  get friends() {
    return this.table<Friend, number>('friends');
  }
}
*/