import { connectDb } from "../../core/utils/connectdb";
import UserModel from "../../auth/document/auth.document";
import OfficeModel from "../../office/document/office.document";
import dotenv from "dotenv";
import { Types } from "mongoose";

dotenv.config();
async function forceJoinAllTestUsers() {
  console.log("starting database connection");
  await connectDb();
  console.log("connection with database has been established");

  const office = await OfficeModel.findOne({
    name: "Terna College of Engineering6",
  });
  if (!office) {
    console.error("Office not found! Make sure the name matches exactly.");
    return;
  }

  const officeId = office._id;

  const result = await UserModel.updateMany(
    {
      email: { $regex: /test\.com$/ },
      office: { $exists: false },
    },
    {
      $set: {
        office: officeId,
        isActive: true,
      },
    }
  );

  const users = await UserModel.find({ office: officeId }).select("_id");
  const userIds = users.map((u) => u._id);

  await OfficeModel.findByIdAndUpdate(officeId, {
    $addToSet: { workers: { $each: userIds } },
  });

  console.log(
    `✅ Success! Linked ${result.modifiedCount} users to office ${office.name}`
  );
  process.exit(0);
}

forceJoinAllTestUsers();
