import { Model, Schema, model } from "mongoose";
import { IUser, IUserMethods } from "../types/auth.document";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
export type UserModel = Model<IUser, {}, IUserMethods>;
const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin", "super_admin"],
      default: "user",
    },
    office: {
      type: Schema.Types.ObjectId,
      ref: "Office",
    },
    coordinates: {
      type: [Number],
      required: false,
    },
    isActive: {
      type: Boolean,
      default: false,
      required: false,
    },
    uid: {
      type: String,
      default: () => nanoid(10),
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const UserModel = model("User", userSchema);
export default UserModel;
