import cron from "node-cron";
import { markAttendanceJob } from "../jobs/attendanceslot.job";

cron.schedule("*/15 * * * *", async () => {
  console.log(
    `[${new Date().toISOString()}] Cron trigger: Checking open offices...`
  );
  await markAttendanceJob();
});

console.log("Smart attendance cron scheduled: every 15 minutes");
