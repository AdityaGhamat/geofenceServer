import { Document } from "mongoose";

export interface IAttendanceSlot extends Document {
  user: any;
  office: any;
  date: string;
  slotTime: string;
  status: "IN" | "OUT" | "NO_DATA";
}

export interface IDailyAttendance extends Document {
  user: any;
  office: any;
  date: string;
  workingMinutes: string;
  presentSlots: string;
  totalSlots: string;
  status: "PRESENT" | "HALF_PRESENT" | "ABSENT";
}
