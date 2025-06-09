"use client";

import { FlexSize } from "@/components/flex-size";
import { CommentsIllustration } from "@/components/illustrations/comments";
import { LayoutSplit } from "@/components/layout-split";
import { useWorkspaceLayout } from "@/layout/hooks/use-workspace-layout";
import { t } from "@/modules/lang/lang-service";
import { Stack, Text } from "@mantine/core";
import { FC, useState } from "react";
import { MessageBox } from ".";
import { MetadataMessageBox } from "../message-box-metadata";
import { useMessageBoxes } from "../message-boxes-context";

export const ContainerMessageBox: FC = () => {
  const workspaceLayout = useWorkspaceLayout();
  const messageBoxes = useMessageBoxes();
  const { messageBox } = messageBoxes;
  const [layoutSplit, setLayoutSplit] = useState(0.6);

  return (
    <FlexSize>
      {(rootSize) => {
        if (messageBox) {
          return (
            <LayoutSplit value={layoutSplit} onChange={setLayoutSplit}>
              <Stack
                style={{
                  borderRight: `1px solid ${workspaceLayout.dividerColor}`,
                  height: rootSize.height,
                  overflow: "hidden",
                  width: `${layoutSplit * 100}%`,
                }}
              >
                <MessageBox />
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
              {t("message_box_no_conversations")}
            </Text>
          </Stack>
        );
      }}
    </FlexSize>
  );
};
