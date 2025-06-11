import { api } from "@/modules/apis";
import { ResponseList } from "@/types";
import { PluginMessageHubDto, PluginMessageHubEntity } from "./message-hubs-types";

export async function createPluginMessageHub(dto: PluginMessageHubDto) {
  return api.post<PluginMessageHubEntity>('/plugins/message-hubs', dto);
}

export async function updatePluginMessageHub(id: string, dto: PluginMessageHubDto) {
  return api.put<PluginMessageHubEntity>(`/plugins/message-hubs/${id}`, dto);
}

export async function getPluginMessageHubs(query?: any) {
  return api.get<ResponseList<PluginMessageHubEntity>>('/plugins/message-hubs', { params: query });
}

export async function removePluginMessageHub(id: string) {
  return api.delete(`/plugins/message-hubs/${id}`);
}