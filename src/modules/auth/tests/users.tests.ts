import client from "../../attendance/config/redis.config";

const OFFICE_ID = "695ab4c5ceb0e57f77df72e2";

const USER_IDS = ["695b2aa1fa3ec615a3a83c0b"];

const users = [{ coords: [19.076, 72.8777] }];

async function simulateAttendance() {
  for (let i = 0; i < 10; i++) {
    const key = `location:${OFFICE_ID}:${USER_IDS[i]}`;
    const data = JSON.stringify({
      latitude: users[i].coords[0],
      longitude: users[i].coords[1],
      timestamp: Date.now(),
    });

    await client.set(key, data, "EX", 1800);
    console.log(`Set Redis key: ${key}`);
  }
  console.log("✅ All 10 users are now in Redis. Run your Cron Job now!");
  process.exit();
}

simulateAttendance();
