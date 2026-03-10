import { ResponseList } from "@/types";
import { apiClient } from "../apis";
import { ReportEntity } from "./reports-entity";
import { ExportPeriodReportDto, RangeReport, RealtimeReport } from "./reports-types";

export async function exportPeriodReport(dto: ExportPeriodReportDto) {
  return apiClient.post<ResponseList<ReportEntity<RangeReport>>>("/reports/period", dto);
}

export async function getRealtimeReport(forceUpdate = false) {
  return apiClient.get<ReportEntity<RealtimeReport>>("/reports/realtime", {
    params: { update: forceUpdate },
  });
}
