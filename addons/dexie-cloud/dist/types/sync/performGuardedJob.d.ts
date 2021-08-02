import { DexieCloudDB } from '../db/DexieCloudDB';
export declare function performGuardedJob(db: DexieCloudDB, jobName: string, jobsTableName: string, job: () => Promise<any>, { awaitRemoteJob }?: {
    awaitRemoteJob?: boolean;
}): Promise<void>;
