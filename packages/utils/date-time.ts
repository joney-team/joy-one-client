export type RawDate = Date | string | number;

export class DateTime {
  static isValid(raw: RawDate): boolean {
    return this.normalizeDate(raw) instanceof Date && !isNaN(this.normalizeDate(raw).getTime());
  }

  static normalizeDate(raw: RawDate): Date {
    const isSeconds =
      (typeof raw === "number" || typeof raw === "string") && (+raw).toString().length === 10;
    return isSeconds ? new Date(+raw * 1000) : new Date(raw);
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

  static rangeDay(time: RawDate) {
    const inputTime = this.normalizeDate(time);
    return {
      start: this.normalizeDate(inputTime.setHours(0, 0, 0, 0)).getTime(),
      end: this.normalizeDate(inputTime.setHours(23, 59, 59, 999)).getTime(),
    };
  }

  static rangeWeek(time: RawDate) {
    const firstDay = this.getMonday(time);
    const lastDay = this.normalizeDate(
      this.normalizeDate(firstDay).getTime() + 6 * 24 * 60 * 60 * 1000
    );

    return {
      start: this.rangeDay(firstDay).start,
      end: this.rangeDay(lastDay).end,
    };
  }

  static rangeMonth(time: RawDate) {
    const date = this.normalizeDate(time);
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    return {
      start: this.rangeDay(firstDay).start,
      end: this.rangeDay(lastDay).end,
    };
  }

  static rangeYear(time: RawDate) {
    const date = this.normalizeDate(time);
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const lastDay = new Date(date.getFullYear(), 11, 31);
    return {
      start: this.rangeDay(firstDay).start,
      end: this.rangeDay(lastDay).end,
    };
  }

  static getRange(time: RawDate, type: "DAY" | "WEEK" | "MONTH" | "YEAR") {
    const _type = type.toUpperCase();
    if (_type === "DAY") return this.rangeDay(time);
    if (_type === "WEEK") return this.rangeWeek(time);
    if (_type === "MONTH") return this.rangeMonth(time);
    if (_type === "YEAR") return this.rangeYear(time);
    throw Error(`Type ${_type} is not supported`);
  }

  static toSeconds(date: RawDate) {
    return +Math.floor(this.normalizeDate(date).getTime() / 1000).toFixed(0);
  }

  static isSameDay(date: RawDate, compareDate: RawDate) {
    return (
      this.normalizeDate(date).getDate() === this.normalizeDate(compareDate).getDate() &&
      this.normalizeDate(date).getMonth() === this.normalizeDate(compareDate).getMonth() &&
      this.normalizeDate(date).getFullYear() === this.normalizeDate(compareDate).getFullYear()
    );
  }

  static add(date: RawDate, type: "DAY" | "WEEK" | "MONTH" | "YEAR", amount: number) {
    const _date = this.normalizeDate(date);
    const _type = type.toUpperCase();
    if (_type === "DAY")
      return this.normalizeDate(_date).setDate(this.normalizeDate(_date).getDate() + amount);
    if (_type === "WEEK")
      return this.normalizeDate(_date).setDate(this.normalizeDate(_date).getDate() + amount * 7);
    if (_type === "MONTH")
      return this.normalizeDate(_date).setMonth(this.normalizeDate(_date).getMonth() + amount);
    if (_type === "YEAR")
      return this.normalizeDate(_date).setFullYear(
        this.normalizeDate(_date).getFullYear() + amount
      );
    throw Error(`Type ${_type} is not supported`);
  }

  static subtractDays(date: RawDate, amount: number) {
    return this.normalizeDate(date).setDate(this.normalizeDate(date).getDate() - amount);
  }

  static subtractWeeks(date: RawDate, amount: number) {
    return this.normalizeDate(date).setDate(this.normalizeDate(date).getDate() - amount * 7);
  }

  static subtractMonths(date: RawDate, amount: number) {
    return this.normalizeDate(date).setMonth(this.normalizeDate(date).getMonth() - amount);
  }

  static subtractYears(date: RawDate, amount: number) {
    return this.normalizeDate(date).setFullYear(this.normalizeDate(date).getFullYear() - amount);
  }

  static subtract(date: RawDate, type: "DAY" | "WEEK" | "MONTH" | "YEAR", amount: number) {
    const _date = this.normalizeDate(date);
    const _type = type.toUpperCase();
    if (_type === "DAY") return this.subtractDays(_date, amount);
    if (_type === "WEEK") return this.subtractWeeks(_date, amount);
    if (_type === "MONTH") return this.subtractMonths(_date, amount);
    if (_type === "YEAR") return this.subtractYears(_date, amount);
    throw Error(`Type ${_type} is not supported`);
  }
}
