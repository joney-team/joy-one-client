import { ResponseList } from "@/types";
import { MainRequest } from "../requests/main.request";
import { CustomerFormDto, UpdateCustomerFormWorkspaceBranchDto } from "./customer-form-dtos";
import { CustomerFormEntity } from "./customer-form-entity";
import { CustomerFormStatus } from "./customer-form-types";

export async function createCustomerForm(dto: CustomerFormDto) {
  return MainRequest.post<CustomerFormEntity>(`/customer-forms`, dto);
}

export async function updateCustomerForm(id: string, dto: CustomerFormDto) {
  return MainRequest.put<CustomerFormEntity>(`/customer-forms/${id}`, dto);
}

export async function getCustomerForms(query?: any) {
  return MainRequest.get<ResponseList<CustomerFormEntity>>(`/customer-forms`, query);
}

export async function getCustomerForm(id: string) {
  return MainRequest.get<CustomerFormEntity>(`/customer-forms/${id}`);
}

export async function updateCustomerFormWorkspaceBranch(dto: UpdateCustomerFormWorkspaceBranchDto) {
  return MainRequest.put<CustomerFormEntity[]>(`/customer-forms/workspace-branch`, dto);
}

export async function multiArchiveCustomerForm(ids: string[]) {
  return MainRequest.delete<CustomerFormEntity[]>(`/customer-forms`, { ids });
}

export const customerFormStatusConfigs: {
  [key in CustomerFormStatus]: {
    label: string,
    color: string,
  } 
} = {
  [CustomerFormStatus.PENDING]: {
    label: 'status_pending',
    color: 'gray',
  },
  [CustomerFormStatus.COMPLETED]: {
    label: 'status_completed',
    color: 'green',
  },
  [CustomerFormStatus.CANCELLED]: {
    label: 'status_canceled',
    color: 'red',
  },
}