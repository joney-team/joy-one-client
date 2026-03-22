import { ResponseList } from "@/types";
import { restClient } from "../apis/rest-client";
import { SubscriptionDto, SubscriptionEntity } from "./subscriptions-types";

export async function getSubscriptions() {
  return restClient.get<ResponseList<SubscriptionEntity>>("/subscriptions");
}

export async function createSubscription(dto: SubscriptionDto) {
  return restClient.post<SubscriptionEntity>("/subscriptions", dto);
}

export async function updateSubscription(id: string, dto: SubscriptionDto) {
  return restClient.put<SubscriptionEntity>(`/subscriptions/${id}`, dto);
}

export async function setDefaultSubscription(id: string) {
  return restClient.post<SubscriptionEntity>(`/subscriptions/${id}/default`);
}

export async function setPrivateSubscription(id: string, value: boolean) {
  return restClient.post<SubscriptionEntity>(`/subscriptions/${id}/private`, { private: value });
}

export async function removeSubscription(id: string) {
  return restClient.delete(`/subscriptions/${id}`);
}
