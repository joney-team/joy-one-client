import { restClient } from "@/modules/apis/rest-client";
import { ResponseList } from "@/types";
import { onError } from "@/utils/exceptions.utils";
import {
  PluginZaloConnectCallbackDto,
  PluginZaloOaEntity,
  UpdatePluginZaloOaDto,
  ZnsTemplateConfigs,
} from "./zalo-oas-types";

export async function getPluginZaloOas() {
  return restClient.get<ResponseList<PluginZaloOaEntity>>(`/plugins/zalo-oas`);
}

export async function updatePluginZalo(id: string, dto: UpdatePluginZaloOaDto) {
  return restClient.put(`/plugins/zalo-oas/${id}`, dto);
}

export async function togglePluginZalo(id: string) {
  return restClient.post(`/plugins/zalo-oas/${id}/toggle-enable`);
}

export async function connectPluginZalo() {
  return restClient
    .post<{ url: string }>(`/plugins/zalo-oas/connect`)
    .then((res) => window.open(res.url, "_blank"))
    .catch(onError);
}

export async function setDefaultPluginZalo(id: string) {
  return restClient.post(`/plugins/zalo-oas/${id}/default`);
}

export async function reconnectPluginZalo(id: string) {
  return restClient.post(`/plugins/zalo-oas/${id}/reconnect`);
}

export async function connectCallbackPluginZalo(dto: PluginZaloConnectCallbackDto) {
  return restClient.post<PluginZaloOaEntity>(`/plugins/zalo-oas/connect/callback`, dto);
}

export async function disconnectPluginZalo(id: string) {
  return restClient.post(`/plugins/zalo-oas/${id}/disconnect`);
}

export async function getZnsTemplateConfigs() {
  return restClient.get<ZnsTemplateConfigs>(`/plugins/zalo-oas/zns-templates`);
}
