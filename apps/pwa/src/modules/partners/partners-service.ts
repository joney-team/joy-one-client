import { ResponseList } from "@/types";
import { MainRequest } from "../requests/main.request";
import { PartnerDto, PartnerEntity } from "./partners-types";

export async function createPartner(dto: PartnerDto) {
  return MainRequest.post<PartnerEntity>('/partners', dto)
}

export async function getPartners(query: any) {
  return MainRequest.get<ResponseList<PartnerEntity>>('/partners', query)
}

export async function updatePartner(_id: string, dto: PartnerDto) {
  return MainRequest.put<PartnerEntity>(`/partners/${_id}`, dto)
}

export async function archivePartner(_id: string) {
  return MainRequest.delete<PartnerEntity>(`/partners/${_id}/archive`)
}

export async function getPartner(_id: string) {
  return MainRequest.get<PartnerEntity>(`/partners/${_id}`)
}