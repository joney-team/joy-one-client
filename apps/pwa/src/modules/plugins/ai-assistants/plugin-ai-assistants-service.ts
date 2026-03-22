import { restClient } from "@/modules/apis/rest-client";
import {
  CreatePluginAiAssistantDto,
  PluginAiAssistantEntity,
  UpdatePluginAiAssistantDto,
} from "./plugin-ai-assistants-types";
import { ResponseList } from "@/types";

export async function createPluginAiAssistant(dto: CreatePluginAiAssistantDto) {
  return restClient.post<PluginAiAssistantEntity>(`/plugins/ai-assistants`, dto);
}

export async function updatePluginAiAssistant(id: string, dto: UpdatePluginAiAssistantDto) {
  return restClient.put<PluginAiAssistantEntity>(`/plugins/ai-assistants/${id}`, dto);
}

export async function getPluginAiAssistants(query?: any) {
  return restClient.get<ResponseList<PluginAiAssistantEntity>>(`/plugins/ai-assistants`, {
    params: query,
  });
}

export async function removePluginAiAssistant(id: string) {
  return restClient.delete<PluginAiAssistantEntity>(`/plugins/ai-assistants/${id}`);
}
