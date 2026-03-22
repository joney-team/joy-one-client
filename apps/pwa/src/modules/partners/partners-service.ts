import { ResponseList } from "@/types";
import { PartnerDto, PartnerEntity } from "./partners-types";
import { restClient } from "../apis/rest-client";

export async function createPartner(dto: PartnerDto) {
  return restClient.post<PartnerEntity>("/partners", dto);
}

export async function getPartners(query: any) {
  return restClient.get<ResponseList<PartnerEntity>>("/partners", { params: query });
}

export async function updatePartner(_id: string, dto: PartnerDto) {
  return restClient.put<PartnerEntity>(`/partners/${_id}`, dto);
}

export async function archivePartner(_id: string) {
  return restClient.delete<PartnerEntity>(`/partners/${_id}/archive`);
}

export async function getPartner(_id: string) {
  return restClient.get<PartnerEntity>(`/partners/${_id}`);
}
