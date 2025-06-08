import { ResponseList } from "@/types";
import { MainRequest } from "../requests/main.request";
import { IWorkspaceApiApp } from "./workspace-api-apps-entity";
import { WorkspaceApiAppDto } from "./workspace-api-apps-dtos";

export async function getWorkspaceApiApps(query?: any) {
  return MainRequest.get<ResponseList<IWorkspaceApiApp>>('/workspace-api-apps', { query });
}

export async function createWorkspaceApiApp(data: WorkspaceApiAppDto) {
  return MainRequest.post<IWorkspaceApiApp>('/workspace-api-apps', data);
}

export async function updateWorkspaceApiApp(id: string, data: WorkspaceApiAppDto) {
  return MainRequest.put<IWorkspaceApiApp>(`/workspace-api-apps/${id}`, data);
}

export async function archiveWorkspaceApiApp(id: string) {
  return MainRequest.delete<IWorkspaceApiApp>(`/workspace-api-apps/${id}`);
}

export async function resetWorkspaceApiAppSecretKey(id: string) {
  return MainRequest.post<IWorkspaceApiApp>(`/workspace-api-apps/${id}/reset-secret-key`);
}
