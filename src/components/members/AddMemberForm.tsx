import type { FormEvent } from "react";

import type {
  Organization,
} from "@/types/member";

type AddMemberFormProps = {
  fullName: string;
  familyName: string;
  organization: Organization;
  recentConvert: boolean;
  savingMember: boolean;

  onFullNameChange: (value: string) => void;
  onFamilyNameChange: (value: string) => void;
  onOrganizationChange: (
    value: Organization,
  ) => void;
  onRecentConvertChange: (
    value: boolean,
  ) => void;

  onSubmit: (
    event: FormEvent<HTMLFormElement>,
  ) => void;
};

export default function AddMemberForm({
  fullName,
  familyName,
  organization,
  recentConvert,
  savingMember,
  onFullNameChange,
  onFamilyNameChange,
  onOrganizationChange,
  onRecentConvertChange,
  onSubmit,
}: AddMemberFormProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold">
        Agregar miembro
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        El miembro se guardará en Supabase.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-4 grid gap-4 sm:grid-cols-2"
      >
        <label className="block">
          <span className="text-sm font-bold text-slate-700">
            Nombre completo
          </span>

          <input
            type="text"
            value={fullName}
            disabled={savingMember}
            onChange={(event) =>
              onFullNameChange(event.target.value)
            }
            placeholder="Ej. María López"
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700 disabled:bg-slate-100"
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-slate-700">
            Familia
          </span>

          <input
            type="text"
            value={familyName}
            disabled={savingMember}
            onChange={(event) =>
              onFamilyNameChange(
                event.target.value,
              )
            }
            placeholder="Ej. Familia López"
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700 disabled:bg-slate-100"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-bold text-slate-700">
            Organización
          </span>

          <select
            value={organization}
            disabled={savingMember}
            onChange={(event) =>
              onOrganizationChange(
                event.target
                  .value as Organization,
              )
            }
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-700 disabled:bg-slate-100"
          >
            <option>
              Cuórum de Élderes
            </option>

            <option>
              Sociedad de Socorro
            </option>

            <option>
              Hombres Jóvenes
            </option>

            <option>
              Mujeres Jóvenes
            </option>

            <option>
              Primaria
            </option>

            <option>
              Otro
            </option>
          </select>
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 sm:col-span-2">
          <input
            type="checkbox"
            checked={recentConvert}
            disabled={savingMember}
            onChange={(event) =>
              onRecentConvertChange(
                event.target.checked,
              )
            }
            className="h-5 w-5"
          />

          <span className="font-semibold text-slate-700">
            Converso reciente
          </span>
        </label>

        <button
          type="submit"
          disabled={savingMember}
          className="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400 sm:col-span-2"
        >
          {savingMember
            ? "Guardando..."
            : "Agregar miembro"}
        </button>
      </form>
    </div>
  );
}