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
  workingMinutes: number;
  presentSlots: number;
  totalSlots: number;
  status: "PRESENT" | "HALF_PRESENT" | "ABSENT";
}
