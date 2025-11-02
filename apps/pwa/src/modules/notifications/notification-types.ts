import { BaseMongoEntity } from "@/types";

export enum NotificationIcon {
  MESSAGE = "MESSAGE",
}

export enum NotificationStatus {
  JUST_CREATED = "JUST_CREATED",
  LIST_VIEWED = "LIST_VIEWED",
  READED = "READED",
}

export enum NotificationType {
  INFO = "INFO",
  SUCCESS = "SUCCESS",
  WARNING = "WARNING",
  ERROR = "ERROR",
}

export interface NotificationEntity extends BaseMongoEntity {
  title: string;
  titleParams?: any;
  body: string;
  bodyParams?: any;
  userId: string;
  workspaceId: string;
  route?: string;
  image?: string;
  icon?: NotificationIcon;
  type: NotificationType;
  status: NotificationStatus;
}

export interface UserNotificationStat {
  unListViewed: number;
}
