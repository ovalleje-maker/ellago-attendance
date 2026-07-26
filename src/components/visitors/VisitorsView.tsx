"use client";

import {
  useMemo,
  useState,
} from "react";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EditVisitorModal from "@/components/visitors/EditVisitorModal";
import VisitorsDirectory from "@/components/visitors/VisitorsDirectory";
import type { Visitor } from "@/types/visitor";

type PendingVisitorAction =
  | {
      type: "deactivate";
      visitor: Visitor;
    }
  | {
      type: "reactivate";
      visitor: Visitor;
    }
  | null;

type VisitorsViewProps = {
  visitors: Visitor[];
  inactiveVisitors: Visitor[];
  canManageVisitors: boolean;

  loading: boolean;
  loadingInactive: boolean;
  savingVisitorEdit: boolean;

  deactivatingVisitorId: string | null;
  reactivatingVisitorId: string | null;

  visitorError: string | null;

  onSaveVisitorEdit: (
    visitor: Visitor,
  ) => Promise<boolean>;

  onDeactivateVisitor: (
    visitorId: string,
  ) => Promise<boolean>;

  onReactivateVisitor: (
    visitorId: string,
  ) => Promise<boolean>;
};

export default function VisitorsView({
  visitors,
  inactiveVisitors,
  canManageVisitors,
  loading,
  loadingInactive,
  savingVisitorEdit,
  deactivatingVisitorId,
  reactivatingVisitorId,
  visitorError,
  onSaveVisitorEdit,
  onDeactivateVisitor,
  onReactivateVisitor,
}: VisitorsViewProps) {
  const [search, setSearch] =
    useState("");

  const [
    editingVisitor,
    setEditingVisitor,
  ] = useState<Visitor | null>(null);

  const [
    showInactive,
    setShowInactive,
  ] = useState(false);

  const [
    pendingAction,
    setPendingAction,
  ] =
    useState<PendingVisitorAction>(
      null,
    );

  const displayedVisitors =
    showInactive
      ? inactiveVisitors
      : visitors;

  const filteredVisitors =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      if (!normalizedSearch) {
        return displayedVisitors;
      }

      return displayedVisitors.filter(
        (visitor) => {
          const name =
            visitor.full_name.toLowerCase();

          const phone =
            visitor.phone?.toLowerCase() ??
            "";

          return (
            name.includes(
              normalizedSearch,
            ) ||
            phone.includes(
              normalizedSearch,
            )
          );
        },
      );
    }, [
      search,
      displayedVisitors,
    ]);

  const currentLoading =
    showInactive
      ? loadingInactive
      : loading;

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Visitantes
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          {showInactive
            ? "Visitantes inactivos"
            : "Visitantes activos"}
          :{" "}
          <strong>
            {displayedVisitors.length}
          </strong>
        </p>

        {!canManageVisitors && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-800">
              Puedes consultar el directorio
              de visitantes, pero tu cuenta
              no tiene permiso para editar,
              desactivar o reactivar
              visitantes.
            </p>
          </div>
        )}

        <div className="mt-4">
          <label
            htmlFor="visitor-search"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Buscar visitante
          </label>

          <input
            id="visitor-search"
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Buscar por nombre o teléfono"
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setShowInactive(false);
              setSearch("");
              setEditingVisitor(null);
              setPendingAction(null);
            }}
            className={
              !showInactive
                ? "rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                : "rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            }
          >
            Activos ({visitors.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setShowInactive(true);
              setSearch("");
              setEditingVisitor(null);
              setPendingAction(null);
            }}
            className={
              showInactive
                ? "rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                : "rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            }
          >
            Inactivos (
            {inactiveVisitors.length})
          </button>
        </div>
      </div>

      {visitorError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">
            {visitorError}
          </p>
        </div>
      )}

      {search.trim() && (
        <p className="text-sm text-slate-600">
          Resultados encontrados:{" "}
          <strong>
            {filteredVisitors.length}
          </strong>
        </p>
      )}

      {currentLoading ? (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">
            Cargando visitantes...
          </p>
        </div>
      ) : (
        <VisitorsDirectory
          visitors={filteredVisitors}
          mode={
            showInactive
              ? "inactive"
              : "active"
          }
          canManageVisitors={
            canManageVisitors
          }
          emptyMessage={
            search.trim()
              ? "No se encontraron visitantes con esa búsqueda."
              : showInactive
                ? "No hay visitantes inactivos."
                : "No hay visitantes activos."
          }
          deactivatingVisitorId={
            deactivatingVisitorId
          }
          reactivatingVisitorId={
            reactivatingVisitorId
          }
          onEditVisitor={(visitor) => {
            if (!canManageVisitors) {
              return;
            }

            setEditingVisitor(visitor);
          }}
          onDeactivateVisitor={(
            visitor,
          ) => {
            if (!canManageVisitors) {
              return;
            }

            setPendingAction({
              type: "deactivate",
              visitor,
            });
          }}
          onReactivateVisitor={(
            visitor,
          ) => {
            if (!canManageVisitors) {
              return;
            }

            setPendingAction({
              type: "reactivate",
              visitor,
            });
          }}
        />
      )}

      <EditVisitorModal
        visitor={editingVisitor}
        open={
          editingVisitor !== null &&
          canManageVisitors
        }
        saving={savingVisitorEdit}
        onClose={() =>
          setEditingVisitor(null)
        }
        onSave={async (
          updatedVisitor,
        ) => {
          if (!canManageVisitors) {
            return;
          }

          const saved =
            await onSaveVisitorEdit(
              updatedVisitor,
            );

          if (saved) {
            setEditingVisitor(null);
          }
        }}
      />

      <ConfirmDialog
        open={
          pendingAction !== null &&
          canManageVisitors
        }
        title={
          pendingAction?.type ===
          "deactivate"
            ? "Desactivar visitante"
            : "Reactivar visitante"
        }
        message={
          pendingAction?.type ===
          "deactivate"
            ? `¿Deseas desactivar a ${pendingAction.visitor.full_name}?`
            : pendingAction?.type ===
                "reactivate"
              ? `¿Deseas reactivar a ${pendingAction.visitor.full_name}?`
              : ""
        }
        confirmLabel={
          pendingAction?.type ===
          "deactivate"
            ? "Desactivar"
            : "Reactivar"
        }
        cancelLabel="Cancelar"
        variant={
          pendingAction?.type ===
          "deactivate"
            ? "danger"
            : "success"
        }
        loading={
          pendingAction?.type ===
          "deactivate"
            ? deactivatingVisitorId ===
              pendingAction.visitor.id
            : pendingAction?.type ===
                "reactivate"
              ? reactivatingVisitorId ===
                pendingAction.visitor.id
              : false
        }
        onCancel={() => {
          setPendingAction(null);
        }}
        onConfirm={async () => {
          if (
            !pendingAction ||
            !canManageVisitors
          ) {
            return;
          }

          const action =
            pendingAction;

          const success =
            action.type ===
            "deactivate"
              ? await onDeactivateVisitor(
                  action.visitor.id,
                )
              : await onReactivateVisitor(
                  action.visitor.id,
                );

          if (success) {
            setPendingAction(null);
          }
        }}
      />
    </section>
  );
}