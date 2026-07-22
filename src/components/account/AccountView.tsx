"use client";

import {
  FormEvent,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

import type {
  UserProfile,
} from "@/types/profile";

import {
  getRoleLabel,
} from "@/types/profile";

type AccountViewProps = {
  profile: UserProfile | null;
};

const MINIMUM_PASSWORD_LENGTH = 8;

export default function AccountView({
  profile,
}: AccountViewProps) {
  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [
    confirmNewPassword,
    setConfirmNewPassword,
  ] = useState("");

  const [savingPassword, setSavingPassword] =
    useState(false);

  const [passwordError, setPasswordError] =
    useState("");

  const [passwordSuccess, setPasswordSuccess] =
    useState("");

  async function handleChangePassword(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError(
        "Ingresa tu contraseña actual.",
      );

      return;
    }

    if (
      newPassword.length <
      MINIMUM_PASSWORD_LENGTH
    ) {
      setPasswordError(
        `La nueva contraseña debe tener al menos ${MINIMUM_PASSWORD_LENGTH} caracteres.`,
      );

      return;
    }

    if (
      newPassword !==
      confirmNewPassword
    ) {
      setPasswordError(
        "La confirmación no coincide con la nueva contraseña.",
      );

      return;
    }

    if (
      currentPassword ===
      newPassword
    ) {
      setPasswordError(
        "La nueva contraseña debe ser diferente de la contraseña actual.",
      );

      return;
    }

    setSavingPassword(true);

    try {
      const { error } =
        await supabase.auth.updateUser({
          current_password:
            currentPassword,
          password: newPassword,
        });

      if (error) {
        console.error(
          "No se pudo cambiar la contraseña:",
          error,
        );

        const normalizedMessage =
          error.message.toLowerCase();

        if (
          normalizedMessage.includes(
            "current password",
          ) ||
          normalizedMessage.includes(
            "invalid password",
          )
        ) {
          setPasswordError(
            "La contraseña actual no es correcta.",
          );
        } else if (
          normalizedMessage.includes(
            "password should be",
          ) ||
          normalizedMessage.includes(
            "weak password",
          )
        ) {
          setPasswordError(
            "La nueva contraseña no cumple con los requisitos de seguridad.",
          );
        } else {
          setPasswordError(
            "No fue posible cambiar la contraseña. Inténtalo nuevamente.",
          );
        }

        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      setPasswordSuccess(
        "Tu contraseña fue actualizada correctamente.",
      );
    } catch (error) {
      console.error(
        "Error inesperado al cambiar la contraseña:",
        error,
      );

      setPasswordError(
        "Ocurrió un error inesperado. Inténtalo nuevamente.",
      );
    } finally {
      setSavingPassword(false);
    }
  }

  if (!profile) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          No fue posible cargar la información de tu cuenta.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Mi cuenta
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Consulta la información de tu usuario y administra tu contraseña.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Información del perfil
        </h2>

        <dl className="mt-5 space-y-4">
          <div>
            <dt className="text-sm font-medium text-slate-500">
              Nombre
            </dt>

            <dd className="mt-1 text-base font-semibold text-slate-900">
              {profile.full_name}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-slate-500">
              Rol
            </dt>

            <dd className="mt-1 text-base text-slate-900">
              {getRoleLabel(
                profile.role,
              )}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-slate-500">
              Organización
            </dt>

            <dd className="mt-1 text-base text-slate-900">
              {profile.organization ||
                "No aplica"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Cambiar contraseña
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Usa una contraseña de al menos ocho caracteres que no utilices en otras cuentas.
        </p>

        <form
          className="mt-6 space-y-5"
          onSubmit={
            handleChangePassword
          }
        >
          <div>
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="current-password"
            >
              Contraseña actual
            </label>

            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={
                currentPassword
              }
              onChange={(event) =>
                setCurrentPassword(
                  event.target.value,
                )
              }
              disabled={
                savingPassword
              }
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="new-password"
            >
              Nueva contraseña
            </label>

            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(
                  event.target.value,
                )
              }
              disabled={
                savingPassword
              }
              minLength={
                MINIMUM_PASSWORD_LENGTH
              }
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="confirm-new-password"
            >
              Confirmar nueva contraseña
            </label>

            <input
              id="confirm-new-password"
              type="password"
              autoComplete="new-password"
              value={
                confirmNewPassword
              }
              onChange={(event) =>
                setConfirmNewPassword(
                  event.target.value,
                )
              }
              disabled={
                savingPassword
              }
              minLength={
                MINIMUM_PASSWORD_LENGTH
              }
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          {passwordError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800"
            >
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div
              role="status"
              className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-800"
            >
              {passwordSuccess}
            </div>
          )}

          <button
            type="submit"
            disabled={
              savingPassword
            }
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {savingPassword
              ? "Actualizando..."
              : "Cambiar contraseña"}
          </button>
        </form>
      </div>
    </section>
  );
}