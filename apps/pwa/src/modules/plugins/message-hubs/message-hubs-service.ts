import { apiClient } from "@/modules/apis";
import { ResponseList } from "@/types";
import { PluginMessageHubDto, PluginMessageHubEntity } from "./message-hubs-types";

export async function createPluginMessageHub(dto: PluginMessageHubDto) {
  return apiClient.post<PluginMessageHubEntity>("/plugins/message-hubs", dto);
}

export async function updatePluginMessageHub(id: string, dto: PluginMessageHubDto) {
  return apiClient.put<PluginMessageHubEntity>(`/plugins/message-hubs/${id}`, dto);
}

export async function getPluginMessageHubs(query?: any) {
  return apiClient.get<ResponseList<PluginMessageHubEntity>>("/plugins/message-hubs", {
    params: query,
  });
}

export async function removePluginMessageHub(id: string) {
  return apiClient.delete(`/plugins/message-hubs/${id}`);
}
