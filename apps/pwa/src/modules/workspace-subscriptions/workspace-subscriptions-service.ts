import { getLocaleClient } from "../lang/lang-service";
import { MainRequest } from "../requests/main.request";
import { CalculateWorkspaceSubscriptionBillingResponse, CalculateWorkspaceSubscriptionBillingsDto, SelectWorkspaceSubscriptionDto, WorkspaceSubscriptionEntity } from "./workspace-subscriptions-types";

export async function getWorkspaceSubscription() {
  return MainRequest.get<WorkspaceSubscriptionEntity>(`/workspace-subscriptions`);
}

export async function selectWorkspaceSubscription(dto: SelectWorkspaceSubscriptionDto) {
  return MainRequest.post<WorkspaceSubscriptionEntity>(`/workspace-subscriptions/select`, dto);
}

export async function calculateWorkspaceSubscriptionBillings(dto: CalculateWorkspaceSubscriptionBillingsDto) {
  return MainRequest.post<CalculateWorkspaceSubscriptionBillingResponse>("/workspace-subscriptions/calculate-billings", dto);
}

export const renderSubscriptionNum = (num: number, format?: (value: any) => string) => {
  if (num <= 0) return 'Unlimited';
  if (format) return format(num);
  return num.toLocaleString(getLocaleClient());
}