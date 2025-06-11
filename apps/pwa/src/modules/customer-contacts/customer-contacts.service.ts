import { api } from "../apis";
import { CustomerContactDto, CustomerContactEntity } from "./customer-contacts.types";

export async function getCustomerContacts(customerId: string) {
  return api.get<CustomerContactEntity>(`/customer-contacts/${customerId}`);
}

export async function setCustomerContacts(customerId: string, dto: CustomerContactDto) {
  return api.post<CustomerContactEntity>(`/customer-contacts/${customerId}`, dto);
}