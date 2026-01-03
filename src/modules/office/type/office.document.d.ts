import { Document } from "mongoose";

export interface IOffice extends Document {
  name: string;
  coordinates: number[];
  workStartTime: string;
  workEndTime: string;
  workingDays: number[];
  isActive: boolean;
  workers: any;
  office_admin: any[];
  uid?: string;
  geofence_radius: number;
  isDeleted: boolean;
  deletedAt: Date;
}
