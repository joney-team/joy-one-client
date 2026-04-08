"use client";

import { Errored } from "@/components/errored";
import { useLayout } from "@/layout/layout-context";
import { useQuery } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import { Card, Group, Skeleton, Stack, Title } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { FC, useEffect } from "react";
import GetMessageBoxByIdDocument from "../graphql/getMessageBoxById.graphql";
import { MetadataMessageBox } from "../message-box-metadata/message-box-metadata";
import { MessageBoxHead } from "./message-box-head";
import { InputMessageBox } from "./message-box-input";
import { MessageBoxMessages } from "./message-box-messages";

export const MessageBox: FC<{ boxId: string }> = ({ boxId }) => {
  const layout = useLayout();
  const rootSize = useElementSize();
  const inputSize = useElementSize();

  const { data, error } = useQuery(GetMessageBoxByIdDocument, {
    variables: { messageBoxId: boxId },
    fetchPolicy: "cache-and-network",
  });

  const messageBox = data?.messageBox;

  useEffect(() => {
    if (messageBox?._id) {
      layout.setComponents({
        head: (
          <Title order={5} fw={500}>
            <Trans>Message</Trans>
          </Title>
        ),
      });
    }
  }, [messageBox?._id]);

  if (error) {
    return <Errored error={error} p="lg" />;
  }

  if (!messageBox) {
    return <Skeleton h="100%" w="100%" />;
  }

  const messagesHeight = rootSize.height - inputSize.height;

  if (layout.view === "mobile") {
    return (
      <Stack
        gap={0}
        id="message-box"
        pos="relative"
        h="calc(100dvh - var(--app-layout-header-height))"
      >
        <MessageBoxHead key={messageBox._id} box={messageBox} />

        <Stack ref={rootSize.ref} flex={1} h="100%" mih={0} pos="relative">
          <Stack
            id="messages"
            flex={1}
            pos="relative"
            style={{ height: messagesHeight, overflow: "auto" }}
          >
            {messagesHeight > 0 && (
              <MessageBoxMessages key={messageBox._id} box={messageBox} height={messagesHeight} />
            )}
          </Stack>

          <Stack ref={inputSize.ref} pos="absolute" bottom={0} left={0} right={0}>
            <Stack
              p={layout.view === "mobile" ? "md" : "sm"}
              pb={layout.isStandalone && !layout.isAndroid ? 36 : undefined}
            >
              <Card bg="var(--mantine-color-body)" shadow="xs" p={0}>
                <InputMessageBox key={messageBox._id} box={messageBox} />
              </Card>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack
      flex={1}
      gap={0}
      bg="var(--mantine-color-dark-outline-hover)"
      id="message-box"
      pos="relative"
      h="100%"
      mih={0}
    >
      <MessageBoxHead key={messageBox._id} box={messageBox} />

      <Group gap={0} flex={1} mih={0} w="100%" miw={0}>
        <Stack ref={rootSize.ref} flex={1} h="100%" mih={0} pos="relative">
          <Stack
            id="messages"
            flex={1}
            pos="relative"
            style={{ height: messagesHeight, overflow: "auto" }}
          >
            {messagesHeight > 0 && (
              <MessageBoxMessages key={messageBox._id} box={messageBox} height={messagesHeight} />
            )}
          </Stack>

          <Stack ref={inputSize.ref} pos="absolute" bottom={0} left={0} right={0}>
            <Stack p="sm">
              <Card bg="var(--mantine-color-body)" shadow="xs" p={0}>
                <InputMessageBox key={messageBox._id} box={messageBox} />
              </Card>
            </Stack>
          </Stack>
        </Stack>

        <Stack
          h="100%"
          mih={0}
          bg="var(--app-panel-background)"
          style={{
            overflow: "hidden",
            width: "400px",
          }}
        >
          <MetadataMessageBox key={messageBox._id} box={messageBox} />
        </Stack>
      </Group>
    </Stack>
  );
};
