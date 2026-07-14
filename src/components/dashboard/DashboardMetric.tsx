type DashboardMetricProps = {
  label: string;
  value: number | string;
  description?: string;
};

export default function DashboardMetric({
  label,
  value,
  description,
}: DashboardMetricProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">
        {label}
      </p>

      <strong className="mt-2 block text-3xl font-bold text-emerald-800">
        {value}
      </strong>

      {description && (
        <p className="mt-2 text-xs text-slate-500">
          {description}
        </p>
      )}
    </article>
  );
}