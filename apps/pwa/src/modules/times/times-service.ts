import { restClient } from "../apis/rest-client";
import { TimeZone } from "./times-types";

export async function getTimeZones() {
  return restClient.get<TimeZone[]>(`/times/timezones`);
}
