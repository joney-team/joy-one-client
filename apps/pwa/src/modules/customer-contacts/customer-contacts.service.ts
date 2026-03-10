import { apiClient } from "../apis";
import { CustomerContactDto, CustomerContactEntity } from "./customer-contacts.types";

export async function getCustomerContacts(customerId: string) {
  return apiClient.get<CustomerContactEntity>(`/customer-contacts/${customerId}`);
}

export async function setCustomerContacts(customerId: string, dto: CustomerContactDto) {
  return apiClient.post<CustomerContactEntity>(`/customer-contacts/${customerId}`, dto);
}
