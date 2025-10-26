export type RawDate = Date | string | number;

export class DateTime {
  static isValid(raw: RawDate) {
    return this.normalizeDate(raw) instanceof Date && !isNaN(this.normalizeDate(raw).getTime());
  }

  static normalizeDate(raw: RawDate) {
    const isSeconds = typeof raw === "number" && (+raw).toString().length === 10;
    return isSeconds ? new Date(raw * 1000) : new Date(raw);
  }

  static format(date: RawDate, format?: Intl.DateTimeFormatOptions & { locale?: string }) {
    return this.normalizeDate(date).toLocaleString(format?.locale, format);
  }

  static formatRelative(date: RawDate, locale?: string) {
    const now = new Date();
    const diff = (this.normalizeDate(date).getTime() - now.getTime()) / 1000;

    const rtf = new Intl.RelativeTimeFormat(locale, {
      numeric: "auto",
      style: "short",
    });

    if (Math.abs(diff) < 60) {
      return rtf.format(Math.round(diff), "second");
    } else if (Math.abs(diff) < 3600) {
      return rtf.format(Math.round(diff / 60), "minute");
    } else if (Math.abs(diff) < 86400) {
      return rtf.format(Math.round(diff / 3600), "hour");
    } else {
      return rtf.format(Math.round(diff / 86400), "day");
    }
  }

  static getMonday(date: RawDate) {
    const d = this.normalizeDate(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return this.normalizeDate(d.setDate(diff));
  }

  static getStartEndOfDay(time: RawDate) {
    const inputTime = this.normalizeDate(time);
    return {
      start: this.normalizeDate(inputTime.setHours(0, 0, 0, 0)).getTime(),
      end: this.normalizeDate(inputTime.setHours(23, 59, 59, 999)).getTime(),
    };
  }

  static getStartEndOfWeek(time: RawDate) {
    const firstDay = this.getMonday(time);
    const lastDay = this.normalizeDate(
      this.normalizeDate(firstDay).getTime() + 6 * 24 * 60 * 60 * 1000
    );

    return {
      start: this.getStartEndOfDay(firstDay).start,
      end: this.getStartEndOfDay(lastDay).end,
    };
  }

  static getStartEndOfMonth(time: RawDate) {
    const date = this.normalizeDate(time);
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    return {
      start: this.getStartEndOfDay(firstDay).start,
      end: this.getStartEndOfDay(lastDay).end,
    };
  }

  static getStartEndOfYear(time: RawDate) {
    const date = this.normalizeDate(time);
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const lastDay = new Date(date.getFullYear(), 11, 31);
    return {
      start: this.getStartEndOfDay(firstDay).start,
      end: this.getStartEndOfDay(lastDay).end,
    };
  }

  static getStartEndOf(time: RawDate, type: "DAY" | "WEEK" | "MONTH" | "YEAR") {
    if (type === "DAY") return this.getStartEndOfDay(time);
    if (type === "WEEK") return this.getStartEndOfWeek(time);
    if (type === "MONTH") return this.getStartEndOfMonth(time);
    if (type === "YEAR") return this.getStartEndOfYear(time);
    throw Error("Type is not supported");
  }

  static toSeconds(date: RawDate) {
    return +Math.floor(this.normalizeDate(date).getTime() / 1000).toFixed(0);
  }

  static isMatchDay(date: RawDate, compareDate: RawDate) {
    return (
      this.normalizeDate(date).getDate() === this.normalizeDate(compareDate).getDate() &&
      this.normalizeDate(date).getMonth() === this.normalizeDate(compareDate).getMonth() &&
      this.normalizeDate(date).getFullYear() === this.normalizeDate(compareDate).getFullYear()
    );
  }
}
