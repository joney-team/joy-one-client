import { apiClient } from "../apis";
import { WorkspaceDto } from "../workspaces/workspaces-types";

export async function createWorkspaceSdk(dto: WorkspaceDto) {
  return apiClient.post("/workspace-sdks", dto);
}

export async function removeWorkspaceSdk(id: string) {
  return apiClient.delete(`/workspace-sdks/${id}`);
}

export async function getWorkspaceSdks(query?: any) {
  return apiClient.get(`/workspace-sdks`, { params: query });
}
