import { DexieCloudDB } from '../db/DexieCloudDB';

// If we get Ratelimit-Limit and Ratelimit-Remaining where Ratelimit-Remaining is below
// (Ratelimit-Limit / 2), we should delay the next sync by (Ratelimit-Reset / Ratelimit-Remaining)
// seconds (given that there is a Ratelimit-Reset header).

let syncRatelimitDelays = new WeakMap<DexieCloudDB, Date>();

export async function checkSyncRateLimitDelay(db: DexieCloudDB) {
  const delatMilliseconds = (syncRatelimitDelays.get(db)?.getTime() ?? 0) - Date.now();
  if (delatMilliseconds > 0) {
    console.debug(`Stalling sync request ${delatMilliseconds} ms to spare ratelimits`);
    await new Promise(resolve => setTimeout(resolve, delatMilliseconds));
  }
}

export function updateSyncRateLimitDelays(db: DexieCloudDB, res: Response) {
  const limit = res.headers.get('Ratelimit-Limit');
  const remaining = res.headers.get('Ratelimit-Remaining');
  const reset = res.headers.get('Ratelimit-Reset');
  if (limit && remaining && reset) {
    const limitNum = Number(limit);
    const remainingNum = Math.max(0, Number(remaining));
    const willResetInSeconds = Number(reset);
    if (remainingNum < limitNum / 2) {
      const delay = Math.ceil(willResetInSeconds / (remainingNum + 1));
      syncRatelimitDelays.set(db, new Date(Date.now() + delay * 1000));
      console.debug(`Sync ratelimit delay set to ${delay} seconds`);
    } else {
      syncRatelimitDelays.delete(db);
      console.debug(`Sync ratelimit delay cleared`);
    }
  }
}
