"use client";

import { Errored } from "@/components/errored";
import { PageLazyLoad } from "@/components/lazy-load";
import { Stack } from "@mantine/core";
import { useParams } from "next/navigation";
import { type FC } from "react";
import { useQuery } from "../apis/use-query";
import { EventType } from "../events/event-types";
import { FormPost } from "./components/form-post";
import { PostEntity } from "./posts-types";

export const PostDetail: FC = () => {
  const params = useParams();
  const id = params.id as string;

  const post = useQuery<PostEntity>({
    route: `/posts/${id}`,
    refetchEvents: [EventType.POST_UPDATED],
  });

  if (post.isLoading) return <PageLazyLoad />;
  if (post.error || !post.data) return <Errored error={post.error} />;

  return (
    <Stack p={16}>
      <FormPost post={post.data} />
    </Stack>
  );
};
