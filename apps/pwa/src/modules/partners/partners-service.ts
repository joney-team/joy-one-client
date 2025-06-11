import { ResponseList } from "@/types";
import { PartnerDto, PartnerEntity } from "./partners-types";
import { api } from "../apis";

export async function createPartner(dto: PartnerDto) {
  return api.post<PartnerEntity>('/partners', dto)
}

export async function getPartners(query: any) {
  return api.get<ResponseList<PartnerEntity>>('/partners', { params: query })
}

export async function updatePartner(_id: string, dto: PartnerDto) {
  return api.put<PartnerEntity>(`/partners/${_id}`, dto)
}

export async function archivePartner(_id: string) {
  return api.delete<PartnerEntity>(`/partners/${_id}/archive`)
}

export async function getPartner(_id: string) {
  return api.get<PartnerEntity>(`/partners/${_id}`)
}