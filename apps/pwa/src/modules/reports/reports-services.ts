import { ResponseList } from "@/types";
import { api } from "../apis";
import { ReportEntity } from "./reports-entity";
import { ExportPeriodReportDto, RangeReport, RealtimeReport } from "./reports-types";

export async function exportPeriodReport(dto: ExportPeriodReportDto) {
  return api.post<ResponseList<ReportEntity<RangeReport>>>('/reports/period', dto);
}

export async function getRealtimeReport(forceUpdate = false) {
  return api.get<ReportEntity<RealtimeReport>>('/reports/realtime', { params: { update: forceUpdate } });
}