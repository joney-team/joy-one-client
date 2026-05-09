import { Period } from '../app.types';
import { DateTime } from '../utils/date-time';
import { ReportTimeSeriesInput } from './reports.types';

export function getReportTimeRange(
  time = DateTime.getNowInSeconds(),
  period = Period.DATE,
): ReportTimeSeriesInput {
  const { start, end } = DateTime.getRange(time, period);

  return {
    fromTime: DateTime.toSeconds(start),
    toTime: DateTime.toSeconds(end),
  };
}
