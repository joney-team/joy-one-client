import { onActionLoad } from "@/utils/actions";
import { MainRequest } from "../requests/main.request";
import { CommentDto, QueryComments } from "./comment-types";

export async function createComment(dto: CommentDto) {
  return MainRequest.post(`/comments`, dto);
}

export async function getComments(query?: QueryComments) {
  return MainRequest.get(`/comments`, query);
}

export async function updateComment(_id: string, dto: CommentDto) {
  return MainRequest.put(`/comments/${_id}`, dto);
}

export async function pinComment(_id: string) {
  return MainRequest.put(`/comments/${_id}/pin`);
}

export async function unpinComment(_id: string) {
  return MainRequest.put(`/comments/${_id}/unpin`);
}

export async function removeComment(_id: string) {
  return onActionLoad({
    name: "Xoá bình luận",
    process: () => MainRequest.delete(`/comments/${_id}`),
  });
}