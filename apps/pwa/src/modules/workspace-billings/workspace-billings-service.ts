import { ResponseList } from "@/types";
import { api } from "../apis";
import { tl } from "../lang/lang-service";
import {
  BillingBankAccount,
  WorkspaceBalance,
  WorkspaceBillingDepositDto,
  WorkspaceBillingEntity,
  WorkspaceBillingStatus,
  WorkspaceBillingType,
} from "./workspace-billings-types";

export async function getWorkspaceBalance() {
  return api.get<WorkspaceBalance>("/workspace-billings/balance");
}

export function getWorkspaceBillingTypeLabel(type: WorkspaceBillingType) {
  const labels: {
    [key in WorkspaceBillingType]: string;
  } = {
    [WorkspaceBillingType.CASHBACK]: tl("cashback"),
    [WorkspaceBillingType.DEPOSIT]: tl("deposit"),
    [WorkspaceBillingType.WITHDRAW]: tl("withdraw"),
    [WorkspaceBillingType.PAYMENT]: tl("payment"),
  };

  return labels[type];
}

export function getWorkspaceBillingStatusLabel(status: WorkspaceBillingStatus) {
  const labels: {
    [key in WorkspaceBillingStatus]: string;
  } = {
    [WorkspaceBillingStatus.PAID]: tl("paid"),
    [WorkspaceBillingStatus.PENDING]: tl("pendingPayment"),
  };

  return labels[status];
}

export function getWorkspaceBillingTypeColor(type: WorkspaceBillingType) {
  const colors: {
    [key in WorkspaceBillingType]: string;
  } = {
    [WorkspaceBillingType.CASHBACK]: "green",
    [WorkspaceBillingType.DEPOSIT]: "green",
    [WorkspaceBillingType.WITHDRAW]: "red",
    [WorkspaceBillingType.PAYMENT]: "gray",
  };

  return colors[type];
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
