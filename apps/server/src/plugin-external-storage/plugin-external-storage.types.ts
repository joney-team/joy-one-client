import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum PluginExternalStorageProvider {
  AWS_S3 = 'AWS_S3',
}

registerEnumType(PluginExternalStorageProvider, {
  name: 'PluginExternalStorageProvider',
  description: 'Available external storage providers',
});

@InputType()
export class SetPluginExternalStorageInput {
  @Field(() => PluginExternalStorageProvider)
  @IsEnum(PluginExternalStorageProvider)
  provider: PluginExternalStorageProvider;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  accessKeyId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  secretAccessKey?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  region?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  bucketName?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  endpointUrl?: string;
}

@ObjectType()
export class PluginExternalStorage {
  @Field(() => PluginExternalStorageProvider)
  provider: PluginExternalStorageProvider;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  region?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  bucketName?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  endpointUrl?: string;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  size?: number;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isDisabled?: boolean;
}

@InputType()
export class PluginExternalStorageSignUploadUrlInput {
  @Field(() => String)
  @IsString()
  fileName: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  refs?: string[];

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  id?: string;
}

@ObjectType()
export class ExternalStorageFileDnaData {
  @Field(() => String)
  @IsString()
  uploadByUserId: string;

  @Field(() => String)
  @IsString()
  workspaceId: string;

  @Field(() => String)
  @IsString()
  fileId: string;

  @Field(() => String)
  @IsString()
  fileName: string;

  @Field(() => String)
  @IsString()
  fileKey: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  refs?: string[];
}

@ObjectType()
export class SignUploadUrlResponse {
  @Field(() => String)
  @IsString()
  dna: string;

  @Field(() => String)
  @IsString()
  signedUrl: string;
}

@InputType()
export class VerifyExternalStorageDnaInput {
  @Field(() => String)
  @IsString()
  dna: string;
}
