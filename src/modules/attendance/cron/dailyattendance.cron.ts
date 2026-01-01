import cron from "node-cron";
import { dailyAttendanceAggregationJob } from "../jobs/dailyattendance.job";

cron.schedule("*/30 * * * *", async function () {
  console.log(
    `[${new Date().toISOString()}] Daily aggregation check triggered`
  );
  await dailyAttendanceAggregationJob();
});

console.log("Daily attendance aggregation check scheduled every 30 minutes");
