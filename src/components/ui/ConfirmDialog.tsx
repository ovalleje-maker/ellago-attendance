"use client";

import Modal from "@/components/ui/Modal";

type ConfirmDialogVariant =
  | "danger"
  | "success"
  | "primary";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;

  confirmLabel?: string;
  cancelLabel?: string;

  loading?: boolean;
  variant?: ConfirmDialogVariant;

  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
};

const confirmButtonClasses: Record<
  ConfirmDialogVariant,
  string
> = {
  danger:
    "bg-red-600 text-white hover:bg-red-700",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-700",
  primary:
    "bg-blue-600 text-white hover:bg-blue-700",
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  loading = false,
  variant = "primary",
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${confirmButtonClasses[variant]}`}
          >
            {loading
              ? "Procesando..."
              : confirmLabel}
          </button>
        </div>
      }
    >
      <p className="text-sm leading-6 text-slate-600">
        {message}
      </p>
    </Modal>
  );
}