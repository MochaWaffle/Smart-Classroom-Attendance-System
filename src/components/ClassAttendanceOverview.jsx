import {
  getClassAttendanceSummary,
  getAttendanceColorClass,
  getAttendanceEmoji,
} from "../utils/attendance";

export default function ClassAttendanceOverview({ students, computeStatus }) {
  const { totalSessions, totalAttended, percent } =
    getClassAttendanceSummary(students, computeStatus);
  const color = getAttendanceColorClass(percent);
  const emoji = getAttendanceEmoji(percent);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 mb-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold mb-1">
            Class Attendance Overview
          </h2>
          <p className={`text-sm font-medium ${color}`}>
            Average Attendance: {percent.toFixed(2)}%{" "}
            {totalSessions > 0 &&
              `(${totalAttended}/${totalSessions} total session-marks)`}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Based on counted statuses: ON_TIME, LATE, ABSENT, SKIPPED, EXCUSED.
          </p>
        </div>
        <div className="text-3xl">{emoji}</div>
      </div>
    </section>
  );
}
