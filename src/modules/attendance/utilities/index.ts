export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}
export function getWorkingDayMinutes(
  startTime: string,
  endTime: string
): number {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  return end - start;
}

export function getTodayDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

export function getCurrentSlot(intervalMinutes: number = 15) {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = now.getMinutes();
  const roundMinutes = Math.floor(minutes / intervalMinutes) * intervalMinutes;
  const minStr = String(roundMinutes).padStart(2, "0");
  return `${hours}:${minStr}`;
}

export function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;

  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
