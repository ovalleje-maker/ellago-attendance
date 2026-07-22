import type {
  MemberAttendanceHistory,
} from "@/types/attendance";
import type { Member } from "@/types/member";
import EmptyMessage from "@/components/ui/EmptyMessage";
import {
  buildDisplayName,
} from "@/utils/memberNames";

type AttendanceFollowUpProps = {
  members: Member[];
  histories: MemberAttendanceHistory[];
};

type FollowUpMember = {
  member: Member;
  history: MemberAttendanceHistory;
};

export default function AttendanceFollowUp({
  members,
  histories,
}: AttendanceFollowUpProps) {
  const historyByMemberId = new Map(
    histories.map((history) => [
      history.memberId,
      history,
    ]),
  );

  const followUpMembers: FollowUpMember[] = members
    .map((member) => {
      const history = historyByMemberId.get(member.id);

      if (!history) return null;

      return {
        member,
        history,
      };
    })
    .filter(
      (item): item is FollowUpMember =>
        item !== null &&
        item.history.consecutiveAbsences >= 2,
    )
    .sort((itemA, itemB) => {
      return (
        itemB.history.consecutiveAbsences -
          itemA.history.consecutiveAbsences ||
       buildDisplayName(
        itemA.member,
      ).localeCompare(
        buildDisplayName(
          itemB.member,
        ),
        "es",
      )
      );
    });

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-red-700">
        Seguimiento
      </p>

      <h2 className="mt-1 text-xl font-bold">
        Ausencias consecutivas
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Miembros con dos o más domingos consecutivos sin asistencia registrada.
      </p>

      <div className="mt-4 space-y-3">
        {followUpMembers.map(({ member, history }) => (
          <article
            key={member.id}
            className="rounded-xl border border-slate-200 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold">
                  {buildDisplayName(member)}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {member.family_name || "Sin familia"} ·{" "}
                  {member.organization}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                  history.consecutiveAbsences >= 4
                    ? "bg-red-100 text-red-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {history.consecutiveAbsences} domingos
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                Asistencia: {history.percentage}%
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                {history.attendedMeetings} de{" "}
                {history.totalMeetings}
              </span>

              {member.recent_convert && (
                <span className="rounded-full bg-violet-100 px-3 py-1 font-semibold text-violet-800">
                  Converso reciente
                </span>
              )}
            </div>
          </article>
        ))}

        {followUpMembers.length === 0 && (
          <EmptyMessage message="No hay miembros con dos o más ausencias consecutivas." />
        )}
      </div>
    </section>
  );
}