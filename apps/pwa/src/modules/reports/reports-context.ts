import { UseFetch } from "@/utils/use-fetch.util";
import { createContext, useContext } from "react";
import { ReportEntity } from "./reports-entity";
import { RealtimeReport } from "./reports-types";

export interface ReportsContext {
  realtimeReport: UseFetch<ReportEntity<RealtimeReport>>
}

export const Context = createContext({} as ReportsContext);
export const useReports = () => useContext(Context);

