import { ResponseList } from "@/types";
import { restClient } from "../apis/rest-client";
import { ReportEntity } from "./reports-entity";
import { ExportPeriodReportDto, RangeReport, RealtimeReport } from "./reports-types";

export async function exportPeriodReport(dto: ExportPeriodReportDto) {
  return restClient.post<ResponseList<ReportEntity<RangeReport>>>("/reports/period", dto);
}

export async function getRealtimeReport(forceUpdate = false) {
  return restClient.get<ReportEntity<RealtimeReport>>("/reports/realtime", {
    params: { update: forceUpdate },
  });
}
