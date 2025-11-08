"use client";

import { onActionLoad } from "@/utils/actions";
import { CommentDto, CommentEntity, QueryComments } from "./comment-types";
import { api } from "../apis";
import { ResponseList } from "@/types";
import { Trans } from "@lingui/react/macro";

export async function createComment(dto: CommentDto) {
  return api.post(`/comments`, dto);
}

export async function getComments(query?: QueryComments) {
  return api.get<ResponseList<CommentEntity>>(`/comments`, { params: query });
}

export async function updateComment(_id: string, dto: CommentDto) {
  return api.put(`/comments/${_id}`, dto);
}

export async function pinComment(_id: string) {
  return api.put(`/comments/${_id}/pin`);
}

export async function unpinComment(_id: string) {
  return api.put(`/comments/${_id}/unpin`);
}

export async function removeComment(_id: string) {
  return onActionLoad({
    name: <Trans>Remove comment</Trans>,
    process: () => api.delete(`/comments/${_id}`),
  });
}
