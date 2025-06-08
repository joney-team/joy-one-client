import { AppPageMetadata, Gender, ResponseList } from "@/types";
import { Icon, IconGenderBigender, IconGenderFemale, IconGenderMale } from "@tabler/icons-react";
import { t } from "../lang/lang-service";
import { getReceipts } from "../receipts/receipts-service";
import { ReceiptStatus } from "../receipts/receipts-types";
import { MainRequest } from "../requests/main.request";
import { AssignCustomerDto, CustomerDto, CustomerEntity } from "./customer-types"
import { MainServerRequest } from "../requests/main.server-request";

export async function createCustomer(dto: CustomerDto) {
  return MainRequest.post<CustomerEntity>('/customers', dto)
}

export async function isCustomerPhoneExisted(phone: string) {
  return MainRequest.get<boolean>(`/customers/phone/${phone}/exists`)
}

export async function getCustomers(query?: any, controller?: AbortController) {
  return MainRequest.get<ResponseList<CustomerEntity>>('/customers', query, controller)
}

export async function getCustomerByIds(ids: string[]) {
  return MainRequest.get<CustomerEntity[]>(`/customers/ids`, { ids })
}

export async function updateCustomer(_id: string, dto: CustomerDto) {
  return MainRequest.put<CustomerEntity>(`/customers/${_id}`, dto)
}

export async function assignCustomer(_id: string, dto: AssignCustomerDto) {
  return MainRequest.post(`/customers/${_id}/assign`, dto)
}

export async function getCustomerMetadata(code: string) {
  return MainServerRequest.get<AppPageMetadata>(`/customers/metadata/${code}`)
}

export async function customerInteraction(_id: string) {
  try {
    await MainRequest.post(`/customers/${_id}/interaction`)
  } catch (error) {
    console.error(error)
  }
}

export async function archiveCustomer(_id: string) {
  const pendingReceipts = await getReceipts({
    relatedCustomerId: _id,
    status: ReceiptStatus.PENDING,
  })

  if (pendingReceipts.count > 0) {
    throw new Error(t('CUSTOMER_HAS_PENDING_RECEIPTS'))
  }

  return MainRequest.delete(`/customers/${_id}`)
}

export function renderGener(gender?: Gender) {
  if (gender === Gender.FEMALE) return 'Nữ'
  if (gender === Gender.MALE) return 'Nam'
  if (gender === Gender.OTHER) return 'Khác'
  return 'N/A'
}

export function renderGenerIcon(gender?: Gender) {
  if (gender === Gender.FEMALE) return IconGenderFemale
  if (gender === Gender.MALE) return IconGenderMale
  return IconGenderBigender
}

export async function getCustomer(id: string): Promise<CustomerEntity> {
  return MainRequest.get(`/customers/${id}`)
}

export async function getCustomerByCode(code: string): Promise<CustomerEntity> {
  return MainRequest.get(`/customers/codes/${code}`)
}

export const customerGenderOptions: {
  [key in Gender]: {
    color: string,
    icon: Icon,
  }
} = {
  [Gender.FEMALE]: { color: 'pink', icon: IconGenderFemale },
  [Gender.MALE]: { color: 'blue', icon: IconGenderMale },
  [Gender.OTHER]: { color: 'orange', icon: IconGenderBigender },
}