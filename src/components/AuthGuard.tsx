"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getRoleLabel } from "@/types/profile";

type AuthGuardProps = {
  children: ReactNode;
};

export default function AuthGuard({
  children,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  const {
  profile,
  loadingProfile,
  profileError,
} = useUserProfile();

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    async function loadSession() {
      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error comprobando sesión:", error);
      }

      setSession(currentSession);
      setLoading(false);

      if (!currentSession && !isLoginPage) {
        router.replace("/login");
      }

      if (currentSession && isLoginPage) {
        router.replace("/");
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        setLoading(false);

        if (!currentSession && pathname !== "/login") {
          router.replace("/login");
        }

        if (currentSession && pathname === "/login") {
          router.replace("/");
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [isLoginPage, pathname, router]);

  async function handleSignOut() {
    setSigningOut(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error cerrando sesión:", error);
        alert("No fue posible cerrar la sesión.");
        setSigningOut(false);
        return;
      }

      window.location.href = "/login";
    } catch (error) {
      console.error("Error inesperado:", error);
      alert("Ocurrió un error al cerrar la sesión.");
      setSigningOut(false);
    }
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading || loadingProfile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="font-semibold text-slate-600">
          Comprobando acceso...
        </p>
      </main>
    );
  }

  if (profileError) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-lg rounded-2xl border border-red-300 bg-white p-6 text-center shadow">
        <h1 className="text-xl font-bold text-red-800">
          Cuenta sin autorización
        </h1>

        <p className="mt-3 text-slate-600">
          {profileError}
        </p>

        <button
          type="button"
          onClick={handleSignOut}
          className="mt-5 rounded-xl bg-slate-800 px-5 py-3 font-bold text-white"
        >
          Cerrar sesión
        </button>
      </div>
    </main>
  );
}

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="font-semibold text-slate-600">
          Redirigiendo...
        </p>
      </main>
    );
  }

  return (
    <>
      <div className="border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-slate-500">
              Sesión iniciada
            </p>

            <p className="truncate text-sm font-semibold text-slate-800">
  {profile?.full_name || session.user.email}
</p>

<p className="text-xs text-emerald-700">
  {profile
    ? getRoleLabel(profile.role)
    : "Usuario autorizado"}
  {profile?.organization
    ? ` · ${profile.organization}`
    : ""}
</p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="shrink-0 rounded-xl bg-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {signingOut ? "Cerrando..." : "Cerrar sesión"}
          </button>
        </div>
      </div>

      {children}
    </>
  );
}