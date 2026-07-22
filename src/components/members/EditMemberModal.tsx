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
  firstName: string;
  lastName: string;
  marriedLastName: string;
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
    firstName,
    setFirstName,
  ] = useState(
    member.first_name ??
      member.full_name,
  );

  const [
    lastName,
    setLastName,
  ] = useState(
    member.last_name ?? "",
  );

  const [
    marriedLastName,
    setMarriedLastName,
  ] = useState(
    member.married_last_name ?? "",
  );

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

    const cleanFirstName =
      firstName.trim().replace(/\s+/g, " ");

    const cleanLastName =
      lastName.trim().replace(/\s+/g, " ");

    const cleanMarriedLastName =
      marriedLastName
        .trim()
        .replace(/\s+/g, " ");

    const cleanFamilyName =
      familyName
        .trim()
        .replace(/\s+/g, " ");

    if (!cleanFirstName) {
      return;
    }

    if (!cleanLastName) {
      return;
    }

    await onSave({
      firstName: cleanFirstName,
      lastName: cleanLastName,
      marriedLastName:
        cleanMarriedLastName,
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
              Actualiza la información del
              miembro.
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
              htmlFor="edit-first-name"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Nombre o nombres
            </label>

            <input
              id="edit-first-name"
              type="text"
              value={firstName}
              onChange={(event) =>
                setFirstName(
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
              htmlFor="edit-last-name"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Apellido o apellidos
            </label>

            <input
              id="edit-last-name"
              type="text"
              value={lastName}
              onChange={(event) =>
                setLastName(
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
              htmlFor="edit-married-last-name"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Apellido de casada
            </label>

            <input
              id="edit-married-last-name"
              type="text"
              value={marriedLastName}
              onChange={(event) =>
                setMarriedLastName(
                  event.target.value,
                )
              }
              disabled={saving}
              placeholder="Opcional"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
            />

            <p className="mt-1 text-xs text-gray-500">
              No escribas la palabra
              &quot;de&quot;.
            </p>
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

              <option value="Otro">
                Otro
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
                !firstName.trim() ||
                !lastName.trim()
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