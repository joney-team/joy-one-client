import { api } from "../apis";
import { TransferOwnerDto, WorkspaceRoleDto, WorkspaceRoleEntity } from "./workspace-roles-types";

export async function createWorkspaceRole(dto: WorkspaceRoleDto) {
  return api.post<WorkspaceRoleEntity>('/WorkspaceRoles', dto);
}

export async function updateWorkspaceRole(id: string, dto: WorkspaceRoleDto) {
  return api.put<WorkspaceRoleEntity>(`/WorkspaceRoles/${id}`, dto);
}

export async function getWorkspaceRoles() {
  return api.get<WorkspaceRoleEntity[]>('/WorkspaceRoles');
}

export async function removeWorkspaceRole(roleId: string) {
  return api.delete(`/WorkspaceRoles/${roleId}`);
}

export async function transferOwner(dto: TransferOwnerDto) {
  return api.post(`/workspace-members/transfer-owner`, dto);
}