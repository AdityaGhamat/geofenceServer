import mongoose from "mongoose";

export async function connectDb(): Promise<void> {
  try {
    mongoose
      .connect(process.env.DATABASE_URL as string)
      .then(() => console.log("database is connected"));
  } catch (error: any) {
    console.error(error);
    process.exit(1);
  }
}
