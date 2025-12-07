"use client";

import { Errored } from "@/components/errored";
import { PageLazyLoad } from "@/components/lazy-load";
import { Stack } from "@mantine/core";
import { useParams } from "next/navigation";
import { type FC } from "react";
import { useRestQuery } from "../apis/use-rest-query";
import { FormPost } from "./components/form-post";
import { PostEntity } from "./posts-types";
import { EventType } from "@/graphql/enums.graphql";

export const PostDetail: FC = () => {
  const params = useParams();
  const id = params.id as string;

  const post = useRestQuery<PostEntity>({
    route: `/posts/${id}`,
    refetchEvents: [EventType.PostUpdated],
  });

  if (post.isLoading) return <PageLazyLoad />;
  if (post.error || !post.data) return <Errored error={post.error} />;

  return (
    <Stack p={16}>
      <FormPost post={post.data} />
    </Stack>
  );
};
