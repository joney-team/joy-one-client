import { MainRequest } from "@/modules/requests/main.request";
import { CreatePluginAiAssistantDto, PluginAiAssistantEntity, UpdatePluginAiAssistantDto } from "./ai-assistants-types";
import { ResponseList } from "@/types";

export async function createPluginAiAssistant(dto: CreatePluginAiAssistantDto) {
  return MainRequest.post<PluginAiAssistantEntity>(`/plugins/ai-assistants`, dto)
}

export async function updatePluginAiAssistant(id: string, dto: UpdatePluginAiAssistantDto) {
  return MainRequest.put<PluginAiAssistantEntity>(`/plugins/ai-assistants/${id}`, dto)
}

export async function getPluginAiAssistants(query?: any) {
  return MainRequest.get<ResponseList<PluginAiAssistantEntity>>(`/plugins/ai-assistants`, query)
}

export async function removePluginAiAssistant(id: string) {
  return MainRequest.delete<PluginAiAssistantEntity>(`/plugins/ai-assistants/${id}`)
}