import { restClient } from "../apis/rest-client";
import { getClientLocale } from "../lang/lang-service";
import {
  CalculateWorkspaceSubscriptionBillingResponse,
  CalculateWorkspaceSubscriptionBillingsDto,
  SelectWorkspaceSubscriptionDto,
  WorkspaceSubscriptionEntity,
} from "./workspace-subscriptions-types";

export async function getWorkspaceSubscription() {
  return restClient.get<WorkspaceSubscriptionEntity>(`/workspace-subscriptions`);
}

export async function selectWorkspaceSubscription(dto: SelectWorkspaceSubscriptionDto) {
  return restClient.post<WorkspaceSubscriptionEntity>(`/workspace-subscriptions/select`, dto);
}

export async function calculateWorkspaceSubscriptionBillings(
  dto: CalculateWorkspaceSubscriptionBillingsDto,
) {
  return restClient.post<CalculateWorkspaceSubscriptionBillingResponse>(
    "/workspace-subscriptions/calculate-billings",
    dto,
  );
}

export const renderSubscriptionNum = (num: number, format?: (value: any) => string) => {
  if (num <= 0) return "Unlimited";
  if (format) return format(num);
  return num.toLocaleString(getClientLocale());
};
