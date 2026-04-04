import { createContext, useContext } from "react";
import { MetricsReportFragment } from "./graphql/fragmentMetricsReport.graphql";

export interface ReportsContext {
  metrics: MetricsReportFragment | null | undefined;
  isMetricsLoading: boolean;
  refetch: () => void;
}

export const Context = createContext({} as ReportsContext);
export const useReports = () => useContext(Context);
