"use client";

import type {
  Member,
} from "@/types/member";
import {
  buildDisplayName,
} from "@/utils/memberNames";

type MembersDirectoryProps = {
  members: Member[];
  filteredMembers: Member[];
  memberSearch: string;
  loadingMembers: boolean;
  canManageMembers: boolean;
  canChangeMemberStatus: boolean;

  onSearchChange: (
    value: string,
  ) => void;

  onViewMember: (
    member: Member,
  ) => void;

  onEditMember: (
    member: Member,
  ) => void;

  onDeactivateMember: (
    member: Member,
  ) => void | Promise<void>;
};

export default function MembersDirectory({
  members,
  filteredMembers,
  memberSearch,
  loadingMembers,
  canManageMembers,
  canChangeMemberStatus,
  onSearchChange,
  onViewMember,
  onEditMember,
  onDeactivateMember,
}: MembersDirectoryProps) {
  if (loadingMembers) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-600">
        Cargando miembros...
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Directorio de miembros
          </h2>

          <p className="text-sm text-gray-600">
            {members.length} miembros activos
          </p>
        </div>

        <input
          type="search"
          value={memberSearch}
          onChange={(event) =>
            onSearchChange(
              event.target.value,
            )
          }
          placeholder="Buscar miembro..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:max-w-xs"
        />
      </div>

      {filteredMembers.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-600">
          {memberSearch.trim()
            ? "No se encontraron miembros con esa búsqueda."
            : "Todavía no hay miembros registrados."}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="divide-y divide-gray-200">
            {filteredMembers.map(
              (member) => (
                <div
                  key={member.id}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">
                      {buildDisplayName(member)}
                    </p>

                    <div className="mt-1 space-y-1 text-sm text-gray-600">
                      <p>
                        Familia:{" "}
                        {member.family_name?.trim() ||
                          "Sin familia"}
                      </p>

                      <p>
                        Organización:{" "}
                        {member.organization}
                      </p>

                      {member.recent_convert && (
                        <p className="font-medium text-blue-700">
                          Converso reciente
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onViewMember(member)
                      }
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      Ver perfil
                    </button>

                    {canChangeMemberStatus && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            onEditMember(
                              member,
                            )
                          }
                          className="rounded-lg border border-blue-600 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void onDeactivateMember(
                              member,
                            )
                          }
                          className="rounded-lg border border-red-600 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                        >
                          Desactivar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </section>
  );
}