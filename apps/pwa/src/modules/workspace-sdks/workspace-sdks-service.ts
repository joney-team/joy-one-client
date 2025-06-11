import { api } from "../apis";
import { WorkspaceDto } from "../workspaces/workspaces-types";

export async function createWorkspaceSdk(dto: WorkspaceDto) {
  return api.post("/workspace-sdks", dto);
}

export async function removeWorkspaceSdk(id: string) {
  return api.delete(`/workspace-sdks/${id}`);
}

export async function getWorkspaceSdks(query?: any) {
  return api.get(`/workspace-sdks`, { params: query });
}