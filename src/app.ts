import server from "./index";
import dotenv from "dotenv";
dotenv.config();
server.start(Number(process.env.PORT));
console.log("server is started");
console.log(`🧲 http://localhost:${process.env.PORT}`);
