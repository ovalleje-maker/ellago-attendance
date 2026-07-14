import type {
  OrganizationStatistic,
} from "@/types/dashboard";

type OrganizationStatisticsProps = {
  statistics: OrganizationStatistic[];
};

export default function OrganizationStatistics({
  statistics,
}: OrganizationStatisticsProps) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
          Organizaciones
        </p>

        <h2 className="mt-1 text-xl font-bold">
          Asistencia por organización
        </h2>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-left text-sm text-slate-500">
              <th className="px-3 py-3">
                Organización
              </th>

              <th className="px-3 py-3 text-center">
                Total
              </th>

              <th className="px-3 py-3 text-center">
                Presentes
              </th>

              <th className="px-3 py-3 text-center">
                Ausentes
              </th>

              <th className="px-3 py-3 text-center">
                Porcentaje
              </th>
            </tr>
          </thead>

          <tbody>
            {statistics.map((statistic) => (
              <tr
                key={statistic.organization}
                className="border-b border-slate-100"
              >
                <td className="px-3 py-4 font-semibold">
                  {statistic.organization}
                </td>

                <td className="px-3 py-4 text-center">
                  {statistic.total}
                </td>

                <td className="px-3 py-4 text-center text-emerald-700">
                  {statistic.present}
                </td>

                <td className="px-3 py-4 text-center text-amber-700">
                  {statistic.absent}
                </td>

                <td className="px-3 py-4 text-center">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      statistic.percentage >= 75
                        ? "bg-emerald-100 text-emerald-800"
                        : statistic.percentage >= 50
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {statistic.percentage}%
                  </span>
                </td>
              </tr>
            ))}

            {statistics.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-8 text-center text-slate-500"
                >
                  No hay información disponible.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}