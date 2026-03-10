import { ResponseList } from "@/types";
import { apiClient } from "../apis";
import { SubscriptionDto, SubscriptionEntity } from "./subscriptions-types";

export async function getSubscriptions() {
  return apiClient.get<ResponseList<SubscriptionEntity>>("/subscriptions");
}

export async function createSubscription(dto: SubscriptionDto) {
  return apiClient.post<SubscriptionEntity>("/subscriptions", dto);
}

export async function updateSubscription(id: string, dto: SubscriptionDto) {
  return apiClient.put<SubscriptionEntity>(`/subscriptions/${id}`, dto);
}

export async function setDefaultSubscription(id: string) {
  return apiClient.post<SubscriptionEntity>(`/subscriptions/${id}/default`);
}

export async function setPrivateSubscription(id: string, value: boolean) {
  return apiClient.post<SubscriptionEntity>(`/subscriptions/${id}/private`, { private: value });
}

export async function removeSubscription(id: string) {
  return apiClient.delete(`/subscriptions/${id}`);
}
