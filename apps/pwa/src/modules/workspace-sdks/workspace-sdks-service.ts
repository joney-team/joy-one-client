import { restClient } from "../apis/rest-client";
import { WorkspaceDto } from "../workspaces/workspaces-types";

export async function createWorkspaceSdk(dto: WorkspaceDto) {
  return restClient.post("/workspace-sdks", dto);
}

export async function removeWorkspaceSdk(id: string) {
  return restClient.delete(`/workspace-sdks/${id}`);
}

export async function getWorkspaceSdks(query?: any) {
  return restClient.get(`/workspace-sdks`, { params: query });
}
