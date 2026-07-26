import EmptyMessage from "@/components/ui/EmptyMessage";
import MetricCard from "@/components/ui/MetricCard";
import SummaryMember from "@/components/attendance/SummaryMember";
import type { Member } from "@/types/member";
import type {
  MeetingVisitorWithVisitor,
} from "@/types/visitor";
import { formatMeetingDate } from "@/utils/dates";

type AttendanceSummaryViewProps = {
  meetingDate: string;
  presentMembers: Member[];
  absentMembers: Member[];
  meetingVisitors: MeetingVisitorWithVisitor[];
  attendancePercentage: number;
};

export default function AttendanceSummaryView({
  meetingDate,
  presentMembers,
  absentMembers,
  meetingVisitors,
  attendancePercentage,
}: AttendanceSummaryViewProps) {
  const totalAttendees =
    presentMembers.length +
    meetingVisitors.length;

  return (
    <section>
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
          Resumen
        </p>

        <h2 className="mt-2 text-xl font-bold capitalize">
          {formatMeetingDate(
            meetingDate,
          )}
        </h2>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <MetricCard
          number={
            presentMembers.length
          }
          label="Miembros presentes"
        />

        <MetricCard
          number={
            meetingVisitors.length
          }
          label="Visitantes"
        />

        <MetricCard
          number={totalAttendees}
          label="Total asistentes"
        />

        <MetricCard
          number={
            absentMembers.length
          }
          label="Miembros ausentes"
        />

        <MetricCard
          number={`${attendancePercentage}%`}
          label="Asistencia de miembros"
        />
      </div>

      <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold">
          Miembros presentes
        </h2>

        <div className="mt-4 space-y-2">
          {presentMembers.length >
          0 ? (
            presentMembers.map(
              (member) => (
                <SummaryMember
                  key={
                    member.id
                  }
                  member={
                    member
                  }
                  status="Presente"
                  present
                />
              ),
            )
          ) : (
            <EmptyMessage message="No hay miembros marcados como presentes." />
          )}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold">
          Visitantes presentes
        </h2>

        <div className="mt-4 space-y-2">
          {meetingVisitors.length >
          0 ? (
            meetingVisitors.map(
              (
                meetingVisitor,
              ) => {
                const visitor =
                  meetingVisitor.visitor;

                const fullName =
                  visitor.full_name.trim();

                return (
                  <div
                    key={
                      meetingVisitor.id
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="font-bold text-slate-900">
                      {fullName ||
                        "Visitante sin nombre"}
                    </p>

                    <p className="mt-1 text-sm text-emerald-700">
                      Visitante presente
                    </p>
                  </div>
                );
              },
            )
          ) : (
            <EmptyMessage message="No hay visitantes registrados en esta reunión." />
          )}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold">
          Miembros ausentes
        </h2>

        <div className="mt-4 space-y-2">
          {absentMembers.length >
          0 ? (
            absentMembers.map(
              (member) => (
                <SummaryMember
                  key={
                    member.id
                  }
                  member={
                    member
                  }
                  status="Ausente"
                />
              ),
            )
          ) : (
            <EmptyMessage message="No hay miembros ausentes." />
          )}
        </div>
      </div>
    </section>
  );
}