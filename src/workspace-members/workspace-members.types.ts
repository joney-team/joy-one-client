import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserEntity } from '../users/entities/user.entity';
import { UserAuthProvider } from '../users/users.types';
import { WorkspaceRole } from '../workspace-roles/entities/workspace-role.entity';
import { WorkspaceEntity } from '../workspaces/entities/workspace.entity';
import { WorkspaceType } from '../workspaces/workspaces.types';

export enum WorkspaceMemberWorkingTimeType {
  FULLTIME = 'FULLTIME',
  FREELANCER = 'FREELANCER',
}

registerEnumType(WorkspaceMemberWorkingTimeType, {
  name: 'WorkspaceMemberWorkingTimeType',
  description: 'The working time type of the workspace member',
});

@InputType()
export class UpdateWorkspaceMemberInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  displayName?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  color?: string;

  @Field(() => WorkspaceMemberWorkingTimeType, { nullable: true })
  @IsEnum(WorkspaceMemberWorkingTimeType)
  @IsOptional()
  workingTimeType?: WorkspaceMemberWorkingTimeType;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  workspaceBranchIds?: string[];
}

@ArgsType()
export class AssignWorkspaceMemberRolesArgs {
  @Field(() => String)
  @IsString()
  memberId: string;

  @Field(() => [String])
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  roleIds: string[];
}

export class AssignWorkspaceRoleDto {
  @IsString()
  @IsOptional()
  roleId?: string;
}

export interface VerifyInvitaionTokenResponse {
  workspace: WorkspaceEntity;
  invitorUser: UserEntity;
  workspaceId: string;
  invitorUserId: string;
}

@InputType()
export class TransferOwnerInput {
  @Field()
  @IsString()
  userId: string;
}

@ObjectType()
export class UserMutualWorkspace {
  @Field()
  _id: string;

  @Field()
  name: string;

  @Field(() => WorkspaceType)
  type: WorkspaceType;

  @Field({ nullable: true })
  logo?: string;

  @Field({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  displayName?: string;

  @Field(() => [WorkspaceRole])
  roles: WorkspaceRole[];

  @Field()
  memberId: string;

  @Field({ nullable: true })
  memberColor?: string;
}

@ObjectType()
export class UserPublicInformation {
  @Field()
  _id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field({ nullable: true })
  birthday?: number;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  lastSignInAt?: number;

  @Field(() => [UserAuthProvider])
  providers: UserAuthProvider[];

  @Field(() => [UserMutualWorkspace])
  mutualWorkspaces: UserMutualWorkspace[];
}

export class WorkspaceMemberBranchesDto {
  @IsArray()
  @IsOptional()
  branchIds?: string[];
}

@ObjectType()
export class WorkspaceMemberOnlineStatus {
  @Field(() => String)
  userId: string;

  @Field(() => Boolean)
  isOnline: boolean;
}
