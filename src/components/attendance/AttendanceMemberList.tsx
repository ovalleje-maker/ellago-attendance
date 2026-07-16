import EmptyMessage from "@/components/ui/EmptyMessage";
import type { Member } from "@/types/member";

type AttendanceMemberListProps = {
  members: Member[];
  totalMembers: number;
  presentMemberIds: Set<string>;
  changingAttendance: string | null;
  loadingMembers: boolean;
  loadingAttendance: boolean;
  canRecordAttendance: boolean;
  onToggleAttendance: (member: Member) => void;
};

export default function AttendanceMemberList({
  members,
  totalMembers,
  presentMemberIds,
  changingAttendance,
  loadingMembers,
  loadingAttendance,
  canRecordAttendance,
  onToggleAttendance,
}: AttendanceMemberListProps) {
  return (
    <div className="mt-4 space-y-3">
      {members.map((member) => {
        const isPresent =
          presentMemberIds.has(member.id);

        const isChanging =
          changingAttendance === member.id;

        return (
          <article
            key={member.id}
            className={`flex items-center justify-between gap-4 rounded-2xl border p-4 shadow-sm ${
              isPresent
                ? "border-emerald-300 bg-emerald-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <div>
              <h2 className="font-bold">
                {member.full_name}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {member.family_name || "Sin familia"} ·{" "}
                {member.organization}
              </p>
            </div>

            <button
              type="button"
              disabled={
                !canRecordAttendance ||
                isChanging ||
                loadingAttendance
              }
              onClick={() =>
                onToggleAttendance(member)
              }
              className={`min-w-28 rounded-xl px-4 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-60 ${
                isPresent
                  ? "bg-emerald-700 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {isChanging
                ? "Guardando..."
                : isPresent
                  ? "✓ Presente"
                  : "Marcar"}
            </button>
          </article>
        );
      })}

      {!loadingMembers &&
        totalMembers === 0 && (
          <EmptyMessage message="Todavía no hay miembros registrados en Supabase." />
        )}

      {totalMembers > 0 &&
        members.length === 0 && (
          <EmptyMessage message="No se encontraron miembros." />
        )}
    </div>
  );
}