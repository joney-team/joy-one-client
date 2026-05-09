import { Field, ObjectType } from '@nestjs/graphql';
import { BaseMongoEntity } from 'src/database/database.entities';
import { RawObjectId } from 'src/database/database.utils';
import { Column, Entity, Unique } from 'typeorm';
import { AppLocale } from '../../lang/lang.types';
import { UserRole } from '../../users/users.types';
import { WorkspaceBranchEntity } from '../../workspace-branches/entities/workspace-branch.entity';
import { WorkspaceRoleEntity } from '../../workspace-roles/entities/workspace-role.entity';
import {
  WorkspaceDefaultRoleId,
  WorkspacePermission,
} from '../../workspace-roles/workspace-roles.types';
import { WorkspaceEntity } from '../../workspaces/entities/workspace.entity';
import { WorkspaceMemberWorkingTimeType } from '../workspace-members.types';

@Entity('workspace-members')
@Unique('workspace-members-unique', ['ref'])
export class WorkspaceMemberEntity extends BaseMongoEntity {
  @Column()
  ref: string;

  @Column()
  workspaceId: string;

  @Column()
  userId: string;

  @Column()
  roleId?: string | WorkspaceDefaultRoleId;

  @Column()
  roleIds: string[];

  @Column()
  displayName?: string;

  @Column()
  color?: string;

  @Column()
  workingTimeType?: WorkspaceMemberWorkingTimeType;

  @Column()
  workspaceBranchIds?: string[];
}

export interface WorkspaceMember {
  _id?: string | null;
  userId: string;
  name: string;
  memberId?: string;
  memberDisplayName?: string;
  userDisplayName?: string;
  avatar?: string;
  phone?: string;
  color?: string;
  email?: string;
  roleIds: string[];
  roles: (Pick<WorkspaceRoleEntity, 'name' | 'color'> & { _id: RawObjectId })[];
  workspaceBranchIds: string[];
  workspaceBranches: Pick<WorkspaceBranchEntity, '_id' | 'name' | 'hotline'>[];
  workingTimeType?: WorkspaceMemberWorkingTimeType;
  lastSignInAt?: number;
  joinedAt?: number;
  locale: AppLocale | null;
  timezone: string | null;
  isJoined: boolean;
  userRole: UserRole;

  workspaceId: string;
  workspace: WorkspaceEntity;
  permissions: WorkspacePermission[];
}

@ObjectType()
export class WorkspaceMemberRole {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  color?: string;
}

@ObjectType()
export class WorkspaceMemberWorkspaceBranchInfo {
  @Field()
  _id: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  hotline: string | null;
}

@ObjectType('WorkspaceMember')
export class WorkspaceMemberPublicInfo {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  userId: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  email: string;

  @Field(() => String, { nullable: true })
  memberId: string | null;

  @Field(() => String)
  workspaceId: string;

  @Field(() => WorkspaceEntity)
  workspace: WorkspaceEntity;

  @Field(() => [WorkspaceMemberWorkspaceBranchInfo])
  workspaceBranches: WorkspaceMemberWorkspaceBranchInfo[];

  @Field(() => String, { nullable: true })
  memberDisplayName: string | null;

  @Field(() => String, { nullable: true })
  userDisplayName: string | null;

  @Field(() => String, { nullable: true })
  avatar: string | null;

  @Field(() => String, { nullable: true })
  phone: string | null;

  @Field(() => String, { nullable: true })
  color: string | null;

  @Field(() => [String])
  roleIds: string[];

  @Field(() => [WorkspaceMemberRole], { nullable: false })
  roles: WorkspaceMemberRole[];

  @Field(() => [String])
  permissions: string[];

  @Field(() => WorkspaceMemberWorkingTimeType, { nullable: true })
  workingTimeType?: WorkspaceMemberWorkingTimeType;

  @Field({ nullable: true })
  joinedAt?: number;
}
