type NavigationButtonProps = {
  active: boolean;
  label: string;
  onClick: () => void;
};

export default function NavigationButton({
  active,
  label,
  onClick,
}: NavigationButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-4 px-2 py-4 text-sm font-bold sm:text-base ${
        active
          ? "border-emerald-700 text-emerald-800"
          : "border-transparent text-slate-500 hover:text-slate-800"
      }`}
    >
      {label}
    </button>
  );
}