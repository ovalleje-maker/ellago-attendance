"use client";

import type { Visitor } from "@/types/visitor";

type VisitorsDirectoryMode =
  | "active"
  | "inactive";

type VisitorsDirectoryProps = {
  visitors: Visitor[];
  mode: VisitorsDirectoryMode;
  canManageVisitors: boolean;
  emptyMessage?: string;

  deactivatingVisitorId?: string | null;
  reactivatingVisitorId?: string | null;

  onEditVisitor?: (
    visitor: Visitor,
  ) => void;

  onDeactivateVisitor?: (
    visitor: Visitor,
  ) => void | Promise<void>;

  onReactivateVisitor?: (
    visitor: Visitor,
  ) => void | Promise<void>;
};

export default function VisitorsDirectory({
  visitors,
  mode,
  canManageVisitors,
  emptyMessage = "No hay visitantes registrados.",
  deactivatingVisitorId = null,
  reactivatingVisitorId = null,
  onEditVisitor,
  onDeactivateVisitor,
  onReactivateVisitor,
}: VisitorsDirectoryProps) {
  if (visitors.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Nombre
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Teléfono
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Estado
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {visitors.map((visitor) => {
              const isDeactivating =
                deactivatingVisitorId ===
                visitor.id;

              const isReactivating =
                reactivatingVisitorId ===
                visitor.id;

              const isSaving =
                isDeactivating ||
                isReactivating;

              return (
                <tr
                  key={visitor.id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {visitor.full_name}
                  </td>

                  <td className="px-4 py-3 text-sm text-slate-600">
                    {visitor.phone || "—"}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={
                        mode === "active"
                          ? "inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                          : "inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                      }
                    >
                      {mode === "active"
                        ? "Activo"
                        : "Inactivo"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {mode === "active" && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              onEditVisitor?.(
                                visitor,
                              )
                            }
                            disabled={
                              !canManageVisitors ||
                              isSaving
                            }
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onDeactivateVisitor?.(
                                visitor,
                              )
                            }
                            disabled={
                              !canManageVisitors ||
                              isSaving
                            }
                            className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isDeactivating
                              ? "Desactivando..."
                              : "Desactivar"}
                          </button>
                        </>
                      )}

                      {mode === "inactive" && (
                        <button
                          type="button"
                          onClick={() =>
                            onReactivateVisitor?.(
                              visitor,
                            )
                          }
                          disabled={
                            !canManageVisitors ||
                            isSaving
                          }
                          className="rounded-lg border border-emerald-300 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isReactivating
                            ? "Reactivando..."
                            : "Reactivar"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}