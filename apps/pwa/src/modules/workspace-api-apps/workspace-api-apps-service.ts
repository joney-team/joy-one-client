import { ResponseList } from "@/types";
import { api } from "../apis";
import { WorkspaceApiAppDto } from "./workspace-api-apps-dtos";
import { IWorkspaceApiApp } from "./workspace-api-apps-entity";

export async function getWorkspaceApiApps(query?: any) {
  return api.get<ResponseList<IWorkspaceApiApp>>('/workspace-api-apps', { params: query });
}

export async function createWorkspaceApiApp(data: WorkspaceApiAppDto) {
  return api.post<IWorkspaceApiApp>('/workspace-api-apps', data);
}

export async function updateWorkspaceApiApp(id: string, data: WorkspaceApiAppDto) {
  return api.put<IWorkspaceApiApp>(`/workspace-api-apps/${id}`, data);
}

export async function archiveWorkspaceApiApp(id: string) {
  return api.delete<IWorkspaceApiApp>(`/workspace-api-apps/${id}`);
}

export async function resetWorkspaceApiAppSecretKey(id: string) {
  return api.post<IWorkspaceApiApp>(`/workspace-api-apps/${id}/reset-secret-key`);
}
