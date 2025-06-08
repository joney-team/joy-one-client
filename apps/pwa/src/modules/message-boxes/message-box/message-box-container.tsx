import { FlexSize } from "@/components/flex-size";
import { LayoutSplit } from "@/components/layout-split";
import { CommentsIllustration } from "@/components/illustrations/comments";
import { useLayout } from "@/layout/layout-context";
import { t } from "@/modules/lang/lang-service";
import { Stack, Text } from "@mantine/core";
import { FC, useState } from "react";
import { MessageBox } from ".";
import { useMessageBoxes } from "../message-boxes-context";
import { MetadataMessageBox } from "../message-box-metadata";

export const ContainerMessageBox: FC = () => {
  const layout = useLayout();
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
                  borderRight: layout.border,
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
