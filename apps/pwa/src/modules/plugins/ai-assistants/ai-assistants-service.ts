import { api } from "@/modules/apis";
import { CreatePluginAiAssistantDto, PluginAiAssistantEntity, UpdatePluginAiAssistantDto } from "./ai-assistants-types";
import { ResponseList } from "@/types";

export async function createPluginAiAssistant(dto: CreatePluginAiAssistantDto) {
  return api.post<PluginAiAssistantEntity>(`/plugins/ai-assistants`, dto)
}

export async function updatePluginAiAssistant(id: string, dto: UpdatePluginAiAssistantDto) {
  return api.put<PluginAiAssistantEntity>(`/plugins/ai-assistants/${id}`, dto)
}

export async function getPluginAiAssistants(query?: any) {
  return api.get<ResponseList<PluginAiAssistantEntity>>(`/plugins/ai-assistants`, { params: query })
}

export async function removePluginAiAssistant(id: string) {
  return api.delete<PluginAiAssistantEntity>(`/plugins/ai-assistants/${id}`)
}