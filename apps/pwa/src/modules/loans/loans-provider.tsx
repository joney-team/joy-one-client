import { FC, PropsWithChildren, useEffect, useState } from "react";
import { Context } from "./loans-context";
import { getLoanAssetEstimations, setLoanAssetEstimations } from "./loans-service";
import { LoanAssetEstimation, LoanAssetEstimations } from "./loans-types";
import { useWorkspace } from "../workspaces/workspace-context";

const LoansProvider: FC<PropsWithChildren> = (props) => {
  const workspace = useWorkspace();
  const [isInitialized, setIsInitialized] = useState(false);
  const [assetEstimations, _setAssetEstimations] = useState<LoanAssetEstimations>();

  const fetchAssetEstimations = async () => {
    const estimations = await getLoanAssetEstimations();
    _setAssetEstimations(estimations);
  };

  const setAssetEstimations = async (data: LoanAssetEstimations) => {
    _setAssetEstimations(data);
    setLoanAssetEstimations(data);
  };

  const removeEstimation = async (id: string) => {
    if (!assetEstimations) return;
    setAssetEstimations({
      ...assetEstimations,
      estimations: assetEstimations.estimations.filter((e) => e.id !== id),
    });
  };

  const updateEstimation = async (data: LoanAssetEstimation) => {
    if (!assetEstimations) return;
    setAssetEstimations({
      ...assetEstimations,
      estimations: assetEstimations.estimations.map((e) => (e.id === data.id ? data : e)),
    });
  };

  const initialize = async () => {
    await fetchAssetEstimations();
    setIsInitialized(true);
  };

  useEffect(() => {
    if (workspace.userMember?.workspaceId) initialize();
  }, [workspace.userMember?.workspaceId]);

  return (
    <Context.Provider
      value={{
        updateEstimation,
        isInitialized,
        assetEstimations: assetEstimations!,
        setAssetEstimations,
        removeEstimation,
      }}
    >
      {props.children}
    </Context.Provider>
  );
};

export default LoansProvider;
