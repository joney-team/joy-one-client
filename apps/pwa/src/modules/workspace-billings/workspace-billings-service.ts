import { ResponseList } from "@/types";
import { api } from "../apis";
import {
  BillingBankAccount,
  WorkspaceBalance,
  WorkspaceBillingDepositDto,
  WorkspaceBillingEntity,
} from "./workspace-billings-types";

export async function getWorkspaceBalance() {
  return api.get<WorkspaceBalance>("/workspace-billings/balance");
}

export async function adminGetWorkspaceBalance(workspaceId: string) {
  return api.get<WorkspaceBalance>(`/workspace-billings/admin/${workspaceId}/balance`);
}

export async function adminDepositWorkspaceBalance(
  workspaceId: string,
  dto: WorkspaceBillingDepositDto
) {
  return api.post(`/workspace-billings/admin/${workspaceId}/deposit`, dto);
}

export async function getWorkspaceBillings(query?: any) {
  return api.get<ResponseList<WorkspaceBillingEntity>>(`/workspace-billings`, { params: query });
}

export async function getBillingBankAccount() {
  return api.get<BillingBankAccount>(`/workspace-billings/bank-account`);
}
