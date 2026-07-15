export default function AppHeader() {
  return (
    <header className="bg-emerald-800 px-4 py-6 text-white shadow">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">
          Reunión sacramental
        </p>

        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
          Asistencia del Barrio
        </h1>

        <p className="mt-2 text-sm text-emerald-100">
          Información sincronizada con Supabase
        </p>
      </div>
    </header>
  );
}