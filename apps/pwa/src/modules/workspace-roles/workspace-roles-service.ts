import { apiClient } from "../apis";
import { TransferOwnerDto, WorkspaceRoleDto, WorkspaceRoleEntity } from "./workspace-roles-types";

export async function createWorkspaceRole(dto: WorkspaceRoleDto) {
  return apiClient.post<WorkspaceRoleEntity>("/workspace-roles", dto);
}

export async function updateWorkspaceRole(id: string, dto: WorkspaceRoleDto) {
  return apiClient.put<WorkspaceRoleEntity>(`/workspace-roles/${id}`, dto);
}

export async function getWorkspaceRoles() {
  return apiClient.get<WorkspaceRoleEntity[]>("/workspace-roles");
}

export async function removeWorkspaceRole(roleId: string) {
  return apiClient.delete(`/workspace-roles/${roleId}`);
}

export async function transferOwner(dto: TransferOwnerDto) {
  return apiClient.post(`/workspace-members/transfer-owner`, dto);
}
