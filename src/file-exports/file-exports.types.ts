import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { AppLocale } from '../lang/lang.types';
import { GraphQLJSONObject } from '../graphql/graphql-type';

export enum FileExportStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  FAILED = 'FAILED',
  FINISHED = 'FINISHED',
}

registerEnumType(FileExportStatus, {
  name: 'FileExportStatus',
});

export enum FileExportContextType {
  CREDIT_REPORT = 'CREDIT_REPORT',
}

registerEnumType(FileExportContextType, {
  name: 'FileExportContextType',
});

export interface CreditReportContextArgs {
  fromTime: number;
  toTime: number;
  workspaceBranchIds?: string[];
}

@InputType()
export class CreateFileExportInput {
  @Field(() => FileExportContextType)
  @IsEnum(FileExportContextType)
  contextType: FileExportContextType;

  @Field(() => GraphQLJSONObject)
  @IsObject()
  contextArgs: Record<string, any>;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  fileName?: string;

  @Field(() => AppLocale, { nullable: true })
  @IsEnum(AppLocale)
  @IsOptional()
  locale?: AppLocale;
}

export interface ProcessFileExportJobData {
  exportId: string;
  workspaceId: string;
}
