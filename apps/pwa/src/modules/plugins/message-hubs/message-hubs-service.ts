import { MainRequest } from "@/modules/requests/main.request";
import { PluginMessageHubDto, PluginMessageHubEntity } from "./message-hubs-types";
import { ResponseList } from "@/types";

export async function createPluginMessageHub(dto: PluginMessageHubDto) {
  return MainRequest.post<PluginMessageHubEntity>('/plugins/message-hubs', dto);
}

export async function updatePluginMessageHub(id: string, dto: PluginMessageHubDto) {
  return MainRequest.put<PluginMessageHubEntity>(`/plugins/message-hubs/${id}`, dto);
}

export async function getPluginMessageHubs(query?: any) {
  return MainRequest.get<ResponseList<PluginMessageHubEntity>>('/plugins/message-hubs', query);
}

export async function removePluginMessageHub(id: string) {
  return MainRequest.delete(`/plugins/message-hubs/${id}`);
}