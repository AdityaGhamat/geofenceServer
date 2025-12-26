import { Schema, model } from "mongoose";
import { IOffice } from "../type/office.document";

const OfficeSchema = new Schema<IOffice>(
  {
    name: {
      type: String,
      required: true,
    },
    coordinates: {
      type: [Number],
      required: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    workingDays: {
      type: [Number],
      required: false,
    },
    workStartTime: {
      type: String,
      required: true,
    },
    workEndTime: {
      type: String,
      required: true,
    },
    workers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
    ],
    office_admin: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
    ],
  },
  { timestamps: true }
);

const OfficeModel = model<IOffice>("Office", OfficeSchema);
export default OfficeModel;
