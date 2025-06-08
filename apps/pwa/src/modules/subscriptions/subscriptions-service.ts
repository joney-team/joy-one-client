import { ResponseList } from "@/types";
import { MainRequest } from "../requests/main.request";
import { SubscriptionDto, SubscriptionEntity } from "./subscriptions-types";

export async function getSubscriptions() {
  return MainRequest.get<ResponseList<SubscriptionEntity>>("/subscriptions");
}

export async function createSubscription(dto: SubscriptionDto) {
  return MainRequest.post<SubscriptionEntity>("/subscriptions", dto);
}

export async function updateSubscription(id: string, dto: SubscriptionDto) {
  return MainRequest.put<SubscriptionEntity>(`/subscriptions/${id}`, dto);
}

export async function setDefaultSubscription(id: string) {
  return MainRequest.post<SubscriptionEntity>(`/subscriptions/${id}/default`);
}

export async function setPrivateSubscription(id: string, value: boolean) {
  return MainRequest.post<SubscriptionEntity>(`/subscriptions/${id}/private`, { private: value });
}

export async function removeSubscription(id: string) {
  return MainRequest.delete(`/subscriptions/${id}`);
}