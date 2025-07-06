"use client";

import { Stack } from "@mantine/core";
import { type FC } from "react";
import { FormPost } from "./components/form-post";
import { useRouter } from "@/hooks/use-router";

export const PostNew: FC = () => {
  const router = useRouter();
  return (
    <Stack p={16}>
      <FormPost onSuccess={(post) => router.replace(`/posts/${post._id}/edit`)} />
    </Stack>
  );
};
