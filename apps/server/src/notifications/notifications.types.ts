import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { WorkspaceEntity } from 'src/workspaces/entities/workspace.entity';
import { NotificationEntity } from './notifications.entity';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum NotificationStatus {
  JUST_CREATED = 'JUST_CREATED',
  LIST_VIEWED = 'LIST_VIEWED',
  READED = 'READED',
}

registerEnumType(NotificationStatus, {
  name: 'NotificationStatus',
  description: 'Status of the notification',
});

export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

registerEnumType(NotificationType, {
  name: 'NotificationType',
  description: 'Type of the notification',
});

export enum NotificationIcon {
  MESSAGE = 'MESSAGE',
}

registerEnumType(NotificationIcon, {
  name: 'NotificationIcon',
  description: 'Icon of the notification',
});

export class CreateNotificationDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  workspaceId: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsObject()
  @IsOptional()
  titleParams?: any;

  @ApiProperty()
  @IsString()
  body: string;

  @ApiProperty()
  @IsObject()
  @IsOptional()
  bodyParams?: any;

  @ApiProperty()
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  route?: string;

  @ApiProperty()
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @ApiProperty()
  @IsEnum(NotificationIcon)
  @IsOptional()
  icon?: NotificationIcon;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  persist?: boolean;
}

export class CreateMutilpleNotificationDto {
  userIds: string[];
  workspaceId: string;
  title: string;
  titleParams?: any;
  body: string;
  bodyParams?: any;
  image?: string;
  route?: string;
  data?: any;
  ignoreUserIds?: string[];
  ignoreAdmin?: boolean;
  type?: NotificationType;
  persist?: boolean;
  icon?: NotificationIcon;
}

export interface SendFcmDto {
  token: string;
  title: string;
  body: string;
  imageUrl?: string;
  route?: string;
  data?: any;
}

export interface SendNotificationInput {
  notification: NotificationEntity;
  token: string;
  deviceId: string;
  note: string;
}

@ObjectType()
export class UserNotificationStat {
  @Field()
  unListViewed: number;

  @Field()
  count: number;
}
