export type RawDate = Date | string | number;
export type DateTimeUnit = "day" | "week" | "month" | "year" | "hour" | "minute" | "second";

export class DateTime {
  static isValid(raw: RawDate): boolean {
    return this.normalizeDate(raw) instanceof Date && !isNaN(this.normalizeDate(raw).getTime());
  }

  static isSeconds(
    value: number,
    options?: {
      minYear?: number;
      maxYear?: number;
    }
  ): boolean {
    // Check if it's a valid number
    if (!Number.isFinite(value) || Number.isNaN(value)) {
      return false;
    }

    // Default range: 1900 to 2200
    const minYear = options?.minYear ?? 1900;
    const maxYear = options?.maxYear ?? 2200;

    const minTimestamp = Math.floor(new Date(minYear, 0, 1).getTime() / 1000);
    const maxTimestamp = Math.floor(new Date(maxYear, 11, 31, 23, 59, 59).getTime() / 1000);

    // Check if value is within reasonable timestamp range
    return value >= minTimestamp && value <= maxTimestamp;
  }

  static normalizeDate(raw: RawDate): Date {
    if (typeof raw === "number" || (typeof raw === "string" && !isNaN(+raw))) {
      return this.isSeconds(+raw) ? new Date(+raw * 1000) : new Date(+raw);
    }

    return new Date(raw);
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
    const normalizedDate = this.normalizeDate(date);
    const safeUnit = unit.toLowerCase();

    if (safeUnit === "day") {
      return new Date(normalizedDate.setDate(normalizedDate.getDate() + amount));
    }

    if (safeUnit === "week") {
      return new Date(normalizedDate.setDate(normalizedDate.getDate() + amount * 7));
    }

    if (safeUnit === "month") {
      return new Date(normalizedDate.setMonth(normalizedDate.getMonth() + amount));
    }

    if (safeUnit === "year") {
      return new Date(normalizedDate.setFullYear(normalizedDate.getFullYear() + amount));
    }

    if (safeUnit === "hour") {
      return new Date(normalizedDate.getTime() + amount * 60 * 60 * 1000);
    }

    if (safeUnit === "minute") {
      return new Date(normalizedDate.getTime() + amount * 60 * 1000);
    }

    if (safeUnit === "second") {
      return new Date(normalizedDate.getTime() + amount * 1000);
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

  static diff(date: RawDate, compareDate: RawDate, unit: DateTimeUnit) {
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

  static toHHMMSS(input: number) {
    let secs = typeof input === "number" ? input : 0;

    const secNum = parseInt(secs.toString(), 10);
    const hours = Math.floor(secNum / 3600);
    const minutes = Math.floor(secNum / 60) % 60;
    const seconds = secNum % 60;

    return [hours, minutes, seconds].map((val) => val.toString().padStart(2, "0")).join(":");
  }

  static toHHMM(input: number) {
    let secs = typeof input === "number" ? input : 0;

    const secNum = parseInt(secs.toString(), 10);
    const hours = Math.floor(secNum / 3600);
    const minutes = Math.floor(secNum / 60) % 60;

    return [hours, minutes].map((val) => val.toString().padStart(2, "0")).join(":");
  }

  static countHours(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const remainingSeconds = seconds % 3600;
    const minutes = remainingSeconds / 60;

    const workHours = hours + minutes / 60;
    return parseFloat(workHours.toFixed(2));
  }

  static toTimeInputValue(date: RawDate | null | undefined) {
    if (!date) return "";
    const _date = this.normalizeDate(date);
    return `${_date.getHours().toString().padStart(2, "0")}:${_date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  }

  static parseTimeInputValue(value: string): { hours: number; minutes: number; seconds: number } {
    try {
      const hourPattern = /(\d+)\s*h/;
      const minutePattern = /(\d+)\s*m/;

      const hourMatch = value.match(hourPattern);
      const minuteMatch = value.match(minutePattern);

      const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
      const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;

      const seconds = +hours * 3600 + +minutes * 60;

      return { hours, minutes, seconds };
    } catch (error) {
      return { hours: 0, minutes: 0, seconds: 0 };
    }
  }

  static getDateFormatString(locale = "en") {
    // Create a date formatter for the locale
    const formatter = new Intl.DateTimeFormat(locale);

    // Get the format parts
    const parts = formatter.formatToParts(new Date(2023, 11, 31)); // Dec 31, 2023

    // Map each part to its format token
    const formatMap: Record<string, string> = {
      year: "YYYY",
      month: "MM",
      day: "DD",
    };

    // Build the format string
    let format = "";
    for (const part of parts) {
      if (part.type === "literal") {
        format += part.value;
      } else if (formatMap[part.type]) {
        format += formatMap[part.type];
      }
    }

    return format;
  }

  static getSeparators(locale = "en") {
    // Use a number with both thousand and decimal parts
    const numberWithSeparators = 1234.5;

    // Format the number according to the locale
    const formatted = new Intl.NumberFormat(locale).format(numberWithSeparators);

    // Extract separators by finding non-digit characters
    const parts = formatted.match(/\D/g) || [];

    // The first non-digit is usually the thousand separator
    // The last non-digit is usually the decimal separator
    const thousandSeparator = parts[0] || ",";
    const decimalSeparator = parts[parts.length - 1] || ".";

    return {
      decimalSeparator,
      thousandSeparator,
    };
  }

  static isBefore(date: RawDate, compareDate: RawDate) {
    const _date = this.normalizeDate(date);
    const _compareDate = this.normalizeDate(compareDate);
    return _date.getTime() < _compareDate.getTime();
  }

  static isAfter(date: RawDate, compareDate: RawDate) {
    const _date = this.normalizeDate(date);
    const _compareDate = this.normalizeDate(compareDate);
    return _date.getTime() > _compareDate.getTime();
  }

  static isBetween(date: RawDate, startDate: RawDate, endDate: RawDate) {
    const _date = this.normalizeDate(date);
    const _startDate = this.normalizeDate(startDate);
    const _endDate = this.normalizeDate(endDate);
    return _date.getTime() >= _startDate.getTime() && _date.getTime() <= _endDate.getTime();
  }
}
