import type { Member } from "@/types/member";

type FamilyGroup = [
  familyName: string,
  members: Member[],
];

type FamilyAttendanceListProps = {
  families: FamilyGroup[];
  presentMemberIds: Set<string>;
  loadingAttendance: boolean;
  canRecordAttendance: boolean;
  onToggleFamily: (
    familyMembers: Member[],
  ) => void;
};

export default function FamilyAttendanceList({
  families,
  presentMemberIds,
  loadingAttendance,
  canRecordAttendance,
  onToggleFamily,
}: FamilyAttendanceListProps) {
  if (families.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold">
        Registrar por familia
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        El registro se guardará inmediatamente
        en Supabase.
      </p>

      <div className="mt-4 space-y-3">
        {families.map(
          ([family, familyMembers]) => {
            const allPresent =
              familyMembers.every((member) =>
                presentMemberIds.has(member.id),
              );

            return (
              <div
                key={family}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4"
              >
                <div>
                  <h3 className="font-bold">
                    {family}
                  </h3>

                  <p className="text-sm text-slate-500">
                    {familyMembers.length}{" "}
                    miembro
                    {familyMembers.length === 1
                      ? ""
                      : "s"}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={
                    !canRecordAttendance ||
                    loadingAttendance
                  }
                  onClick={() =>
                    onToggleFamily(
                      familyMembers,
                    )
                  }
                  className={`rounded-xl px-4 py-3 font-bold disabled:opacity-50 ${
                    allPresent
                      ? "bg-red-100 text-red-700"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {allPresent
                    ? "Desmarcar"
                    : "Marcar familia"}
                </button>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}