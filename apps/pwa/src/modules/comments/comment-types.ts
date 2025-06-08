import type { BaseMongoEntity, Query } from "@/types";
import type { MessageAttachment } from "@/modules/message-boxes/message-boxes-types";
import type { WorkspaceMember } from "@/modules/workspace-members/workspace-members-types";

export interface CommentDto {
  text?: string;
  ref?: string;
  attachments?: MessageAttachment[];
  customerId?: string;
  ticketId?: string;
  bookingId?: string;
  replyToCommentId?: string;
}

export interface CommentEntity extends BaseMongoEntity {
  text?: string;
  ref?: string;
  attachments?: MessageAttachment[];
  workspaceId: string;
  customerId?: string;
  bookingId?: string;
  ticketId?: string;
  replyToCommentId?: string;
  pinnedByUser?: WorkspaceMember;
  isPinned?: boolean;
  createdByUserId: string;
  createdByUser?: WorkspaceMember;
}

export interface QueryComments extends Query {
  ref?: string;
  customerId?: string;
  bookingId?: string;
  ticketId?: string;
  replyToCommentId?: string;
  createdAt?: number;
  pinned?: boolean;
}