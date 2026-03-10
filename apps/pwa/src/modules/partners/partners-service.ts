import { ResponseList } from "@/types";
import { PartnerDto, PartnerEntity } from "./partners-types";
import { apiClient } from "../apis";

export async function createPartner(dto: PartnerDto) {
  return apiClient.post<PartnerEntity>("/partners", dto);
}

export async function getPartners(query: any) {
  return apiClient.get<ResponseList<PartnerEntity>>("/partners", { params: query });
}

export async function updatePartner(_id: string, dto: PartnerDto) {
  return apiClient.put<PartnerEntity>(`/partners/${_id}`, dto);
}

export async function archivePartner(_id: string) {
  return apiClient.delete<PartnerEntity>(`/partners/${_id}/archive`);
}

export async function getPartner(_id: string) {
  return apiClient.get<PartnerEntity>(`/partners/${_id}`);
}
