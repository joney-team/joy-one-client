import { Period } from "@/types";
import { renderDate, t } from "@/modules/lang/lang-service";

export class DateTimeUtils {
  static addDays(now: Date, days: number): Date {
    const newDate = new Date(now.valueOf());
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  }

  static timeToSeconds(time: any = Date.now()): number {
    time = new Date(time)
    return +Math.floor(time.getTime() / 1000).toFixed(0)
  }

  static secondsToTime(time?: any) {
    if (!time) return
    try {
      return new Date(time * 1000)
    } catch (error) {
      return
    }
  }

  static formatToShow(date: any, isShowTime = true, locale?: string) {
    if (!date) return '--'
    const time = new Date(date)
    let hours = time.getHours()
    let min: any = time.getMinutes()
    min = min < 10 ? `0${min}` : min
    if (!isShowTime) return `${time.toLocaleDateString(locale)}`
    return `${hours}:${min} ${time.toLocaleDateString(locale)}`
  }

  static countdown(endTime: any, startTime = Date.now()) {
    if (
      !endTime ||
      new Date(endTime).getTime() <= new Date(startTime).getTime()
    )
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
      }
    const distance = Math.abs(new Date(endTime).getTime() - startTime)
    const days = Math.floor(distance / (1000 * 60 * 60 * 24))
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    )
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((distance % (1000 * 60)) / 1000)
    return { days, hours, minutes, seconds, isExpired: false }
  }

  static getRangeHour(
    currentHour: number,
    start:
      | 0
      | 1
      | 2
      | 3
      | 4
      | 5
      | 6
      | 7
      | 8
      | 9
      | 10
      | 11
      | 12
      | 13
      | 14
      | 15
      | 16
      | 17
      | 18
      | 19
      | 20
      | 21
      | 22
      | 23,
    rangeOf: 4 | 8 | 12
  ): number {
    const rangeLength = 24 / rangeOf
    const calculateHour = (v: number) => (v > 23 ? v - 23 : v)

    for (let i = 1; i <= rangeLength; i++) {
      let currentValue = calculateHour(start + (i - 1) * rangeOf)
      let nextValue = calculateHour(start + i * rangeOf)
      if (currentValue <= currentHour && nextValue > currentHour) return i
    }

    console.warn('Cannot find any range of hours')
    return 1
  }

  static getMonday(date: any) {
    const d = new Date(date)
    var day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -6 : 1) // adjust when day is sunday
    return new Date(d.setDate(diff))
  }

  static getStartEndOfDay(time: any) {
    const inputTime = new Date(time)
    return {
      start: new Date(inputTime.setHours(0, 0, 0, 0)).getTime(),
      end: new Date(inputTime.setHours(23, 59, 59, 999)).getTime(),
    }
  }

  static getStartEndOfWeek(time: any) {
    const firstDay = this.getMonday(time)
    const lastDay = new Date(new Date(firstDay).getTime() + 6 * 24 * 60 * 60 * 1000)

    return {
      start: this.getStartEndOfDay(firstDay).start,
      end: this.getStartEndOfDay(lastDay).end,
    }
  }

  static getStartEndOfMonth(time: any) {
    const date = new Date(time)
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)

    return {
      start: this.getStartEndOfDay(firstDay).start,
      end: this.getStartEndOfDay(lastDay).end,
    }
  }

  static getStartEndOfYear(time: any) {
    const date = new Date(time)
    const firstDay = new Date(date.getFullYear(), 0, 1)
    const lastDay = new Date(date.getFullYear(), 11, 31)
    return {
      start: this.getStartEndOfDay(firstDay).start,
      end: this.getStartEndOfDay(lastDay).end,
    }
  }

  static getStartEndOf(time: any, type: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR') {
    if (type === 'DAY') return this.getStartEndOfDay(time)
    if (type === 'WEEK') return this.getStartEndOfWeek(time)
    if (type === 'MONTH') return this.getStartEndOfMonth(time)
    if (type === 'YEAR') return this.getStartEndOfYear(time)
    throw Error('Type is not supported')
  }

  static addLeadingZero(str: number) {
    return ('0' + str).slice(-2)
  }

  static isToday(date: any, now?: any) {
    const _date = new Date(date);
    const today = now ? new Date(now) : new Date();
    return _date.getDate() === today.getDate() && _date.getMonth() === today.getMonth() && _date.getFullYear() === today.getFullYear();
  }

  static isTomorrow(date: any, now?: any) {
    const _date = new Date(date);
    const today = now ? new Date(now) : new Date();
    return _date.getDate() === today.getDate() + 1 && _date.getMonth() === today.getMonth() && _date.getFullYear() === today.getFullYear();
  }

  static isMatchDay(date: any, _compareDate?: any) {
    const _date = new Date(date);
    const compareDate = _compareDate ? new Date(_compareDate) : new Date();
    return _date.getDate() === compareDate.getDate()
      && _date.getMonth() === compareDate.getMonth()
      && _date.getFullYear() === compareDate.getFullYear();
  }

  static isMatchWeekDay(date: any, _compareDate?: any) {
    const _date = new Date(date);
    const compareDate = _compareDate ? new Date(_compareDate) : new Date();
    return _date.getDay() === compareDate.getDay();
  }

  static getRange(date: any, period: Period) {
    if (period === Period.YEAR) return this.getStartEndOfYear(date);
    if (period === Period.MONTH) return this.getStartEndOfMonth(date);
    if (period === Period.WEEK) return this.getStartEndOfWeek(date);
    return this.getStartEndOfDay(date);
  }

  static renderDate(date: any, period: Period, defaultValue?: string) {
    const _date = date ? new Date(date) : new Date();

    if (!date) return defaultValue || t('time')

    if (period === Period.MONTH) {
      return _date.getMonth() + 1 + '/' + _date.getFullYear();
    }

    if (period === Period.WEEK) {
      const range = DateTimeUtils.getStartEndOfWeek(_date);
      return `${renderDate(range.start)} - ${renderDate(range.end)}`;
    }

    if (period === Period.YEAR) {
      const range = DateTimeUtils.getStartEndOfYear(_date);
      return `${new Date(range.start).getFullYear()}`;
    }

    if (DateTimeUtils.isToday(_date)) return t('today');
    return renderDate(_date);
  }

  static toHHMMSS(input: number) {
    let secs = typeof input === "number" ? input : 0;

    const secNum = parseInt(secs.toString(), 10);
    const hours = Math.floor(secNum / 3600);
    const minutes = Math.floor(secNum / 60) % 60;
    const seconds = secNum % 60;

    return [hours, minutes, seconds]
      .map((val) => val.toString().padStart(2, "0"))
      .join(":")
  };

  static toHHMM(input: number) {
    let secs = typeof input === "number" ? input : 0;

    const secNum = parseInt(secs.toString(), 10);
    const hours = Math.floor(secNum / 3600);
    const minutes = Math.floor(secNum / 60) % 60;

    return [hours, minutes]
      .map((val) => val.toString().padStart(2, "0"))
      .join(":")
  }

  static calculateWorkHours(seconds: number): number {
    const hours = Math.floor(seconds / 3600); // Tính số giờ
    const remainingSeconds = seconds % 3600;
    const minutes = remainingSeconds / 60; // Tính số phút còn lại

    // Tính tổng số giờ công dưới dạng số thập phân
    const workHours = hours + (minutes / 60);
    return parseFloat(workHours.toFixed(2)); // Làm tròn tới 2 chữ số thập phân
  }

  static getDeviation(fixedTime: number, time: number) {
    if (fixedTime === time) return 0;
    const between = Math.abs(fixedTime - time);
    if (fixedTime > time) return -between;
    return between;
  }

  static getIntersect(fixedTime: { start: number, end: number }, time: { start: number, end: number }): ({
    start: number,
    end: number,
    duration: number,
    startDeviation: number,
    endDeviation: number,
  } | null) {
    if (fixedTime.start >= time.end || fixedTime.end <= time.start) return null;

    const start = Math.max(fixedTime.start, time.start);
    const end = Math.min(fixedTime.end, time.end);
    const duration = end - start;

    const startDeviation = this.getDeviation(fixedTime.start, time.start);
    const endDeviation = this.getDeviation(fixedTime.end, time.end);

    return {
      start,
      end,
      duration,
      startDeviation,
      endDeviation,
    }
  }

  static rangeSlice(time: { start: number, end: number }, slice: { start: number, end: number }) {
    const remainTimes = [] as { start: number, end: number }[];

    if (time.start < slice.start) {
      remainTimes.push({ start: time.start, end: slice.start });
    }

    if (time.end > slice.end) {
      remainTimes.push({ start: slice.end, end: time.end });
    }

    return remainTimes;
  }
}

export const isSeconds = (value: any) => {
  return typeof value === 'number' && (+value).toString().length <= 10;
}

export const parseToTime = (value: any) => {
  if (!value) return null;
  if (isSeconds(value)) return new Date(value * 1000);
  return new Date(value);
}

export const timeInputValue = (value: any) => {
  if (!value) return '';
  let time = isSeconds(value) ? new Date(value * 1000) : new Date(value);
  return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
}

export const setHoursMinutes = (time: number, hours: number | string, minutes: number | string) => {
  const _time = isSeconds(time) ? new Date(time * 1000) : new Date(time);
  _time.setHours(+hours);
  _time.setMinutes(+minutes);
  return DateTimeUtils.timeToSeconds(_time);
}

export function parseTimeInput(input: string): { hours: number; minutes: number, seconds: number } {
  try {
    const hourPattern = /(\d+)\s*h/;
    const minutePattern = /(\d+)\s*m/;

    const hourMatch = input.match(hourPattern);
    const minuteMatch = input.match(minutePattern);

    const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
    const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;

    const seconds = +hours * 3600 + +minutes * 60;

    return { hours, minutes, seconds };
  } catch (error) {
    return { hours: 0, minutes: 0, seconds: 0 };
  }
}

export function decodeTimeInput(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  let input: string[] = [];

  if (hours) input.push(`${hours}h`);
  if (minutes) input.push(`${minutes}m`);

  return { hours, minutes, input: input.join(' ') };
}

export function findNearestTimeSlot(now = new Date()) {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Các mốc thời gian trong ngày (15 phút mỗi mốc)
  const timeSlots = [];
  for (let i = 0; i < 24 * 60; i += 15) {
    timeSlots.push(i); // Lưu trữ số phút từ đầu ngày
  }

  // Tìm mốc thời gian gần nhất
  let nearestSlot = timeSlots[0];
  let minDifference = Math.abs(currentMinutes - timeSlots[0]);

  for (let i = 1; i < timeSlots.length; i++) {
    const difference = Math.abs(currentMinutes - timeSlots[i]);
    if (difference < minDifference) {
      nearestSlot = timeSlots[i];
      minDifference = difference;
    }
  }

  // Chuyển đổi mốc thời gian từ phút thành định dạng hh:mm
  const hours = Math.floor(nearestSlot / 60);
  const minutes = nearestSlot % 60;
  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  return formattedTime;
}

export function forceDate(data?: any) {
  if (!data) return undefined;
  if (isSeconds(data)) return new Date(data * 1000);
  return new Date(data);
}