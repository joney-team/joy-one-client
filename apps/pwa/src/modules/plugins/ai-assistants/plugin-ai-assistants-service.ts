import { apiClient } from "@/modules/apis";
import {
  CreatePluginAiAssistantDto,
  PluginAiAssistantEntity,
  UpdatePluginAiAssistantDto,
} from "./plugin-ai-assistants-types";
import { ResponseList } from "@/types";

export async function createPluginAiAssistant(dto: CreatePluginAiAssistantDto) {
  return apiClient.post<PluginAiAssistantEntity>(`/plugins/ai-assistants`, dto);
}

export async function updatePluginAiAssistant(id: string, dto: UpdatePluginAiAssistantDto) {
  return apiClient.put<PluginAiAssistantEntity>(`/plugins/ai-assistants/${id}`, dto);
}

export async function getPluginAiAssistants(query?: any) {
  return apiClient.get<ResponseList<PluginAiAssistantEntity>>(`/plugins/ai-assistants`, {
    params: query,
  });
}

export async function removePluginAiAssistant(id: string) {
  return apiClient.delete<PluginAiAssistantEntity>(`/plugins/ai-assistants/${id}`);
}
