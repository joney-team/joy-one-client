import { AppPageMetadata, Gender, ResponseList } from "@/types";
import { Icon, IconGenderBigender, IconGenderFemale, IconGenderMale } from "@tabler/icons-react";
import { api } from "../apis";
import { apiServerSide } from "../apis/server";
import { tl } from "../lang/lang-service";
import { getReceipts } from "../receipts/receipts-service";
import { ReceiptStatus } from "../receipts/receipts-types";
import { AssignCustomerDto, CustomerDto, CustomerEntity } from "./customer-types";

export async function createCustomer(dto: CustomerDto) {
  return api.post<CustomerEntity>("/customers", dto);
}

export async function isCustomerPhoneExisted(phone: string) {
  return api.get<boolean>(`/customers/phone/${phone}/exists`);
}

export async function getCustomers(query?: any, controller?: AbortController) {
  return api.get<ResponseList<CustomerEntity>>("/customers", {
    params: query,
    signal: controller?.signal,
  });
}

export async function getCustomerByIds(ids: string[]) {
  return api.get<CustomerEntity[]>(`/customers/ids`, { params: { ids } });
}

export async function updateCustomer(_id: string, dto: CustomerDto) {
  return api.put<CustomerEntity>(`/customers/${_id}`, dto);
}

export async function assignCustomer(_id: string, dto: AssignCustomerDto) {
  return api.post(`/customers/${_id}/assign`, dto);
}

export async function getCustomerMetadata(code: string) {
  return apiServerSide.get<AppPageMetadata>(`/customers/metadata/${code}`);
}

export async function customerInteraction(_id: string) {
  try {
    await api.post(`/customers/${_id}/interaction`);
  } catch (error) {
    console.error(error);
  }
}

export async function archiveCustomer(_id: string) {
  const pendingReceipts = await getReceipts({
    relatedCustomerId: _id,
    status: ReceiptStatus.PENDING,
  });

  if (pendingReceipts.count > 0) {
    throw new Error(tl("CUSTOMER_HAS_PENDING_RECEIPTS"));
  }

  return api.delete(`/customers/${_id}`);
}

export function renderGener(gender?: Gender) {
  if (gender === Gender.FEMALE) return "Nữ";
  if (gender === Gender.MALE) return "Nam";
  if (gender === Gender.OTHER) return "Khác";
  return "N/A";
}

export function renderGenerIcon(gender?: Gender) {
  if (gender === Gender.FEMALE) return IconGenderFemale;
  if (gender === Gender.MALE) return IconGenderMale;
  return IconGenderBigender;
}

export async function getCustomer(id: string): Promise<CustomerEntity> {
  return api.get(`/customers/${id}`);
}

export async function getCustomerByCode(code: string): Promise<CustomerEntity> {
  return api.get(`/customers/codes/${code}`);
}

export const customerGenderOptions: {
  [key in Gender]: {
    color: string;
    icon: Icon;
  };
} = {
  [Gender.FEMALE]: { color: "pink", icon: IconGenderFemale },
  [Gender.MALE]: { color: "blue", icon: IconGenderMale },
  [Gender.OTHER]: { color: "orange", icon: IconGenderBigender },
};
