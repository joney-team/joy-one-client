import type { BaseMongoEntity, Query } from "@/types";
import type { MessageAttachment } from "@/modules/message-boxes/message-boxes-types";
import type { WorkspaceMemberLegacy } from "@/modules/workspace-members/workspace-members-types";

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
  pinnedByUser?: WorkspaceMemberLegacy;
  isPinned?: boolean;
  createdByUserId: string;
  createdByUser?: WorkspaceMemberLegacy;
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
