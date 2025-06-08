import { MainRequest } from "../requests/main.request";
import { CustomerContactDto, CustomerContactEntity } from "./customer-contacts.types";

export async function getCustomerContacts(customerId: string) {
  return MainRequest.get<CustomerContactEntity>(`/customer-contacts/${customerId}`);
}

export async function setCustomerContacts(customerId: string, dto: CustomerContactDto) {
  return MainRequest.post<CustomerContactEntity>(`/customer-contacts/${customerId}`, dto);
}