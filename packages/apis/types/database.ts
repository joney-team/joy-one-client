import { AppEntity } from "./general";
import { WorkspaceBranchEntity } from "./workspace-branches";
import { WorkspaceMemberInfo } from "./workspace-members";

export interface BaseEntity {
  createdAt: number
  updatedAt?: number
  workspaceId?: string
  lastInteractionAt?: number
  isArchived?: boolean
  createdByUser?: WorkspaceMemberInfo
  createdByUserId?: string
  assigneeUserIds?: string[]
  assigneeUsers?: WorkspaceMemberInfo[]
  workspaceBranchId?: string
  workspaceBranch?: Pick<WorkspaceBranchEntity, '_id' | 'name'>
  relatedEntities?: RelatedEntity[]
}

export interface RelatedEntity {
  entity: AppEntity;
  id?: string;
  data?: any;
  index?: boolean;
}

export interface BaseMongoEntity extends BaseEntity {
  _id: string;
  relatedEntities?: RelatedEntity[];
}

export interface BasePostgresEntity extends BaseEntity {
  id: string;
  _count: number;
  _id?: string;
  relatedEntities?: RelatedEntity[];
}

export interface Query {
  offset?: number,
  limit?: number,
  getAll?: boolean,
  sort?: string,
}