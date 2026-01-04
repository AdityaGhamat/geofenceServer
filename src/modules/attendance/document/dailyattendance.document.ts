import { Schema, model } from "mongoose";
import { IDailyAttendance } from "../types/attendance.document";

const dailyAttendanceSchema = new Schema<IDailyAttendance>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    office: {
      type: Schema.Types.ObjectId,
      ref: "Office",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    workingMinutes: {
      type: Number,
      required: true,
    },
    presentSlots: {
      type: Number,
      required: true,
    },
    totalSlots: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["PRESENT", "HALF_PRESENT", "ABSENT"],
      required: true,
    },
  },
  { timestamps: true }
);

const DailyAttendanceModel = model("DailyAttendance", dailyAttendanceSchema);
export default DailyAttendanceModel;
