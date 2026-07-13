"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/");
        return;
      }

      setCheckingSession(false);
    }

    checkSession();
  }, [router]);

async function handleLogin(
  event: FormEvent<HTMLFormElement>,
) {
  event.preventDefault();

  setErrorMessage("");

  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail) {
    setErrorMessage("Escribe tu correo electrónico.");
    return;
  }

  if (!password) {
    setErrorMessage("Escribe tu contraseña.");
    return;
  }

  setLoading(true);

  try {
    console.log("Intentando iniciar sesión...");

    const loginPromise = supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(
          new Error(
            "La conexión con Supabase tardó demasiado.",
          ),
        );
      }, 15000);
    });

    const result = await Promise.race([
      loginPromise,
      timeoutPromise,
    ]);

    console.log("Respuesta de Supabase:", result);

    if (result.error) {
      console.error("Error de Supabase:", result.error);

      setErrorMessage(
        `No fue posible iniciar sesión: ${result.error.message}`,
      );

      return;
    }

    if (!result.data.session) {
      setErrorMessage(
        "Supabase aceptó la solicitud, pero no creó una sesión.",
      );

      return;
    }

    console.log(
      "Sesión iniciada:",
      result.data.session.user.email,
    );

    window.location.href = "/";
  } catch (error) {
    console.error("Error durante el inicio de sesión:", error);

    if (error instanceof Error) {
      setErrorMessage(error.message);
    } else {
      setErrorMessage(
        "Ocurrió un error inesperado al iniciar sesión.",
      );
    }
  } finally {
    setLoading(false);
  }
}

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <p className="font-semibold text-slate-600">
          Comprobando sesión...
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-5">
      <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-lg sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">
          ✓
        </div>

        <p className="mt-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
          Reunión sacramental
        </p>

        <h1 className="mt-2 text-center text-3xl font-bold text-slate-900">
          Asistencia del Barrio
        </h1>

        <p className="mt-3 text-center text-sm text-slate-500">
          Ingresa con una cuenta autorizada.
        </p>

        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-5"
        >
          <label className="block">
            <span className="text-sm font-bold text-slate-700">
              Correo electrónico
            </span>

            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nombre@correo.com"
              disabled={loading}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">
              Contraseña
            </span>

            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Escribe tu contraseña"
              disabled={loading}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
            />
          </label>

          {errorMessage && (
            <div
              role="alert"
              className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-800"
            >
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400"
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="mt-6 rounded-xl bg-slate-100 p-4">
          <p className="text-center text-xs leading-5 text-slate-500">
            El acceso está limitado a personas autorizadas.
            Comunícate con el administrador si necesitas una
            cuenta.
          </p>
        </div>
      </section>
    </main>
  );
}