import { timeZones } from './times.assets';
import { TimeZone } from './times.types';

export const getTimeZone = (input: string | null): TimeZone | null => {
  if (!input) return null;

  const timezoneById = timeZones.find((tz) => tz.id === input);
  if (timezoneById) return timezoneById;

  const timezoneByValue = timeZones.find((tz) => tz.value === input);
  if (timezoneByValue) return timezoneByValue;

  const timezoneByUtc = timeZones.find((tz) => tz.utc.includes(input));
  if (timezoneByUtc) return timezoneByUtc;

  return null;
};
