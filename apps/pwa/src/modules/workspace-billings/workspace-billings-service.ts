import { ResponseList } from "@/types";
import { apiClient } from "../apis";
import {
  BillingBankAccount,
  WorkspaceBalance,
  WorkspaceBillingDepositDto,
  WorkspaceBillingEntity,
} from "./workspace-billings-types";

export async function getWorkspaceBalance() {
  return apiClient.get<WorkspaceBalance>("/workspace-billings/balance");
}

export async function adminGetWorkspaceBalance(workspaceId: string) {
  return apiClient.get<WorkspaceBalance>(`/workspace-billings/admin/${workspaceId}/balance`);
}

export async function adminDepositWorkspaceBalance(
  workspaceId: string,
  dto: WorkspaceBillingDepositDto
) {
  return apiClient.post(`/workspace-billings/admin/${workspaceId}/deposit`, dto);
}

export async function getWorkspaceBillings(query?: any) {
  return apiClient.get<ResponseList<WorkspaceBillingEntity>>(`/workspace-billings`, {
    params: query,
  });
}

export async function getBillingBankAccount() {
  return apiClient.get<BillingBankAccount>(`/workspace-billings/bank-account`);
}
