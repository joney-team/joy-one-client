export type RawDate = Date | string | number;
export type DateTimeUnit = "day" | "week" | "month" | "year";
export type DateTimeDiffUnit = DateTimeUnit | "second" | "minute" | "hour";

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

  static getMonday(date: RawDate): Date {
    const d = this.normalizeDate(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  }

  static getRange(time: RawDate, unit: DateTimeUnit): { start: Date; end: Date } {
    const inputTime = this.normalizeDate(time);
    const safeUnit = unit.toLowerCase();

    const rangeDay = (date: Date) => ({
      start: this.normalizeDate(new Date(date).setHours(0, 0, 0, 0)),
      end: this.normalizeDate(new Date(date).setHours(23, 59, 59, 999)),
    });

    if (safeUnit === "day") {
      return rangeDay(inputTime);
    }

    if (safeUnit === "week") {
      const firstDay = this.getMonday(time);
      const lastDay = new Date(firstDay.getTime() + 6 * 24 * 60 * 60 * 1000);

      return {
        start: rangeDay(firstDay).start,
        end: rangeDay(lastDay).end,
      };
    }

    if (safeUnit === "month") {
      const date = this.normalizeDate(time);
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      return {
        start: rangeDay(firstDay).start,
        end: rangeDay(lastDay).end,
      };
    }

    if (safeUnit === "year") {
      const date = this.normalizeDate(time);
      const firstDay = new Date(date.getFullYear(), 0, 1);
      const lastDay = new Date(date.getFullYear(), 11, 31);

      return {
        start: rangeDay(firstDay).start,
        end: rangeDay(lastDay).end,
      };
    }

    throw Error(`Unit ${unit} is not supported`);
  }

  static toSeconds(date: RawDate) {
    return +Math.floor(this.normalizeDate(date).getTime() / 1000).toFixed(0);
  }

  static isSame(date: RawDate, compareDate: RawDate, unit: DateTimeUnit) {
    const _date = this.normalizeDate(date);
    const _compareDate = this.normalizeDate(compareDate);
    const safeUnit = unit.toLowerCase();

    if (safeUnit === "day") {
      return (
        _date.getDate() === _compareDate.getDate() &&
        _date.getMonth() === _compareDate.getMonth() &&
        _date.getFullYear() === _compareDate.getFullYear()
      );
    }

    if (safeUnit === "week") {
      return (
        _date.getDay() === _compareDate.getDay() &&
        _date.getMonth() === _compareDate.getMonth() &&
        _date.getFullYear() === _compareDate.getFullYear()
      );
    }

    if (safeUnit === "month") {
      return (
        _date.getMonth() === _compareDate.getMonth() &&
        _date.getFullYear() === _compareDate.getFullYear()
      );
    }

    if (safeUnit === "year") {
      return _date.getFullYear() === _compareDate.getFullYear();
    }

    throw Error(`Unit ${unit} is not supported`);
  }

  static add(date: RawDate, unit: DateTimeUnit, amount: number) {
    const _date = this.normalizeDate(date);
    const safeUnit = unit.toLowerCase();

    if (safeUnit === "day") {
      return this.normalizeDate(_date).setDate(this.normalizeDate(_date).getDate() + amount);
    }

    if (safeUnit === "week") {
      return this.normalizeDate(_date).setDate(this.normalizeDate(_date).getDate() + amount * 7);
    }

    if (safeUnit === "month") {
      return this.normalizeDate(_date).setMonth(this.normalizeDate(_date).getMonth() + amount);
    }

    if (safeUnit === "year") {
      return this.normalizeDate(_date).setFullYear(
        this.normalizeDate(_date).getFullYear() + amount
      );
    }

    throw Error(`Unit ${unit} is not supported`);
  }

  static subtract(date: RawDate, unit: DateTimeUnit, amount: number): Date {
    const normalizedDate = this.normalizeDate(date);
    const safeUnit = unit.toLowerCase();

    if (safeUnit === "day") {
      return new Date(normalizedDate.setDate(normalizedDate.getDate() - amount));
    }

    if (safeUnit === "week") {
      return new Date(normalizedDate.setDate(normalizedDate.getDate() - amount * 7));
    }

    if (safeUnit === "month") {
      return new Date(normalizedDate.setMonth(normalizedDate.getMonth() - amount));
    }

    if (safeUnit === "year") {
      return new Date(normalizedDate.setFullYear(normalizedDate.getFullYear() - amount));
    }

    throw Error(`Unit ${unit} is not supported`);
  }

  static countdown(endTime: RawDate, startTime = Date.now()) {
    const _endTime = this.normalizeDate(endTime);
    const _startTime = this.normalizeDate(startTime);

    if (!_endTime || _endTime.getTime() <= _startTime.getTime()) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
      };
    }

    const distance = Math.abs(_endTime.getTime() - _startTime.getTime());
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds, isExpired: false };
  }

  static diff(date: RawDate, compareDate: RawDate, unit: DateTimeDiffUnit) {
    const _date = this.normalizeDate(date);
    const _compareDate = this.normalizeDate(compareDate);
    const safeUnit = unit.toLowerCase();

    const timeDiff = Math.abs(_date.getTime() - _compareDate.getTime());

    if (safeUnit === "second") {
      return Math.floor(timeDiff / 1000);
    }

    if (safeUnit === "minute") {
      return Math.floor(timeDiff / (1000 * 60));
    }

    if (safeUnit === "hour") {
      return Math.floor(timeDiff / (1000 * 60 * 60));
    }

    if (safeUnit === "day") {
      // Reset time components to get accurate day difference
      const date1 = new Date(_date.getFullYear(), _date.getMonth(), _date.getDate());
      const date2 = new Date(
        _compareDate.getFullYear(),
        _compareDate.getMonth(),
        _compareDate.getDate()
      );
      return Math.floor(Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
    }

    if (safeUnit === "week") {
      // Get the start of the week for both dates
      const date1 = this.getMonday(
        new Date(_date.getFullYear(), _date.getMonth(), _date.getDate())
      );
      const date2 = this.getMonday(
        new Date(_compareDate.getFullYear(), _compareDate.getMonth(), _compareDate.getDate())
      );
      return Math.floor(Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24 * 7));
    }

    if (safeUnit === "month") {
      const yearDiff = _date.getFullYear() - _compareDate.getFullYear();
      const monthDiff = _date.getMonth() - _compareDate.getMonth();
      return Math.abs(yearDiff * 12 + monthDiff);
    }

    if (safeUnit === "year") {
      return Math.abs(_date.getFullYear() - _compareDate.getFullYear());
    }

    throw Error(`Unit ${unit} is not supported`);
  }
}
