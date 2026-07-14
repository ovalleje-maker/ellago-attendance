import type { Member } from "@/types/member";
import EmptyMessage from "@/components/ui/EmptyMessage";

type RecentConvertsProps = {
  members: Member[];
  presentMemberIds: Set<string>;
};

export default function RecentConverts({
  members,
  presentMemberIds,
}: RecentConvertsProps) {
  const recentConverts = members.filter(
    (member) => member.recent_convert,
  );

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-violet-700">
        Conversos recientes
      </p>

      <h2 className="mt-1 text-xl font-bold">
        Asistencia de conversos recientes
      </h2>

      <div className="mt-4 space-y-3">
        {recentConverts.map((member) => {
          const isPresent = presentMemberIds.has(
            member.id,
          );

          return (
            <article
              key={member.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
            >
              <div>
                <h3 className="font-bold">
                  {member.full_name}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {member.family_name || "Sin familia"} ·{" "}
                  {member.organization}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  isPresent
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {isPresent ? "Presente" : "Ausente"}
              </span>
            </article>
          );
        })}

        {recentConverts.length === 0 && (
          <EmptyMessage message="No hay conversos recientes registrados." />
        )}
      </div>
    </section>
  );
}