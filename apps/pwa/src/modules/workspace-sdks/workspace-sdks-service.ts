import { MainRequest } from "../requests/main.request";
import { WorkspaceDto } from "../workspaces/workspaces-types";

export async function createWorkspaceSdk(dto: WorkspaceDto) {
  return MainRequest.post("/workspace-sdks", dto);
}

export async function removeWorkspaceSdk(id: string) {
  return MainRequest.delete(`/workspace-sdks/${id}`);
}

export async function getWorkspaceSdks(query?: any) {
  return MainRequest.get(`/workspace-sdks`, query);
}