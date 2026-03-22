import { ResponseList } from "@/types";
import { restClient } from "../apis/rest-client";
import {
  BillingBankAccount,
  WorkspaceBalance,
  WorkspaceBillingDepositDto,
  WorkspaceBillingEntity,
} from "./workspace-billings-types";

export async function getWorkspaceBalance() {
  return restClient.get<WorkspaceBalance>("/workspace-billings/balance");
}

export async function adminGetWorkspaceBalance(workspaceId: string) {
  return restClient.get<WorkspaceBalance>(`/workspace-billings/admin/${workspaceId}/balance`);
}

export async function adminDepositWorkspaceBalance(
  workspaceId: string,
  dto: WorkspaceBillingDepositDto,
) {
  return restClient.post(`/workspace-billings/admin/${workspaceId}/deposit`, dto);
}

export async function getWorkspaceBillings(query?: any) {
  return restClient.get<ResponseList<WorkspaceBillingEntity>>(`/workspace-billings`, {
    params: query,
  });
}

export async function getBillingBankAccount() {
  return restClient.get<BillingBankAccount>(`/workspace-billings/bank-account`);
}
