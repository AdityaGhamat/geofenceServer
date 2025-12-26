import { IAttendanceSlot } from "../types/attendance.document";
import { Schema, model } from "mongoose";

const attendanceSchema = new Schema<IAttendanceSlot>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    office: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    slotTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["IN", "OUT", "NO_DATA"],
    },
  },
  { timestamps: true }
);
attendanceSchema.index({ user: 1, date: 1, slotTime: 1 }, { unique: true });

const AttendanceModel = model("Attendance", attendanceSchema);
export default AttendanceModel;
