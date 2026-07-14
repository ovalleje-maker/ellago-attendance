type ErrorAlertProps = {
  message: string;
};

export default function ErrorAlert({
  message,
}: ErrorAlertProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="mb-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-800"
    >
      {message}
    </div>
  );
}