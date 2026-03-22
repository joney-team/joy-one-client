import { ResponseList } from "@/types";
import { restClient } from "../apis/rest-client";
import { WorkspaceApiAppDto } from "./workspace-api-apps-dtos";
import { IWorkspaceApiApp } from "./workspace-api-apps-entity";

export async function getWorkspaceApiApps(query?: any) {
  return restClient.get<ResponseList<IWorkspaceApiApp>>("/workspace-api-apps", { params: query });
}

export async function createWorkspaceApiApp(data: WorkspaceApiAppDto) {
  return restClient.post<IWorkspaceApiApp>("/workspace-api-apps", data);
}

export async function updateWorkspaceApiApp(id: string, data: WorkspaceApiAppDto) {
  return restClient.put<IWorkspaceApiApp>(`/workspace-api-apps/${id}`, data);
}

export async function archiveWorkspaceApiApp(id: string) {
  return restClient.delete<IWorkspaceApiApp>(`/workspace-api-apps/${id}`);
}

export async function resetWorkspaceApiAppSecretKey(id: string) {
  return restClient.post<IWorkspaceApiApp>(`/workspace-api-apps/${id}/reset-secret-key`);
}
