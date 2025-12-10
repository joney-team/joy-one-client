"use client";

import { Editor } from "@/components/editor/editor";
import { Stack } from "@mantine/core";

export default function Page() {
  return (
    <Stack p={30}>
      <Editor />
    </Stack>
  );
}
