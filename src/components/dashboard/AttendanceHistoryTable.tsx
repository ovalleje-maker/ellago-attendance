import type {
  MemberAttendanceHistory,
} from "@/types/attendance";

import type { Member } from "@/types/member";
import {
  buildDisplayName,
} from "@/utils/memberNames";

type AttendanceHistoryTableProps = {
  members: Member[];
  histories: MemberAttendanceHistory[];
  dates: string[];
};

function formatShortDate(date: string): string {
  return new Intl.DateTimeFormat("es-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(
    new Date(`${date}T12:00:00Z`),
  );
}

export default function AttendanceHistoryTable({
  members,
  histories,
  dates,
}: AttendanceHistoryTableProps) {
  const historyByMemberId = new Map(
    histories.map((history) => [
      history.memberId,
      history,
    ]),
  );

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-blue-700">
        Historial
      </p>

      <h2 className="mt-1 text-xl font-bold">
        Últimas semanas
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        ✓ significa presente y — significa sin registro.
      </p>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
              <th className="sticky left-0 bg-white px-3 py-3">
                Miembro
              </th>

              {dates.map((date) => (
                <th
                  key={date}
                  className="px-3 py-3 text-center capitalize"
                >
                  {formatShortDate(date)}
                </th>
              ))}

              <th className="px-3 py-3 text-center">
                %
              </th>
            </tr>
          </thead>

          <tbody>
            {[...members]
              .sort((memberA, memberB) =>
              buildDisplayName(
                 memberA,
              ).localeCompare(
                buildDisplayName(
                  memberB,
                ),
                "es",
              ),
              )
              .map((member) => {
                const history =
                  historyByMemberId.get(member.id);

                return (
                  <tr
                    key={member.id}
                    className="border-b border-slate-100"
                  >
                    <td className="sticky left-0 bg-white px-3 py-4">
                      <p className="font-semibold">
                        {buildDisplayName(member)}
                      </p>

                      <p className="text-xs text-slate-500">
                        {member.organization}
                      </p>
                    </td>

                    {dates.map((date) => {
                      const isPresent =
                        history?.attendanceByDate[
                          date
                        ] ?? false;

                      return (
                        <td
                          key={date}
                          className="px-3 py-4 text-center"
                        >
                          <span
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                              isPresent
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {isPresent ? "✓" : "—"}
                          </span>
                        </td>
                      );
                    })}

                    <td className="px-3 py-4 text-center font-bold">
                      {history?.percentage ?? 0}%
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </section>
  );
}