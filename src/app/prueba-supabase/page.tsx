"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ConnectionTest = {
  id: number;
  message: string;
  created_at: string;
};

export default function SupabaseTestPage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase
        .from("members")
        .select("id, full_name")
        .limit(1)
        .maybeSingle<ConnectionTest>();

      if (error) {
        console.error(error);
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setErrorMessage(
          "La conexión funcionó, pero la tabla no contiene el mensaje de prueba.",
        );
        setLoading(false);
        return;
      }

      setMessage(data.message);
      setLoading(false);
    }

    testConnection();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
          Prueba de base de datos
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Conexión con Supabase
        </h1>

        {loading && (
          <div className="mt-6 rounded-xl bg-slate-100 p-5">
            <p className="font-semibold text-slate-600">
              Comprobando conexión...
            </p>
          </div>
        )}

        {!loading && message && (
          <div className="mt-6 rounded-xl border border-emerald-300 bg-emerald-50 p-5">
            <p className="text-sm font-bold uppercase text-emerald-700">
              Resultado
            </p>

            <p className="mt-2 text-xl font-bold text-emerald-900">
              ✓ {message}
            </p>
          </div>
        )}

        {!loading && errorMessage && (
          <div className="mt-6 rounded-xl border border-red-300 bg-red-50 p-5">
            <p className="text-sm font-bold uppercase text-red-700">
              No se pudo completar la prueba
            </p>

            <p className="mt-2 text-red-900">
              {errorMessage}
            </p>
          </div>
        )}

        <a
          href="/"
          className="mt-6 inline-block rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white"
        >
          Volver a la aplicación
        </a>
      </div>
    </main>
  );
}