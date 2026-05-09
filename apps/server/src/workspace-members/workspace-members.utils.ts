import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import { WorkspaceMember } from './entities/workspace-member.entity';

export function hasPermission(
  member: WorkspaceMember,
  permission: WorkspacePermission,
) {
  return member.permissions.includes(permission);
}
