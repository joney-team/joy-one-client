import { MainRequest } from "../requests/main.request";
import { TimeZone } from "./times-types";

export async function getTimeZones() {
  return MainRequest.get<TimeZone[]>(`/times/timezones`)
}