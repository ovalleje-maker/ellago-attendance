import AttendanceMemberList from "@/components/attendance/AttendanceMemberList";
import FamilyAttendanceList from "@/components/attendance/FamilyAttendanceList";
import MetricCard from "@/components/ui/MetricCard";
import type { Member } from "@/types/member";
import {
  formatMeetingDate,
  getPreviousOrSameSunday,
  isSunday,
} from "@/utils/dates";

type FamilyGroup = [
  familyName: string,
  members: Member[],
];

type AttendanceViewProps = {
  meetingDate: string;
  attendanceSearch: string;

  members: Member[];
  filteredMembers: Member[];
  presentMembers: Member[];
  absentMembers: Member[];
  families: FamilyGroup[];

  presentMemberIds: Set<string>;
  changingAttendance: string | null;

  attendancePercentage: number;

  loadingMembers: boolean;
  loadingAttendance: boolean;
  canRecordAttendance: boolean;

  onMeetingDateChange: (
    value: string,
  ) => void;

  onSearchChange: (
    value: string,
  ) => void;

  onClearAttendance: () => void;

  onToggleAttendance: (
    member: Member,
  ) => void;

  onToggleFamily: (
    familyMembers: Member[],
  ) => void;
};

export default function AttendanceView({
  meetingDate,
  attendanceSearch,
  members,
  filteredMembers,
  presentMembers,
  absentMembers,
  families,
  presentMemberIds,
  changingAttendance,
  attendancePercentage,
  loadingMembers,
  loadingAttendance,
  canRecordAttendance,
  onMeetingDateChange,
  onSearchChange,
  onClearAttendance,
  onToggleAttendance,
  onToggleFamily,
}: AttendanceViewProps) {
    function handleDateChange(
  selectedDate: string,
) {
  if (!selectedDate) return;

  if (isSunday(selectedDate)) {
    onMeetingDateChange(selectedDate);
    return;
  }

  const correctedSunday =
    getPreviousOrSameSunday(selectedDate);

  window.alert(
    "La reunión sacramental debe registrarse en domingo. La fecha se cambió al domingo anterior.",
  );

  onMeetingDateChange(correctedSunday);
}
  return (
    <section>
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <label
          htmlFor="meetingDate"
          className="block text-sm font-bold text-slate-700"
        >
          Fecha de la reunión
        </label>

        <input
          id="meetingDate"
          type="date"
          value={meetingDate}
          disabled={loadingAttendance}
          onChange={(event) =>
  handleDateChange(event.target.value)
}
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700 disabled:bg-slate-100 sm:max-w-xs"
        />

        <p className="mt-2 text-sm capitalize text-slate-500">
          {formatMeetingDate(meetingDate)}
          Solo se permiten fechas de domingo.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <MetricCard
          number={presentMembers.length}
          label="Presentes"
        />

        <MetricCard
          number={absentMembers.length}
          label="Ausentes"
        />

        <MetricCard
          number={`${attendancePercentage}%`}
          label="Asistencia"
        />
      </div>

      <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={attendanceSearch}
            onChange={(event) =>
              onSearchChange(
                event.target.value,
              )
            }
            placeholder="Buscar miembro, familia u organización..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
          />

          <button
            type="button"
            onClick={onClearAttendance}
            disabled={
              !canRecordAttendance ||
              loadingAttendance ||
              presentMemberIds.size === 0
            }
            className="rounded-xl border border-red-300 px-4 py-3 font-bold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Limpiar día
          </button>
        </div>
      </div>

      <AttendanceMemberList
        members={filteredMembers}
        totalMembers={members.length}
        presentMemberIds={
          presentMemberIds
        }
        changingAttendance={
          changingAttendance
        }
        loadingMembers={loadingMembers}
        loadingAttendance={
          loadingAttendance
        }
        canRecordAttendance={
          canRecordAttendance
        }
        onToggleAttendance={
          onToggleAttendance
        }
      />

      <FamilyAttendanceList
        families={families}
        presentMemberIds={
          presentMemberIds
        }
        loadingAttendance={
          loadingAttendance
        }
        canRecordAttendance={
          canRecordAttendance
        }
        onToggleFamily={onToggleFamily}
      />
    </section>
  );
}