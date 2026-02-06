export function renderWeekdayFromISO(
  isoDay: number,
  locale?: string,
  format: "long" | "short" | "narrow" = "long"
) {
  if (isoDay < 1 || isoDay > 7) {
    throw new Error("isoDay must be between 1 and 7");
  }

  const baseMonday = new Date(2024, 0, 1);
  const date = new Date(baseMonday);
  date.setDate(baseMonday.getDate() + (isoDay - 1));

  return new Intl.DateTimeFormat(locale, {
    weekday: format,
  }).format(date);
}
