type MetricCardProps = {
  number: number | string;
  label: string;
};

export default function MetricCard({
  number,
  label,
}: MetricCardProps) {
  return (
    <article className="rounded-2xl bg-white p-4 text-center shadow-sm">
      <strong className="block text-2xl font-bold text-emerald-800">
        {number}
      </strong>

      <span className="mt-1 block text-xs font-semibold text-slate-500 sm:text-sm">
        {label}
      </span>
    </article>
  );
}