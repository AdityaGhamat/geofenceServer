import { Document } from "mongoose";
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  coordinates: [Number];
  isActive: boolean;
  office: any;
  uid?: string;
  image?: string;
}
export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type CustomPayload = {
  user_id: string;
  [key: string]: any;
};
