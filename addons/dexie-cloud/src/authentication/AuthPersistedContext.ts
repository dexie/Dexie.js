import { DexieCloudDB } from "../db/DexieCloudDB";
import { UserLogin } from "../db/entities/UserLogin";

export interface AuthPersistedContext extends UserLogin {
  save(): Promise<void>;
}

// Emulate true-private property db. Why? So it's not stored in DB.
const wm = new WeakMap<AuthPersistedContext, DexieCloudDB>();

export class AuthPersistedContext {
  constructor(db: DexieCloudDB, userLogin: UserLogin) {
    wm.set(this, db);
    Object.assign(this, userLogin);
  }

  static load(db: DexieCloudDB, userId: string) {
    return db
      .table("$logins")
      .get(userId)
      .then(
        (userLogin) => new AuthPersistedContext(db, userLogin || {
          userId,
          claims: {
            sub: userId
          },
          lastLogin: new Date(0)
        })
      );
  }

  async save() {
    try {
      console.info('[AuthPersistedContext.save] about to wm.get(this) ...')
      let db = wm.get(this)!;
      console.info('[AuthPersistedContext.save] about to db.table($logins).put(this) ...')
      await db.table("$logins").put(this);
      console.info('[AuthPersistedContext.save] saved.')
    } catch (err) {
      console.error(err)
      throw err
    }
  }
}
