import { ResponseList } from "@/types";
import { MainRequest } from "../requests/main.request";
import { WorkspaceBranchDto, WorkspaceBranchEntity } from "./workspace-branches-types";

export async function getWorkspaceBranches(query?: any) {
  return MainRequest.get<ResponseList<WorkspaceBranchEntity>>('/workspace-branches', query)
}

export async function getWorkspaceBranchByIds(ids: string[]) {
  if (!ids || ids.length === 0) return [];
  return MainRequest.get<WorkspaceBranchEntity[]>(`/workspace-branches/ids`, { ids })
}

export async function createWorkspaceBranch(dto: WorkspaceBranchDto) {
  return MainRequest.post<WorkspaceBranchEntity>('/workspace-branches', dto)
}

export async function updateWorkspaceBranch(id: string, dto: WorkspaceBranchDto) {
  return MainRequest.put<WorkspaceBranchEntity>(`/workspace-branches/${id}`, dto)
}

export async function getWorkspaceBranchById(id: string) {
  return MainRequest.get<WorkspaceBranchEntity>(`/workspace-branches/ids/${id}`)
}
  