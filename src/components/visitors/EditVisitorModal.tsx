"use client";

import { useEffect, useState } from "react";

import Modal from "@/components/ui/Modal";
import type { Visitor } from "@/types/visitor";

type EditVisitorModalProps = {
  visitor: Visitor | null;
  open: boolean;
  saving?: boolean;
  onClose: () => void;
  onSave: (visitor: Visitor) => void;
};

export default function EditVisitorModal({
  visitor,
  open,
  saving = false,
  onClose,
  onSave,
}: EditVisitorModalProps) {
  const [fullName, setFullName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  useEffect(() => {
    if (!visitor) {
      return;
    }

    setFullName(visitor.full_name);
    setPhone(visitor.phone ?? "");
  }, [visitor]);

  if (!visitor) {
    return null;
  }

  function handleSubmit(
  event: React.FormEvent<HTMLFormElement>,
) {
  event.preventDefault();

  if (!visitor) {
    return;
  }

  const normalizedName =
    fullName.trim();

  if (!normalizedName) {
    return;
  }

  onSave({
    ...visitor,
    full_name: normalizedName,
    phone: phone.trim() || null,
  });
}

  return (
    <Modal
      open={open}
      title="Editar visitante"
      onClose={onClose}
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="edit-visitor-form"
            disabled={
              saving ||
              !fullName.trim()
            }
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Guardando..."
              : "Guardar cambios"}
          </button>
        </div>
      }
    >
      <p className="mb-5 text-sm text-slate-600">
        Actualiza la información del visitante.
      </p>

      <form
        id="edit-visitor-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label
            htmlFor="edit-visitor-name"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Nombre completo
          </label>

          <input
            id="edit-visitor-name"
            type="text"
            value={fullName}
            onChange={(event) =>
              setFullName(
                event.target.value,
              )
            }
            disabled={saving}
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
          />
        </div>

        <div>
          <label
            htmlFor="edit-visitor-phone"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Teléfono
          </label>

          <input
            id="edit-visitor-phone"
            type="tel"
            value={phone}
            onChange={(event) =>
              setPhone(
                event.target.value,
              )
            }
            disabled={saving}
            placeholder="Opcional"
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
          />
        </div>
      </form>
    </Modal>
  );
}