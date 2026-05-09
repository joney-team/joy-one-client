import { IsEnum, IsOptional, IsString } from 'class-validator';
import { WorkspaceType } from '../workspaces/workspaces.types';

export class SetupInheritInput {
  @IsString()
  inheritKey: string;

  @IsString()
  workspaceName: string;

  @IsString()
  workspaceCode: string;

  @IsEnum(WorkspaceType)
  workspaceType: WorkspaceType;

  @IsString()
  @IsOptional()
  appDomain?: string;

  @IsString()
  @IsOptional()
  appColor?: string;

  @IsString()
  @IsOptional()
  appName?: string;
}
