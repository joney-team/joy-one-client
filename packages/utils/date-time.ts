export function timeToSeconds(time: any = Date.now()): number {
  time = new Date(time)
  return +Math.floor(time.getTime() / 1000).toFixed(0)
}

export function secondsToTime(time?: any) {
  if (!time) return
  try {
    return new Date(time * 1000)
  } catch (error) {
    return
  }
}

export const isSeconds = (value: any) => {
  return typeof value === 'number' && (+value).toString().length <= 10;
}

export function forceDate(data?: any) {
  if (!data) return undefined;
  if (isSeconds(data)) return new Date(data * 1000);
  return new Date(data);
}

export function toHHMMSS(input: number) {
  let secs = typeof input === "number" ? input : 0;

  const secNum = parseInt(secs.toString(), 10);
  const hours = Math.floor(secNum / 3600);
  const minutes = Math.floor(secNum / 60) % 60;
  const seconds = secNum % 60;

  return [hours, minutes, seconds]
    .map((val) => val.toString().padStart(2, "0"))
    .join(":")
}

export function toHHMM(input: number) {
  let secs = typeof input === "number" ? input : 0;

  const secNum = parseInt(secs.toString(), 10);
  const hours = Math.floor(secNum / 3600);
  const minutes = Math.floor(secNum / 60) % 60;

  return [hours, minutes]
    .map((val) => val.toString().padStart(2, "0"))
    .join(":")
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

export const timeInputValue = (value: any) => {
  if (!value) return '';
  let time = isSeconds(value) ? new Date(value * 1000) : new Date(value);
  return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
}

export const setHoursMinutes = (time: number, hours: number | string, minutes: number | string) => {
  const _time = isSeconds(time) ? new Date(time * 1000) : new Date(time);
  _time.setHours(+hours);
  _time.setMinutes(+minutes);
  return timeToSeconds(_time);
}

export const parseToTime = (value: any) => {
  if (!value) return null;
  if (isSeconds(value)) return new Date(value * 1000);
  return new Date(value);
}