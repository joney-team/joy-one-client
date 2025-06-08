import { createContext, useContext } from "react";
import { LoanAssetEstimation, LoanAssetEstimations } from "./loans-types";

interface LoanContext {
  isInitialized: boolean;
  assetEstimations: LoanAssetEstimations;
  setAssetEstimations: (data: LoanAssetEstimations) => Promise<void>;
  removeEstimation: (id: string) => Promise<void>;
  updateEstimation: (data: LoanAssetEstimation) => Promise<void>;
}

export const Context = createContext({} as LoanContext);
export const useLoans = () => useContext(Context);
