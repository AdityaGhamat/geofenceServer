import OfficeModel from "../../office/document/office.document";
import AttendanceModel from "../document/attendanceslot.document";
import UserModel from "../../auth/document/auth.document";
import client from "../config/redis.config";
import { getCurrentSlot, getTodayDate, haversine } from "../utilities";

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}
async function processOfficeAttendance(office: any) {
  const users = await UserModel.find({
    office: office._id,
  }).lean();

  console.log(`Found ${users.length} active users for office: ${office.name}`);
  if (users.length === 0) return;

  const slotTime = getCurrentSlot();
  const date = getTodayDate();
  const slots: any[] = [];

  const pipeline = client.pipeline();
  users.forEach((u: any) => pipeline.get(`location:${office._id}:${u._id}`));
  const results = await pipeline.exec();

  users.forEach((user, index) => {
    const raw = results![index][1] as string | null;
    let status: "IN" | "OUT" | "NO_DATA" = "NO_DATA";

    if (raw) {
      const parsed = JSON.parse(raw);
      const lat = parsed.lat || parsed.latitude;
      const lng = parsed.lng || parsed.longitude;

      if (lat && lng) {
        const distance = haversine(
          lat,
          lng,
          office.coordinates[0],
          office.coordinates[1]
        );
        status = distance <= office?.geofence_radius ? "IN" : "OUT";
        console.log(
          `User ${user.name} is ${distance.toFixed(2)}m away -> ${status}`
        );
      }
    }

    slots.push({
      user: user._id,
      office: office._id,
      date,
      slotTime,
      status,
    });
  });

  if (slots.length > 0) {
    try {
      const result = await AttendanceModel.insertMany(slots, {
        ordered: false,
      });
      console.log(`Successfully inserted ${result.length} records.`);
    } catch (err: any) {
      console.error(
        "InsertMany partial failure (likely duplicates):",
        err.message
      );
    }
  }
}

export async function markAttendanceJob(force: boolean = false) {
  console.log(
    `[${new Date().toISOString()}] Smart attendance job started (Force: ${force})`
  );

  try {
    const offices = await OfficeModel.find({ isActive: true }).lean();
    if (offices.length === 0) return;

    const now = new Date();
    const todayWeekday = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let processedOffices = 0;

    for (const office of offices) {
      if (!force) {
        if (!office.workingDays || !office.workingDays.includes(todayWeekday)) {
          continue;
        }

        const startMinutes = toMinutes(office.workStartTime || "09:00");
        const endMinutes = toMinutes(office.workEndTime || "18:00");

        if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
          continue;
        }
      }

      await processOfficeAttendance(office);
      processedOffices++;
    }
    console.log(`Job completed. Processed ${processedOffices} office(s).`);
  } catch (error) {
    console.error("Attendance job failed critically:", error);
  }
}
