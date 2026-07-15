import EmptyMessage from "@/components/ui/EmptyMessage";

import type {
  Member,
} from "@/types/member";

type MembersDirectoryProps = {
  members: Member[];
  filteredMembers: Member[];
  memberSearch: string;
  loadingMembers: boolean;
  canManageMembers: boolean;

  onSearchChange: (value: string) => void;
  onDeleteMember: (member: Member) => void;
};

export default function MembersDirectory({
  members,
  filteredMembers,
  memberSearch,
  loadingMembers,
  canManageMembers,
  onSearchChange,
  onDeleteMember,
}: MembersDirectoryProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-xl font-bold">
          Directorio
        </h2>

        <p className="text-sm text-slate-500">
          {members.length} miembro
          {members.length === 1 ? "" : "s"}{" "}
          almacenado
          {members.length === 1 ? "" : "s"}{" "}
          en Supabase
        </p>
      </div>

      <input
        type="search"
        value={memberSearch}
        onChange={(event) =>
          onSearchChange(event.target.value)
        }
        placeholder="Buscar miembro..."
        className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
      />

      <div className="mt-4 space-y-3">
        {filteredMembers.map((member) => (
          <article
            key={member.id}
            className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center"
          >
            <div>
              <h3 className="font-bold">
                {member.full_name}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {member.family_name ||
                  "Sin familia"}{" "}
                · {member.organization}
              </p>

              {member.recent_convert && (
                <span className="mt-2 inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-800">
                  Converso reciente
                </span>
              )}
            </div>

            {canManageMembers && (
              <button
                type="button"
                onClick={() =>
                  onDeleteMember(member)
                }
                className="shrink-0 rounded-xl bg-red-100 px-4 py-2 font-bold text-red-700 hover:bg-red-200"
              >
                Eliminar
              </button>
            )}
          </article>
        ))}

        {!loadingMembers &&
          members.length === 0 && (
            <EmptyMessage message="Todavía no hay miembros almacenados en Supabase." />
          )}

        {members.length > 0 &&
          filteredMembers.length === 0 && (
            <EmptyMessage message="No se encontraron miembros." />
          )}
      </div>
    </div>
  );
}