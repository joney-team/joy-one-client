import { BaseMongoEntity } from "@/types";
import { WorkspaceMemberDataFragment } from "../workspace-members/graphql/fragmentWorkspaceMember.graphql";

export enum MessageBoxPlatformType {
  ZALO = "ZALO",
  META_PAGE = "META_PAGE",
  MESSAGE_HUB = "MESSAGE_HUB",
}

export enum MessageBoxStatus {
  WAITING = "WAITING",
  IN_PROGRESS = "IN_PROGRESS",
  CLOSED = "CLOSED",
  EXPIRED = "EXPIRED",
}

export interface MessageBoxEntity extends BaseMongoEntity {
  ref: string;
  workspaceId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  customerId?: string;
  platformId?: string;
  platformType: MessageBoxPlatformType;
  lastInteractionAt?: number;
  status?: MessageBoxStatus;
  user?: WorkspaceMemberDataFragment;
  customer?: any;
  assigneeUserId?: string;
  assigneeUser?: WorkspaceMemberDataFragment;
  aiAssistantconversationId?: string;
  aiAssistantDisabled?: boolean;
  latestMessage?: MessageEntity | null;
}

export interface MessageAttachment {
  type: MessageAttachmentType;
  url?: string;
  raw?: any;
}

export enum MessageAttachmentType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  FILE = "FILE",
  UNKNOWN = "UNKNOWN",
  STICKER = "STICKER",
}

export interface SendMemberTextMessageDto {
  text?: string;
}

export interface SendMemberImageMessageDto {
  url: string;
  text?: string;
}

export interface SendMemberFileMessageDto {
  url: string;
  text?: string;
}

export enum MessageType {
  RECEIVE = "RECEIVE",
  SEND = "SEND",
}

export enum MessageStatus {
  PENDING = "PENDING",
  SENT = "SENT",
  READED = "READED",
  SENT_FAILED = "SENT_FAILED",
}

export interface MessageEntity extends BaseMongoEntity {
  id?: string;
  resource?: MessageResource;
  type: MessageType;
  boxId: string;
  userId?: string;
  senderId?: string;
  text?: string;
  attachments?: MessageAttachment[];
  user?: WorkspaceMemberDataFragment;
  status?: MessageStatus;
}

export enum MessageResource {
  WEBHOOK = "webhook",
  INTERNAL = "internal",
  AI_ASSISTANT = "ai-assistant",
}
