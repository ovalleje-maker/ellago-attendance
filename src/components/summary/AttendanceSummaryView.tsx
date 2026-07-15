import EmptyMessage from "@/components/ui/EmptyMessage";
import MetricCard from "@/components/ui/MetricCard";
import SummaryMember from "@/components/attendance/SummaryMember";
import type { Member } from "@/types/member";
import { formatMeetingDate } from "@/utils/dates";

type AttendanceSummaryViewProps = {
  meetingDate: string;
  presentMembers: Member[];
  absentMembers: Member[];
  attendancePercentage: number;
};

export default function AttendanceSummaryView({
  meetingDate,
  presentMembers,
  absentMembers,
  attendancePercentage,
}: AttendanceSummaryViewProps) {
  return (
    <section>
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
          Resumen
        </p>

        <h2 className="mt-2 text-xl font-bold capitalize">
          {formatMeetingDate(meetingDate)}
        </h2>
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
        <h2 className="text-xl font-bold">
          Miembros presentes
        </h2>

        <div className="mt-4 space-y-2">
          {presentMembers.length > 0 ? (
            presentMembers.map((member) => (
              <SummaryMember
                key={member.id}
                member={member}
                status="Presente"
                present
              />
            ))
          ) : (
            <EmptyMessage message="No hay miembros marcados como presentes." />
          )}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold">
          Miembros ausentes
        </h2>

        <div className="mt-4 space-y-2">
          {absentMembers.length > 0 ? (
            absentMembers.map((member) => (
              <SummaryMember
                key={member.id}
                member={member}
                status="Ausente"
              />
            ))
          ) : (
            <EmptyMessage message="No hay miembros ausentes." />
          )}
        </div>
      </div>
    </section>
  );
}