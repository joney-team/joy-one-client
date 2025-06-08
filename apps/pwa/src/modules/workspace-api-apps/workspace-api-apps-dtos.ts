export interface WorkspaceApiAppDto {
  name: string;
  enabled: boolean;
  roleIds?: string[];
  workspaceBranchIds?: string[];
}