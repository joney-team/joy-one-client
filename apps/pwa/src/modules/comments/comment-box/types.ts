import { CommentDto } from "@/modules/comments/comment-types";

export interface CommentBoxProps {
  ref: string,
}

export interface UseCommentBox extends CommentBoxProps {
  send: (dto: CommentDto) => Promise<void>,
  scrollToBottom: (delay?: number, behavior?: ScrollBehavior) => void,
}