import UserModel from "../../auth/document/auth.document";
import OfficeModel from "../../office/document/office.document";
import DailyAttendanceModel from "../document/dailyattendance.document";
import AttendanceModel from "../document/attendanceslot.document";
import {
  getTodayDate,
  getWorkingDayMinutes,
  timeToMinutes,
} from "../utilities";
import mongoose, { Types } from "mongoose";

export async function aggregateForUser(
  userId: any,
  officeId: any,
  date: string,
  officeStartTime: string,
  officeEndTime: string
) {
  const slots = await AttendanceModel.find({
    user: userId,
    office: officeId,
    date,
  }).lean();
  const SLOT_MINUTES = 15;
  const totalSlots = slots.length;
  const presentSlots = slots.filter((s) => s.status === "IN").length;
  const workingMinutes = presentSlots * SLOT_MINUTES;
  const fulldayWorking = getWorkingDayMinutes(officeStartTime, officeEndTime);
  const halfdayWorking = fulldayWorking / 2;
  let status = "ABSENT";

  if (workingMinutes >= fulldayWorking) {
    status = "PRESENT";
  } else if (workingMinutes >= halfdayWorking) {
    status = "HALF_PRESENT";
  }

  await DailyAttendanceModel.findOneAndUpdate(
    {
      user: new Types.ObjectId(userId),
      date,
    },
    {
      user: new Types.ObjectId(userId),
      office: new Types.ObjectId(officeId),
      date,
      workingMinutes,
      presentSlots,
      totalSlots,
      status,
    },
    { upsert: true, new: true }
  );
}

export async function dailyAttendanceAggregationJob() {
  console.log(`[${new Date().toISOString()}] Daily aggregation job running...`);

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todayDateString = getTodayDate();

  try {
    const offices = await OfficeModel.find({ isActive: true }).lean();

    for (const office of offices) {
      const endMinutes = timeToMinutes(office.workEndTime);
      const bufferMinutes = 5;
      const aggregationTriggerTime = endMinutes + bufferMinutes;
      if (currentMinutes < aggregationTriggerTime) {
        continue;
      }
      const existing = await DailyAttendanceModel.findOne({
        office: office._id,
        date: todayDateString,
      });

      if (existing) {
        continue;
      }
      console.log(
        `Aggregating completed day ${todayDateString} for office: ${
          office.name || office._id
        }`
      );

      const users = await UserModel.find({
        office: office._id,
        isActive: true,
      }).lean();

      for (const user of users) {
        await aggregateForUser(
          user._id,
          office._id,
          todayDateString,
          office.workStartTime,
          office.workEndTime
        );
      }
    }

    console.log("Daily aggregation check completed.");
  } catch (error) {
    console.error("Daily aggregation job failed:", error);
  }
}
