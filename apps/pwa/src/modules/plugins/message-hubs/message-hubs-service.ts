import { restClient } from "@/modules/apis/rest-client";
import { ResponseList } from "@/types";
import { PluginMessageHubDto, PluginMessageHubEntity } from "./message-hubs-types";

export async function createPluginMessageHub(dto: PluginMessageHubDto) {
  return restClient.post<PluginMessageHubEntity>("/plugins/message-hubs", dto);
}

export async function updatePluginMessageHub(id: string, dto: PluginMessageHubDto) {
  return restClient.put<PluginMessageHubEntity>(`/plugins/message-hubs/${id}`, dto);
}

export async function getPluginMessageHubs(query?: any) {
  return restClient.get<ResponseList<PluginMessageHubEntity>>("/plugins/message-hubs", {
    params: query,
  });
}

export async function removePluginMessageHub(id: string) {
  return restClient.delete(`/plugins/message-hubs/${id}`);
}
