"use client";

import { FlexSizeLegacy } from "@/components/flex-size-legacy";
import { CommentsIllustration } from "@/components/illustrations/comments";
import { LayoutSplit } from "@/components/layout-split";
import { Trans } from "@lingui/react/macro";
import { Stack, Text } from "@mantine/core";
import { FC, useState } from "react";
import { MetadataMessageBox } from "../message-box-metadata/message-box-metadata";
import { useMessageBoxes } from "../message-boxes-context";
import { MessageBox } from "./message-box";

export const ContainerMessageBox: FC = () => {
  const messageBoxes = useMessageBoxes();
  const { messageBox } = messageBoxes;
  const [layoutSplit, setLayoutSplit] = useState(0.6);

  return (
    <FlexSizeLegacy>
      {(rootSize) => {
        if (messageBox) {
          return (
            <LayoutSplit value={layoutSplit} onChange={setLayoutSplit}>
              <Stack
                style={{
                  borderRight: `1px solid var(--app-divider-color)`,
                  height: rootSize.height,
                  overflow: "hidden",
                  width: `${layoutSplit * 100}%`,
                }}
              >
                <MessageBox key={messageBox._id} />
              </Stack>

              <Stack
                style={{
                  height: rootSize.height,
                  overflow: "hidden",
                  width: `${(1 - layoutSplit) * 100}%`,
                }}
              >
                <MetadataMessageBox key={messageBox._id} />
              </Stack>
            </LayoutSplit>
          );
        }

        return (
          <Stack flex={1} w="100%" justify="center" align="center">
            <CommentsIllustration width={300} />
            <Text ta="center" c="gray" fz={12}>
              <Trans>Select a conversation to start</Trans>
            </Text>
          </Stack>
        );
      }}
    </FlexSizeLegacy>
  );
};
