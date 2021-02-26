import Dexie from "dexie";
import { MINUTES, SECONDS } from "../helpers/date-constants";
import { myId } from "./myId";

const GUARDED_JOB_HEARTBEAT = 1 * SECONDS;
const GUARDED_JOB_TIMEOUT = 1 * MINUTES;

export async function performGuardedJob(
  db: Dexie,
  jobName: string,
  job: () => Promise<void>
) {
  // Start working.
  //
  // Check if someone else is working on this already.
  //
  const lockTable = db.table("$sync");
  const weTookTheJob = await db.transaction("rw!", "$sync", async () => {
    const currentWork = await lockTable.get(jobName);
    if (!currentWork) {
      // No one else is working. Let's record that we are.
      await lockTable.add(
        {
          nodeId: myId,
          started: new Date(),
          heartbeat: new Date(),
        },
        jobName
      );
      return true;
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
      await lockTable.put(
        {
          nodeId: myId,
          started: new Date(),
          heartbeat: new Date(),
        },
        jobName
      );
      return true;
    }
    return false;
  });
  if (!weTookTheJob) {
    return;
  }
  // Start our heart beat during the sync.
  // Use setInterval to make sure we are updating heartbeat even during long-lived fetch calls.
  const heartbeat = setInterval(
    () => lockTable.update(jobName, { heartbeat: new Date() }),
    GUARDED_JOB_HEARTBEAT
  );

  try {
    return await job();
  } finally {
    // Stop heartbeat
    clearInterval(heartbeat);
    // Remove the currentPushWorker state:
    await db.transaction("rw", "$sync", async () => {
      const currentWork = await lockTable.get(jobName);
      if (currentWork && currentWork.nodeId === myId) {
        lockTable.delete(jobName);
      }
    });
  }
}
