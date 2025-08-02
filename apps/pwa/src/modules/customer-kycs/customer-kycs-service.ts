import { Gender, ResponseList } from "@/types";
import { DateTimeUtils } from "@/utils/dateTime.utils";
import { api } from "../apis";
import { CustomerKycDto, CustomerKycEntity, RejectCustomerKycDto } from "./customer-kycs-types";

export async function getCustomerKycs(query?: any) {
  return api.get<ResponseList<CustomerKycEntity>>('/customer-kycs', { params: query });
}

export async function getCustomerKyc(customerId: string) {
  return api.get<CustomerKycEntity>(`/customer-kycs/${customerId}`);
}

export async function registerCustomerKyc(customerId: string, dto: CustomerKycDto) {
  return api.post<CustomerKycEntity>(`/customer-kycs/${customerId}`, dto);
}

export async function approveCustomerKyc(customerId: string) {
  return api.post<CustomerKycEntity>(`/customer-kycs/${customerId}/approve`);
}

export async function rejectCustomerKyc(customerId: string, dto: RejectCustomerKycDto) {
  return api.post(`/customer-kycs/${customerId}/reject`, dto);
}

export const parseCidDate = (d: string) => {
  if (!d) return null;
  const [date, month, year] = [+d.slice(0, 2), +d.slice(2, 4), +d.slice(4, 8)]
  return DateTimeUtils.timeToSeconds(new Date(year, month - 1, date))
}

export const decodeCid = (cid: string) => {
  const [cidNumber, _, cidFullName, cidBirthday, cidGender, address, cidCreatedAt] = (
    cid || ''
  ).split('|')

  const genderMatching: { [key: string]: Gender } = {
    Nam: Gender.MALE,
    Nữ: Gender.FEMALE,
  }

  return {
    cidNumber,
    cidFullName,
    cidBirthday: parseCidDate(cidBirthday),
    cidGender: genderMatching[cidGender] || Gender.OTHER,
    address,
    cidCreatedAt: parseCidDate(cidCreatedAt),
  }
}