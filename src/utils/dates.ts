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

export function getPreviousSundayDates(
  endDate: string,
  numberOfWeeks: number,
): string[] {
  if (!endDate || numberOfWeeks <= 0) {
    return [];
  }

  const selectedDate =
    new Date(`${endDate}T12:00:00Z`);

  const dayOfWeek =
    selectedDate.getUTCDay();

  selectedDate.setUTCDate(
    selectedDate.getUTCDate() - dayOfWeek,
  );

  const dates: string[] = [];

  for (
    let index = 0;
    index < numberOfWeeks;
    index++
  ) {
    const sunday =
      new Date(selectedDate);

    sunday.setUTCDate(
      selectedDate.getUTCDate() -
        index * 7,
    );

    dates.push(
      sunday.toISOString().slice(0, 10),
    );
  }

  return dates;
}