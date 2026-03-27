import { restClient } from "../apis/rest-client";
import { WorkspaceRoleDto, WorkspaceRoleEntity } from "./workspace-roles-types";

export async function createWorkspaceRole(dto: WorkspaceRoleDto) {
  return restClient.post<WorkspaceRoleEntity>("/workspace-roles", dto);
}

export async function updateWorkspaceRole(id: string, dto: WorkspaceRoleDto) {
  return restClient.put<WorkspaceRoleEntity>(`/workspace-roles/${id}`, dto);
}

export async function getWorkspaceRoles() {
  return restClient.get<WorkspaceRoleEntity[]>("/workspace-roles");
}

export async function removeWorkspaceRole(roleId: string) {
  return restClient.delete(`/workspace-roles/${roleId}`);
}
