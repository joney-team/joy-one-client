import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export enum FileType {
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  PDF = 'PDF',
  MS_WORD = 'MS_WORD',
  MS_EXCEL = 'MS_EXCEL',
  MS_POWERPOINT = 'MS_POWERPOINT',
  UNKNOWN = 'UNKNOWN',
}

registerEnumType(FileType, {
  name: 'FileType',
  description: 'Available file types',
});

export type FileTypes = {
  [key in FileType]: string[];
};

export class FileDto {
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  ref?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  refs?: string[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  relatedCustomerId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  relatedTicketId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  relatedTaskId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  relatedReceiptId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  relatedMessageId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  relatedProductId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  relatedHrmTimekeepingId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  relatedEntities?: string;
}

export interface FileCapacity {
  totalSizeInBytes: number;
  totalSizeInString: string;
  count: number;
  limitSizeInBytes: number;
}

export class UploadExternalFileDto {
  @ApiProperty()
  @IsString()
  url: string;
}

@ObjectType()
export class FileDnaData {
  @Field()
  uploadByUserId: string;

  @Field()
  workspaceId: string;

  @Field()
  fileId: string;

  @Field()
  fileName: string;

  @Field()
  @IsString()
  fileKey: string;

  @Field(() => [String], { nullable: true })
  refs?: string[];

  /**
   * The timestamp (in seconds since epoch) when this file DNA expires.
   */
  expireAt?: number;
}

@InputType()
export class SignUploadInput {
  @Field()
  @IsString()
  fileName: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  refs?: string[];

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  id?: string;
}

@InputType()
export class VerifyFileDnaInput {
  @Field(() => String)
  @IsString()
  dna: string;
}

@ObjectType()
export class FileUploadSigned {
  @Field()
  signedUrl: string;

  @Field()
  dna: string;

  @Field()
  isUseExternalStorage: boolean;
}
