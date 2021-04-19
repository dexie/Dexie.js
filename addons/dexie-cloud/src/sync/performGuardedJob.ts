import { liveQuery, Table } from "dexie";
import { MINUTES, SECONDS } from "../helpers/date-constants";
import { DexieCloudDB } from "../db/DexieCloudDB";
import { GuardedJob } from "../db/entities/GuardedJob";
import { myId } from "./myId";
import { from } from "rxjs";
import { filter } from "rxjs/operators";

const GUARDED_JOB_HEARTBEAT = 1 * SECONDS;
const GUARDED_JOB_TIMEOUT = 1 * MINUTES;

export async function performGuardedJob(
  db: DexieCloudDB,
  jobName: string,
  jobsTableName: string,
  job: () => Promise<void>,
  {awaitRemoteJob}: {awaitRemoteJob?: boolean} = {}
): Promise<void> {
  // Start working.
  //
  // Check if someone else is working on this already.
  //
  const jobsTable = db.table(jobsTableName) as Table<GuardedJob, string>;
  const jobOwnerId = await db.transaction("rw!", jobsTableName, async () => {
    const currentWork = await jobsTable.get(jobName);
    if (!currentWork) {
      // No one else is working. Let's record that we are.
      await jobsTable.add(
        {
          nodeId: myId,
          started: new Date(),
          heartbeat: new Date(),
        },
        jobName
      );
      return myId;
    } else if (
      currentWork.heartbeat.getTime() <
      Date.now() - GUARDED_JOB_TIMEOUT
    ) {
      console.warn(
        `Latest ${jobName} worker seem to have died.\n`,
        `The dead job started:`,
        currentWork.started,
        `\n`,
        `Last heart beat was:`,
        currentWork.heartbeat,
        "\n",
        `We're now taking over!`
      );
      // Now, take over!
      await jobsTable.put(
        {
          nodeId: myId,
          started: new Date(),
          heartbeat: new Date(),
        },
        jobName
      );
      return myId;
    }
    return currentWork.nodeId;
  });
  if (jobOwnerId !== myId) {
    // Someone else took the job.
    if (awaitRemoteJob) {
      const jobDoneObservable = from(
        liveQuery(() => jobsTable.get(jobName))
      ).pipe(filter((job) => !job)); // Wait til job is not there anymore.
      await jobDoneObservable.toPromise();
    }
    return;
  }
  // Start our heart beat during the sync.
  // Use setInterval to make sure we are updating heartbeat even during long-lived fetch calls.
  const heartbeat = setInterval(
    () => jobsTable.update(jobName, { heartbeat: new Date() }),
    GUARDED_JOB_HEARTBEAT
  );

  try {
    return await job();
  } finally {
    // Stop heartbeat
    clearInterval(heartbeat);
    // Remove the persisted job state:
    await db.transaction("rw!", jobsTableName, async () => {
      const currentWork = await jobsTable.get(jobName);
      if (currentWork && currentWork.nodeId === myId) {
        jobsTable.delete(jobName);
      }
    });
  }
}
