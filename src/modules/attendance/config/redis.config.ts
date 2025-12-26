import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();
const client = new Redis(`${process.env.REDIS_URL}`, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

client.on("connect", () => {
  console.log("redis connected");
});

client.on("error", (err) => {
  console.log("redis error", err);
});

export default client;
