export const STATUS_OPTIONS = [
  "ON_TIME",
  "LATE",
  "PENDING",
  "ABSENT",
  "SKIPPED",
  "EXCUSED",
  "UNKNOWN",
];

// Statuses that count as present for attendance calculation
export const PRESENT_STATUSES = ["ON_TIME", "LATE", "EXCUSED"];

// Statuses that count towards attendance calculation
// Doesn't include PENDING and UNKNOWN
export const COUNTED_STATUSES = ["ON_TIME", "LATE", "ABSENT", "SKIPPED", "EXCUSED"];

// Parses timestamp in "YYYY-MM-DD HH:MM" format and returns total minutes
// Time is in 24-hour format
// Null is for no timestamp, while -1 indicates an invalid format
export function getMinuteFromTimestamp(timestamp) {
  if (!timestamp) {
    return null;
  }

  const parts = timestamp.split(" ");

  if (parts.length < 2) {
    return -1;
  }

  const [hour, minute, seconds] = parts[1].split(":").map(Number);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return -1;
  }

  if (seconds) {
    if (Number.isNaN(seconds)) {
      return -1;
    }
  }

  if (seconds) {
      return (hour * 60) + minute + (seconds / 60);
  }

  return (hour * 60) + minute;
}

// Parses timestring in "HH:MM" format and returns total minutes
// Time is in 24-hour format
// Returns null if there is no timestring, while -1 indicates an invalid format
export function getMinuteFromTimestring(timeString) {
  if (!timeString) {
    return null;
  }

  const [hour, minute] = timeString.split(":").map(Number);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return -1;
  }

  return hour * 60 + minute;
}

// Calculates the session duration in minutes based on students' arrival and leave times
// Returns null if not possible
// Returns -1 if the arrival and/or leave time format is invalid
export function getSessionDurationMinutes(student) {
  const arrival = getMinuteFromTimestamp(student.lastArrival);
  const leave = getMinuteFromTimestamp(student.lastLeave);

  if (arrival === -1 || leave === -1) {
    return -1;
  }

  if (arrival == null || leave == null) {
    return null;
  }

  if (leave < arrival) {
    return -1;
  }

  return leave - arrival;
}

// Formats session duration based on students' arrival and leave times
export function formatSessionDuration(student) {
  const durationMinutes = getSessionDurationMinutes(student);

  if (durationMinutes === null || durationMinutes === -1) return "N/A";

  const totalSeconds = Math.floor(durationMinutes * 60);

  // const hours = Math.floor(durationMinutes / 60);
  // const minutes = durationMinutes % 60;
  // const seconds = durationMinutes * 60;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${hours}h ${minutes}m ${seconds}s`;
}

export function getEffectiveStatus(student, computeFn) {
  if (student.overrideStatus) {
    return student.overrideStatus;
  }

  return computeFn(student);
}

// For a single student
export function getAttendanceSummary(student, currentStatus) {
  const records = student.attendanceRecords || [];

  // Filters out unknown statuses
  const counted = records.filter((r) =>
    COUNTED_STATUSES.includes(r.status)
  );

  // const total = counted.length;
  //const [total, setTotal] = useState(counted.length);
  let total = counted.length;

  let attended = counted.filter((r) =>
      PRESENT_STATUSES.includes(r.status)
    ).length;

  if (currentStatus && currentStatus !== "PENDING" && currentStatus !== "UNKNOWN") {
    if (COUNTED_STATUSES.includes(currentStatus)) {
      //setTotal(total + 1);
      total += 1;
    }

    if (PRESENT_STATUSES.includes(currentStatus)) {
      attended += 1;
    }
  }

  // If attendance record is empty, then can't calculate past attendance
  if (total === 0) {
    return { attended: 0, total: 0, percent: 0 };
  }

  // Filter only present statuses and gets its length (attended count)
  // const attended = counted.filter((r) =>
  //   PRESENT_STATUSES.includes(r.status)
  // ).length;

  // const [attended, setAttended] = useState(
  //   counted.filter((r) =>
  //     PRESENT_STATUSES.includes(r.status)
  //   ).length
  // );

  // Calculates percentage (unrounded)
  const percent = ((attended / total) * 100);

  return { attended, total, percent };
}

// For the whole class
export function getClassAttendanceSummary(students, computeStatus) {
  let totalSessions = 0;
  let totalAttended = 0;

  // For each student, counts their attended and total sessions
  // and adds them to totalSessions and totalAttended
  // (to calculate class average)
  students.forEach((s) => {
    const effectiveStatus = getEffectiveStatus(s, computeStatus);
    const { attended, total } = getAttendanceSummary(s, effectiveStatus);
    totalSessions += total;
    totalAttended += attended;
  });

  // Calculates class average percentage (unrounded)
  const percent =
    totalSessions === 0
      ? 0
      : ((totalAttended / totalSessions) * 100);

  return { totalSessions, totalAttended, percent };
}

// Color for percentage (used in details panel, class overview)
export function getAttendanceColorClass(percent) {
  if (percent >= 90) return "text-emerald-300";
  if (percent >= 70) return "text-amber-300";
  if (percent >= 40) return "text-orange-300";
  //if (percent > 0) return "text-red-300";
  return "text-red-300";
}

// image/icon based on student percentage
export function getAttendanceEmoji(percent) {
  if (percent >= 90) return "🟢"; // S-tier
  if (percent >= 70) return "🟡"; // decent
  if (percent >= 40) return "🟠";   // bad
  return "🔴";                    // very bad
}