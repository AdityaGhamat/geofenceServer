import dotenv from "dotenv";
import { connectDb } from "../../core/utils/connectdb";
import DailyAttendanceModel from "../document/dailyattendance.document";
import { Types } from "mongoose";

dotenv.config();

async function seedAnalyticsData(userIdStr: string, officeIdStr: string) {
  await connectDb();

  const userId = new Types.ObjectId(userIdStr);
  const officeId = new Types.ObjectId(officeIdStr);
  const records = [];

  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);

    const dateStr = d.toISOString().split("T")[0].replace(/-/g, "");

    records.push({
      user: userId,
      office: officeId,
      date: dateStr,
      workingMinutes: Math.floor(Math.random() * (540 - 400) + 400),
      presentSlots: 30,
      totalSlots: 36,
      status: Math.random() > 0.1 ? "PRESENT" : "ABSENT",
    });
  }

  await DailyAttendanceModel.deleteMany({ user: userId });
  await DailyAttendanceModel.insertMany(records);

  console.log(`✅ Seeded 30 days of attendance for User ${userIdStr}`);
  process.exit();
}

seedAnalyticsData("6950b671c9e1482ff54d67c3", "695ab4c5ceb0e57f77df72e2");
