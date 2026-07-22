import type { Member } from "@/types/member";
import {
  buildDisplayName,
} from "@/utils/memberNames";

type InactiveMembersViewProps = {
  members: Member[];
  filteredMembers: Member[];
  search: string;
  loading: boolean;
  canChangeMemberStatus: boolean;
  reactivatingMemberId: string | null;
  onSearchChange: (value: string) => void;
  onReactivateMember: (
    member: Member,
  ) => void;
};

export default function InactiveMembersView({
  members,
  filteredMembers,
  search,
  loading,
  canChangeMemberStatus,
  reactivatingMemberId,
  onSearchChange,
  onReactivateMember,
}: InactiveMembersViewProps) {
  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">
            Miembros inactivos
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Aquí aparecen los miembros que
            fueron desactivados. Su historial
            de asistencia permanece guardado.
          </p>
        </div>

        <label
          htmlFor="inactive-member-search"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Buscar miembro inactivo
        </label>

        <input
          id="inactive-member-search"
          type="search"
          value={search}
          onChange={(event) =>
            onSearchChange(
              event.target.value,
            )
          }
          placeholder="Buscar por nombre, familia u organización"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />

        <div className="mt-3 text-sm text-slate-600">
          Total de miembros inactivos:{" "}
          <span className="font-bold text-slate-900">
            {members.length}
          </span>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-800">
          Cargando miembros inactivos...
        </div>
      )}

      {!loading &&
        members.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="font-semibold text-slate-800">
              No hay miembros inactivos.
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Los miembros desactivados
              aparecerán en esta sección.
            </p>
          </div>
        )}

      {!loading &&
        members.length > 0 &&
        filteredMembers.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="font-semibold text-slate-800">
              No se encontraron resultados.
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Prueba con otro nombre, familia
              u organización.
            </p>
          </div>
        )}

      {!loading &&
        filteredMembers.length > 0 && (
          <div className="space-y-3">
            {filteredMembers.map(
              (member) => {
                const isReactivating =
                  reactivatingMemberId ===
                  member.id;

                return (
                  <article
                    key={member.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900">
                          {
                            buildDisplayName(member)
                          }
                        </h3>

                        <div className="mt-1 space-y-1 text-sm text-slate-600">
                          <p>
                            Familia:{" "}
                            <span className="font-medium text-slate-800">
                              {member.family_name ||
                                "Sin familia"}
                            </span>
                          </p>

                          <p>
                            Organización:{" "}
                            <span className="font-medium text-slate-800">
                              {
                                member.organization
                              }
                            </span>
                          </p>
                        </div>
                      </div>

                      {canChangeMemberStatus && (
                        <button
                          type="button"
                          disabled={
                            isReactivating
                          }
                          onClick={() =>
                            onReactivateMember(
                              member,
                            )
                          }
                          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                        >
                          {isReactivating
                            ? "Reactivando..."
                            : "Reactivar"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}

      {!canChangeMemberStatus &&
        !loading &&
        members.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Puedes consultar los miembros
            inactivos, pero tu cuenta no tiene
            permiso para reactivarlos.
          </div>
        )}
    </section>
  );
}