import { restClient } from "../apis/rest-client";
import { CustomerContactDto, CustomerContactEntity } from "./customer-contacts.types";

export async function getCustomerContacts(customerId: string) {
  return restClient.get<CustomerContactEntity>(`/customer-contacts/${customerId}`);
}

export async function setCustomerContacts(customerId: string, dto: CustomerContactDto) {
  return restClient.post<CustomerContactEntity>(`/customer-contacts/${customerId}`, dto);
}
