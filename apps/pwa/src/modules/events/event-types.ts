import { EventType } from "@/graphql/enums.graphql";
import { BaseMongoEntity, Query } from "@/types";
import { WorkspaceMemberDataFragment } from "../workspace-members/graphql/fragmentWorkspaceMember.graphql";

export enum EventVariant {
  INFO = "INFO",
  WARNING = "WARNING",
  NEGATIVE = "NEGATIVE",
  POSITIVE = "POSITIVE",
}

export enum EventChannel {
  WORKSPACE = "WORKSPACE",
  PERSONAL = "PERSONAL",
  NONE = "NONE",
}

export enum EventDataActionType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  ARCHIVED = "ARCHIVED",
}

export interface EventEntity extends BaseMongoEntity {
  channel: EventChannel;
  type: EventType;
  actionType?: EventDataActionType;
  time: number;
  ref?: string;
  workspaceId?: string;
  variant?: EventVariant;
  userId?: string;
  user?: WorkspaceMemberDataFragment;
  data?: any;
  sessionId?: string;
}

export interface QueryEvents extends Query {
  type?: EventType | EventType[];
  userId?: string;
  ref?: string;
}

export interface UserEventDto {
  userId: string;
  eventName: string;
  data?: any;
}
