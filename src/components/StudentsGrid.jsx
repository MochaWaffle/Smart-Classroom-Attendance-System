import StudentCard from "./StudentCard.jsx";
import { getEffectiveStatus, getAttendanceSummary } from "../utils/attendance";

export default function StudentsGrid({
  students,
  selectedStudent,
  computeStatus,
  onSelectStudent,
}) {
  return (
    <section>
      <h2 className="text-sm font-semibold mb-2">
        Students In This Class
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {students.map((s) => {
          const effectiveStatus = getEffectiveStatus(s, computeStatus);
          const attendanceSummary = getAttendanceSummary(s, effectiveStatus);
          const isSelected = selectedStudent && selectedStudent.id === s.id;

          return (
            <StudentCard
              key={s.id}
              student={{ ...s, status: effectiveStatus }}
              attendanceSummary={attendanceSummary}
              onClick={() =>
                onSelectStudent(isSelected ? null : s)
              }
            />
          );
        })}
      </div>
    </section>
  );
}
