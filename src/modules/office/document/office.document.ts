import { Schema, model } from "mongoose";
import { IOffice } from "../type/office.document";
import { nanoid } from "nanoid";

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
    uid: {
      type: String,
      default: () => nanoid(10),
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
    geofence_radius: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

OfficeSchema.pre("save", async function () {
  if (this.isModified("isDeleted") && this.isDeleted === true) {
    this.deletedAt = new Date();
  }
  if (this.isModified("isDeleted") && this.isDeleted === false) {
    // @ts-ignore
    this.deletedAt = undefined;
  }
});
const OfficeModel = model<IOffice>("Office", OfficeSchema);
export default OfficeModel;
