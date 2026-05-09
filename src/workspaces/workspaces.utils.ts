import { ForbiddenException } from '@nestjs/common';
import type { AppEntity } from 'src/app.types';
import { AppMessage } from '../app.message';
import type { BaseEntity } from '../database/database.entities';
import { mustBeObjectId, RawObjectId } from '../database/database.utils';
import { XOR } from '../utils/types.utils';
import type { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import type { WorkspaceEntity } from './entities/workspace.entity';

type WorkspaceByEntity = {
  workspace: WorkspaceEntity;
};

type WorkspaceById = {
  workspaceId: RawObjectId;
};

type WorkspaceByMember = {
  member: WorkspaceMember;
};

export type WorkspaceArgs =
  | XOR<WorkspaceByEntity, WorkspaceById>
  | XOR<WorkspaceByEntity, WorkspaceByMember>
  | XOR<WorkspaceById, WorkspaceByMember>;

export type WithWorkspaceArgs<T = {}> = T & WorkspaceArgs;

export type WithOptionalWorkspaceArgs<T = {}> = T & {
  workspace?: WorkspaceEntity;
  workspaceId?: RawObjectId;
  member?: WorkspaceMember;
};

export function withOptionalWorkspaceArgs<T>(
  args: WithOptionalWorkspaceArgs<T>,
): T & {
  workspace?: WorkspaceEntity | null;
  member?: WorkspaceMember | null;
  workspaceId?: string | null;
} {
  const member: WorkspaceMember | null = 'member' in args ? args.member : null;

  const workspace = 'workspace' in args ? args.workspace : member?.workspace;

  const workspaceId =
    'workspaceId' in args && args.workspaceId
      ? mustBeObjectId(args.workspaceId).toString()
      : (member?.workspaceId ??
        member?.workspace._id.toString() ??
        workspace?._id.toString());

  return {
    ...args,
    workspace,
    member,
    workspaceId,
  } as T & {
    workspace?: WorkspaceEntity | null;
    member?: WorkspaceMember | null;
    workspaceId?: string | null;
  };
}

export function withWorkspaceArgs<T = {}>(
  args: WithWorkspaceArgs<T>,
  { isRequiredMember } = { isRequiredMember: false },
): T & {
  workspace: WorkspaceEntity | null;
  workspaceId: string;
  member: WorkspaceMember | null;
} {
  const { workspaceId, member, workspace } = withOptionalWorkspaceArgs(args);

  if (isRequiredMember && !member) {
    throw new ForbiddenException(AppMessage.ACCESS_DENIED);
  }

  return {
    ...args,
    workspace,
    workspaceId,
    member,
  };
}

export function detectWorkspaceBranchIds(query?: any): string[] {
  if (!query || typeof query !== 'object') return [];

  const workspaceBranchId =
    typeof query?.workspaceBranchId === 'string'
      ? query.workspaceBranchId
      : null;

  const workspaceBranchIds: string[] =
    typeof query === 'object' &&
    'workspaceBranchIds' in query &&
    query.workspaceBranchIds
      ? query.workspaceBranchIds
          .toString()
          .split(',')
          .map((v: string) => v.trim())
      : [];

  return [workspaceBranchId, ...workspaceBranchIds].filter(Boolean);
}

export function encodeWorkspace(params: {
  workspaceCode: string;
  code: number | string;
  entity?: AppEntity;
}) {
  return `${params.workspaceCode}${params.code}${params.entity || ''}`.trim();
}

export function decodeWorkspace(input: string) {
  // Validate input
  if (typeof input !== 'string' || input.length === 0) {
    throw new Error('Input must be a non-empty string.');
  }

  // Regex to match code
  const regex = /^([A-Z]+)(\d+)([A-Z]*)?$/;
  const match = input.match(regex);

  if (!match) {
    throw new Error('Invalid code format.');
  }

  // Extract workspace code, code, and entity
  const workspaceCode = match[1];
  const code = match[2];
  const entity = match[3];

  return { workspaceCode, code, entity, count: +code };
}

export function renderEntityCode(workspaceCode?: string, plainCode?: string) {
  if (!workspaceCode) return plainCode || '';
  if (plainCode) return plainCode || '';

  try {
    const decoded = decodeWorkspace(workspaceCode);
    return `#${decoded.workspaceCode}${decoded.code}`;
  } catch (error) {
    return workspaceCode || '';
  }
}

export const validateWorkspaceAccessable = (args: {
  member: WorkspaceMember;
  data: BaseEntity;
}) => {
  const { member, data } = args;

  if (!data.workspaceId) return true;

  // Require workspace id
  if (data.workspaceId && data.workspaceId === member.workspace._id.toString())
    return true;

  throw new ForbiddenException(AppMessage.ACCESS_DENIED);
};
