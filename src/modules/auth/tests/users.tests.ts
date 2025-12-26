import client from "../../attendance/config/redis.config";

const OFFICE_ID = "694ad68f0b7497ab9786d517";

const USER_IDS = [
  "694ae147f388273d69f57a7b",
  "694ae14ff388273d69f57a7f",
  "694ae162f388273d69f57a84",
  "694ae16bf388273d69f57a87",
  "694ae174f388273d69f57a8a",
  "694ae17df388273d69f57a8d",
  "694ae186f388273d69f57a90",
  "694ae18ff388273d69f57a94",
  "694ae198f388273d69f57a97",
];
const users = [
  { coords: [19.21831, 72.97812] },
  { coords: [19.21829, 72.97808] },
  { coords: [19.21833, 72.97811] },
  { coords: [19.21827, 72.97813] },
  { coords: [19.21832, 72.97807] },
  { coords: [19.21828, 72.97814] },
  { coords: [19.21834, 72.9781] },
  { coords: [19.21826, 72.97812] },
  { coords: [19.21831, 72.97806] },
  { coords: [19.21835, 72.97813] },
];

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
