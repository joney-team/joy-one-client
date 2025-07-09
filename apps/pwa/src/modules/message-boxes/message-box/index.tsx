"use client";

import { useLayout } from "@/layout/layout-context";
import { Card, Stack } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { FC, useEffect } from "react";
import { useMessageBoxes } from "../message-boxes-context";
import { InputMessageBox } from "./message-box-input";
import { MessageBoxMessages } from "./message-box-messages";

export const MessageBox: FC = () => {
  const messageBoxes = useMessageBoxes();
  const box = messageBoxes.messageBox;
  const layout = useLayout();
  const rootSize = useElementSize();
  const inputSize = useElementSize();

  useEffect(() => {
    if (box?._id) {
      layout.setComponents({
        head: box.senderName,
      });
    }
  }, [box?._id]);

  if (!box) return null;

  const messagesHeight = rootSize.height - inputSize.height;

  return (
    <Stack
      flex={1}
      ref={rootSize.ref}
      gap={0}
      bg={layout.view === "mobile" ? undefined : "var(--mantine-color-dark-outline-hover)"}
      id="message-box"
      pos="relative"
    >
      <Stack
        id="messages"
        flex={1}
        pos="relative"
        style={{ height: messagesHeight, overflow: "hidden" }}
      >
        {messagesHeight > 0 && (
          <MessageBoxMessages key={box._id} box={box} height={messagesHeight} />
        )}
      </Stack>

      <Stack ref={inputSize.ref} pos="absolute" bottom={0} left={0} right={0}>
        <Stack p={layout.view === "mobile" ? 16 : 12}>
          <Card bg="var(--mantine-color-body)" shadow="xs" p={0}>
            <InputMessageBox box={box} />
          </Card>
        </Stack>
      </Stack>
    </Stack>
  );
};
