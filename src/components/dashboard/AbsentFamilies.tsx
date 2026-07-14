import type { FamilyStatistic } from "@/types/dashboard";
import EmptyMessage from "@/components/ui/EmptyMessage";

type AbsentFamiliesProps = {
  families: FamilyStatistic[];
};

export default function AbsentFamilies({
  families,
}: AbsentFamiliesProps) {
  const absentFamilies = families
    .filter((family) => family.absent > 0)
    .sort((familyA, familyB) => {
      if (familyA.allAbsent && !familyB.allAbsent) {
        return -1;
      }

      if (!familyA.allAbsent && familyB.allAbsent) {
        return 1;
      }

      return (
        familyB.absent - familyA.absent ||
        familyA.familyName.localeCompare(
          familyB.familyName,
          "es",
        )
      );
    });

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
        Familias
      </p>

      <h2 className="mt-1 text-xl font-bold">
        Familias con ausencias
      </h2>

      <div className="mt-4 space-y-3">
        {absentFamilies.map((family) => (
          <article
            key={family.familyName}
            className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
          >
            <div>
              <h3 className="font-bold">
                {family.familyName}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {family.absent} ausente
                {family.absent === 1 ? "" : "s"} de{" "}
                {family.total}
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                family.allAbsent
                  ? "bg-red-100 text-red-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {family.allAbsent
                ? "Familia ausente"
                : "Asistencia parcial"}
            </span>
          </article>
        ))}

        {absentFamilies.length === 0 && (
          <EmptyMessage message="No hay familias con ausencias en esta reunión." />
        )}
      </div>
    </section>
  );
}