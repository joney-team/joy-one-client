import { ResponseList } from "@/types";
import { MainRequest } from "../requests/main.request";
import { ExportPeriodReportDto, RangeReport, RealtimeReport } from "./reports-types";
import { ReportEntity } from "./reports-entity";

export async function exportPeriodReport(dto: ExportPeriodReportDto) {
  return MainRequest.post<ResponseList<ReportEntity<RangeReport>>>('/reports/period', dto);
}

export async function getRealtimeReport(forceUpdate = false) {
  return MainRequest.get<ReportEntity<RealtimeReport>>('/reports/realtime', { update: forceUpdate });
}