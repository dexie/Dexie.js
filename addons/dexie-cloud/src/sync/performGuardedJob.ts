import { DexieCloudDB } from "../db/DexieCloudDB";

export function performGuardedJob<T>(
  db: DexieCloudDB,
  jobName: string,
  job: () => Promise<T>
): Promise<T> {
  if (typeof navigator === 'undefined' || !navigator.locks) {
    // No support for guarding jobs. IE11, node.js, etc.
    return job();
  }
  return navigator.locks.request(db.name + '|' + jobName, () => job());
}
