import { api } from "../apis";
import { TimeZone } from "./times-types";

export async function getTimeZones() {
  return api.get<TimeZone[]>(`/times/timezones`)
}