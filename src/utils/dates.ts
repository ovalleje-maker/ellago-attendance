function formatLocalDate(date: Date): string {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getMostRecentSunday(): string {
  const today = new Date();

  const sunday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - today.getDay(),
    12,
    0,
    0,
  );

  return formatLocalDate(sunday);
}

export function formatMeetingDate(
  dateValue: string,
): string {
  if (!dateValue) return "";

  const date = new Date(
    `${dateValue}T12:00:00`,
  );

  return new Intl.DateTimeFormat(
    "es-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  ).format(date);
}

export function getPreviousSundayDates(
  endDate: string,
  numberOfWeeks: number,
): string[] {
  if (!endDate || numberOfWeeks <= 0) {
    return [];
  }

  const selectedDate = new Date(
    `${endDate}T12:00:00`,
  );

  if (
    Number.isNaN(selectedDate.getTime())
  ) {
    return [];
  }

  selectedDate.setDate(
    selectedDate.getDate() -
      selectedDate.getDay(),
  );

  const dates: string[] = [];

  for (
    let index = 0;
    index < numberOfWeeks;
    index++
  ) {
    const sunday = new Date(
      selectedDate,
    );

    sunday.setDate(
      selectedDate.getDate() -
        index * 7,
    );

    dates.push(
      formatLocalDate(sunday),
    );
  }

  return dates;
}

export function getPreviousOrSameSunday(
  dateValue: string,
): string {
  if (!dateValue) return "";

  const date = new Date(
    `${dateValue}T12:00:00`,
  );

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  date.setDate(
    date.getDate() - date.getDay(),
  );

  return formatLocalDate(date);
}

export function isSunday(
  dateValue: string,
): boolean {
  if (!dateValue) return false;

  const date = new Date(
    `${dateValue}T12:00:00`,
  );

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.getDay() === 0;
}