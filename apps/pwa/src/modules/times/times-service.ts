import { apiClient } from "../apis";
import { TimeZone } from "./times-types";

export async function getTimeZones() {
  return apiClient.get<TimeZone[]>(`/times/timezones`);
}
