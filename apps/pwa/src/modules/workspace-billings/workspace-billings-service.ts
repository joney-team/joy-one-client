import { ResponseList } from "@/types";
import { MainRequest } from "../requests/main.request";
import { BillingBankAccount, WorkspaceBalance, WorkspaceBillingDepositDto, WorkspaceBillingEntity, WorkspaceBillingStatus, WorkspaceBillingType } from "./workspace-billings-types";
import { t } from "../lang/lang-service";

export async function getWorkspaceBalance() {
  return MainRequest.get<WorkspaceBalance>("/workspace-billings/balance");
}

export function getWorkspaceBillingTypeLabel(type: WorkspaceBillingType) {
  const labels: {
    [key in WorkspaceBillingType]: string;
  } = {
    [WorkspaceBillingType.CASHBACK]: t('cashback'),
    [WorkspaceBillingType.DEPOSIT]: t('deposit'),
    [WorkspaceBillingType.WITHDRAW]: t('withdraw'),
    [WorkspaceBillingType.PAYMENT]: t('payment'),
  }

  return labels[type];
}

export function getWorkspaceBillingStatusLabel(status: WorkspaceBillingStatus) {
  const labels: {
    [key in WorkspaceBillingStatus]: string;
  } = {
    [WorkspaceBillingStatus.PAID]: t('paid'),
    [WorkspaceBillingStatus.PENDING]: t('pendingPayment'),
  }

  return labels[status];
}

export function getWorkspaceBillingTypeColor(type: WorkspaceBillingType) {
  const colors: {
    [key in WorkspaceBillingType]: string;
  } = {
    [WorkspaceBillingType.CASHBACK]: 'green',
    [WorkspaceBillingType.DEPOSIT]: 'green',
    [WorkspaceBillingType.WITHDRAW]: 'red',
    [WorkspaceBillingType.PAYMENT]: 'gray',
  }

  return colors[type];
}

export async function adminGetWorkspaceBalance(workspaceId: string) {
  return MainRequest.get<WorkspaceBalance>(`/workspace-billings/admin/${workspaceId}/balance`);
}

export async function adminDepositWorkspaceBalance(workspaceId: string, dto: WorkspaceBillingDepositDto) {
  return MainRequest.post(`/workspace-billings/admin/${workspaceId}/deposit`, dto);
}

export async function getWorkspaceBillings(query?: any) {
  return MainRequest.get<ResponseList<WorkspaceBillingEntity>>(`/workspace-billings`, query);
}

export async function getBillingBankAccount() {
  return MainRequest.get<BillingBankAccount>(`/workspace-billings/bank-account`);
}