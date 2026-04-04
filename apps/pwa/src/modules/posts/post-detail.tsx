"use client";

import { Errored } from "@/components/errored";
import { PageLazyLoad } from "@/components/lazy-load";
import { useQuery } from "@apollo/client/react";
import { Stack } from "@mantine/core";
import { useParams } from "next/navigation";
import { type FC } from "react";
import { FormPost } from "./components/form-post";
import GetPostByIdDocument from "./graphql/getPostById.graphql";

export const PostDetail: FC = () => {
  const params = useParams<{ id: string }>();

  const { data, loading, error } = useQuery(GetPostByIdDocument, {
    variables: { postId: params.id },
    fetchPolicy: "cache-and-network",
  });

  if (loading && !data) return <PageLazyLoad />;
  if (error || !data) return <Errored error={error} />;

  return (
    <Stack p="md">
      <FormPost post={data.post} />
    </Stack>
  );
};
