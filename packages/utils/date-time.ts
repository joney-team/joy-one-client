import dayjs from "dayjs";

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

  static formatDate(date: RawDate, format?: Intl.DateTimeFormatOptions & { locale?: string }) {
    return this.normalizeDate(date).toLocaleDateString(format?.locale, format);
  }

  static formatTime(date: RawDate, format?: Intl.DateTimeFormatOptions & { locale?: string }) {
    return this.normalizeDate(date).toLocaleTimeString(format?.locale, format);
  }

  static fromNow(date: RawDate) {
    return dayjs(this.normalizeDate(date)).fromNow();
  }
}
