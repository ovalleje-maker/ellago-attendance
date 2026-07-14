export function getMostRecentSunday(): string {
  const date = new Date();
  const day = date.getDay();

  date.setDate(date.getDate() - day);

  return date.toISOString().slice(0, 10);
}

export function formatMeetingDate(
  dateValue: string,
): string {
  if (!dateValue) return "";

  return new Intl.DateTimeFormat("es-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(
    new Date(`${dateValue}T12:00:00Z`),
  );
}