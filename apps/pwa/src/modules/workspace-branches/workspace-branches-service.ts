import { ResponseList } from "@/types";
import { api } from "../apis";
import { WorkspaceBranchDto, WorkspaceBranchEntity } from "./workspace-branches-types";

export async function getWorkspaceBranches(query?: any) {
  return api.get<ResponseList<WorkspaceBranchEntity>>('/workspace-branches', { params: query })
}

export async function getWorkspaceBranchByIds(ids: string[]) {
  if (!ids || ids.length === 0) return [];
  return api.get<WorkspaceBranchEntity[]>(`/workspace-branches/ids`, { params: { ids } })
}

export async function createWorkspaceBranch(dto: WorkspaceBranchDto) {
  return api.post<WorkspaceBranchEntity>('/workspace-branches', dto)
}

export async function updateWorkspaceBranch(id: string, dto: WorkspaceBranchDto) {
  return api.put<WorkspaceBranchEntity>(`/workspace-branches/${id}`, dto)
}

export async function getWorkspaceBranchById(id: string) {
  return api.get<WorkspaceBranchEntity>(`/workspace-branches/ids/${id}`)
}
  