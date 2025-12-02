import {
  STATUS_OPTIONS,
  formatSessionDuration,
  getEffectiveStatus,
  getAttendanceSummary,
  getAttendanceColorClass,
  getAttendanceEmoji,
} from "../utils/attendance";
import { formatTotalDuration } from "../utils/time";

export default function StudentDetailsPanel({
  selectedStudent,
  computeStatus,
  onOverrideStatusChange,
  showOverrideControls = true,
  onDeleteStudent,
  preview
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <h2 className="text-sm font-semibold mb-3">
        {selectedStudent ? "Student details" : "Select a student"}
      </h2>

      {!selectedStudent ? (
        <p className="text-xs text-slate-400">
          Click on a student card to see more details here.
        </p>
      ) : (
        <div className="text-sm text-slate-200 space-y-2">
          <div>
                  <span className="text-slate-400 text-xs">Name</span>
                  <div className="font-medium">{selectedStudent.name}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">UID</span>
                  <div className="text-xs text-slate-300">
                    {selectedStudent.uid}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">Total Time</span>
                  <div className="text-xs text-slate-300">
                    {formatTotalDuration(selectedStudent.totalSeconds || 0)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">
                    Arrival Time
                  </span>
                  <div className="text-xs">
                    {selectedStudent.lastArrival || "N/A"}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">
                    Leave Time
                  </span>
                  <div className="text-xs">
                    {selectedStudent.lastLeave || "N/A"}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">Duration</span>
                  <div className="text-xs text-slate-300">
                    {formatSessionDuration(selectedStudent)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">Visit Count</span>
                  <div className="text-xs text-slate-300">
                    {selectedStudent.visitCount || 0}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">Status</span>
                  <div className="text-xs">
                    {getEffectiveStatus(selectedStudent, computeStatus, preview)}
                  </div>
                </div>
                {showOverrideControls && (
                    <div>
                    <span className="text-slate-400 text-xs">Override Status</span>
                    <select
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500
                                  hover:border-emerald-500 hover:bg-slate-900 transition-colors"
                      value={selectedStudent.overrideStatus || ""}
                      onChange={(e) =>
                        onOverrideStatusChange(selectedStudent.id, e.target.value)
                      }
                    >
                      <option value="">Use Automatic</option>
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500 mt-2">
                      Choosing a value here locks this student&apos;s status and
                      ignores automatic rules until you switch back to
                      <span className="italic"> Use automatic</span>.
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 text-xs">Attendance</span>
                  {(() => {
                    const effectiveStatus = getEffectiveStatus(selectedStudent, computeStatus, preview);
                    const { attended, total, percent } = getAttendanceSummary(selectedStudent, effectiveStatus, preview);
                    const color = getAttendanceColorClass(percent);
                    const emoji = getAttendanceEmoji(percent);

                    return (
                      <div className="mt-1 flex items-center justify-between">
                        <div>
                          <div className={`text-sm font-semibold ${color}`}>
                            {total > 0
                              ? `${percent.toFixed(2)}% attendance (${attended}/${total} sessions)`
                              : "No attendance data"}
                          </div>
                          {total > 0 && (
                            <div className="text-[10px] text-slate-500">
                              Present = ON_TIME, LATE, or EXCUSED
                            </div>
                          )}
                        </div>
                        <div className="text-2xl ml-3">
                          {emoji}
                          {/* Image alternative (I might implement this later)
                            <img
                              src={getAttendanceImageSrc(percent)}
                              alt="Attendance tier"
                              className="w-10 h-10"
                            />
                          */}
                        </div>
                      </div>
                    );
                  })()}
                </div>
                {/* <span className="text-slate-400 text-xs">Delete Student</span> */}
                {showOverrideControls && (
                    <div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // don’t trigger the card’s onClick

                          if (onDeleteStudent && selectedStudent) {
                            onDeleteStudent(selectedStudent);
                          }
                        }}
                        className="text-[12px] mt-2 px-2 py-0.5 rounded-full
                                  border border-red-500/60 text-red-300 bg-slate-900/80
                                  hover:bg-red-500/10 hover:border-red-400 
                                  hover:shadow-lg hover:shadow-red-500/50
                                  hover:-translate-y-1 hover:scale-101
                                  transition-all duration-400"
                      >
                        Delete Student
                      </button>
                    </div>
                  )}
                <div className="mt-3">
                  <span className="text-slate-400 text-xs">Session history</span>
                  {(() => {
                    const records = Array.isArray(selectedStudent.attendanceRecords)
                      ? [...selectedStudent.attendanceRecords]
                      : [];

                    if (records.length === 0) {
                      return (
                        <p className="text-[11px] text-slate-500 mt-1">
                          No saved sessions yet.
                        </p>
                      );
                    }

                    // newest first
                    records.sort((a, b) => b.date.localeCompare(a.date));

                    return (
                      <div className="mt-1 max-h-40 overflow-y-auto pr-1 space-y-1">
                        {records.map((rec, idx) => {
                          const effStatus =
                            rec.overrideStatus || rec.status || "UNKNOWN";

                          return (
                            <div
                              key={`${rec.date}-${idx}`}
                              className="flex justify-between items-baseline text-[11px] border border-slate-800 rounded-lg px-2 py-1 bg-slate-950/60"
                            >
                              <div>
                                <div className="font-medium text-slate-100">
                                  {rec.date}
                                </div>
                                <div className="text-slate-400">
                                  {(rec.lastArrival || "N/A") +
                                    " → " +
                                    (rec.lastLeave || "N/A")}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="inline-flex items-center rounded-full border border-slate-600 px-2 py-0.5 text-[10px] text-slate-100">
                                  {effStatus}
                                  {rec.overrideStatus && (
                                    <span className="ml-1 text-[9px] text-amber-300">
                                      (override)
                                    </span>
                                  )}
                                </div>
                                <div className="text-slate-400 mt-0.5">
                                  {formatTotalDuration(rec.durationSeconds || 0)}
                                </div>
                                {typeof rec.visitCount === "number" && (
                                  <div className="text-slate-500">
                                    visits: {rec.visitCount}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
              </div>
        </div>
      )}
    </div>
  );
}
