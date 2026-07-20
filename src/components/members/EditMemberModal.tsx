"use client";

import {
  type FormEvent,
  useState,
} from "react";

import type {
  Member,
  Organization,
} from "@/types/member";

type EditMemberValues = {
  fullName: string;
  familyName: string;
  organization: Organization;
  recentConvert: boolean;
};

type EditMemberModalProps = {
  member: Member;
  saving: boolean;
  onClose: () => void;
  onSave: (
    values: EditMemberValues,
  ) => void | Promise<void>;
};

export default function EditMemberModal({
  member,
  saving,
  onClose,
  onSave,
}: EditMemberModalProps) {
  const [
    fullName,
    setFullName,
  ] = useState(member.full_name);

  const [
    familyName,
    setFamilyName,
  ] = useState(
    member.family_name ?? "",
  );

  const [
    organization,
    setOrganization,
  ] = useState<Organization>(
    member.organization,
  );

  const [
    recentConvert,
    setRecentConvert,
  ] = useState(
    member.recent_convert,
  );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const cleanFullName =
      fullName.trim();

    const cleanFamilyName =
      familyName.trim();

    if (!cleanFullName) {
      return;
    }

    await onSave({
      fullName: cleanFullName,
      familyName: cleanFamilyName,
      organization,
      recentConvert,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-member-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2
              id="edit-member-title"
              className="text-xl font-semibold text-gray-900"
            >
              Editar miembro
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Actualiza la información del miembro.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg px-3 py-1 text-xl text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Cerrar ventana"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="edit-full-name"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Nombre completo
            </label>

            <input
              id="edit-full-name"
              type="text"
              value={fullName}
              onChange={(event) =>
                setFullName(
                  event.target.value,
                )
              }
              disabled={saving}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label
              htmlFor="edit-family-name"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Familia
            </label>

            <input
              id="edit-family-name"
              type="text"
              value={familyName}
              onChange={(event) =>
                setFamilyName(
                  event.target.value,
                )
              }
              disabled={saving}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label
              htmlFor="edit-organization"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Organización
            </label>

            <select
              id="edit-organization"
              value={organization}
              onChange={(event) =>
                setOrganization(
                  event.target
                    .value as Organization,
                )
              }
              disabled={saving}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
            >
              <option value="Cuórum de Élderes">
                Cuórum de Élderes
              </option>

              <option value="Sociedad de Socorro">
                Sociedad de Socorro
              </option>

              <option value="Mujeres Jóvenes">
                Mujeres Jóvenes
              </option>

              <option value="Hombres Jóvenes">
                Hombres Jóvenes
              </option>

              <option value="Primaria">
                Primaria
              </option>

              <option value="Otros">
                Otros
              </option>
            </select>
          </div>

          <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
            <input
              type="checkbox"
              checked={recentConvert}
              onChange={(event) =>
                setRecentConvert(
                  event.target.checked,
                )
              }
              disabled={saving}
              className="h-4 w-4"
            />

            <span className="text-sm text-gray-700">
              Converso reciente
            </span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                !fullName.trim()
              }
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Guardando..."
                : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}