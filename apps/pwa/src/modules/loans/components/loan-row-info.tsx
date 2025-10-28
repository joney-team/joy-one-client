"use client";

import { useColor } from "@/modules/theme/use-color";
import { ActionIcon, em, Grid, Group, Stack, Text } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { IconCopy, IconCopyCheck } from "@tabler/icons-react";
import { FC } from "react";

export const LoanRowInfo: FC<{
  label: string;
  description?: string;
  value: string | JSX.Element;
  copy?: boolean;
  visible?: boolean;
}> = (props) => {
  const clipboard = useClipboard();
  const color = useColor();

  if (props.visible === false) return null;

  return (
    <Grid>
      <Grid.Col span={4}>
        <Stack gap={5}>
          <Text fz={em(15)} fw={700} c="gray">
            {props.label}
          </Text>
          {!!props.description && (
            <Text fz={em(12)} fw={400} c="gray">
              {props.description}
            </Text>
          )}
        </Stack>
      </Grid.Col>

      <Grid.Col span="auto">
        <Group gap={10}>
          {typeof props.value === "string" ? <Text>{props.value || "--"}</Text> : props.value}

          {props.copy && (
            <ActionIcon
              variant="subtle"
              color={clipboard.copied ? color("primary") : "gray"}
              size="sm"
              onClick={() => clipboard.copy(props.value)}
            >
              {clipboard.copied ? <IconCopyCheck size={16} /> : <IconCopy size={16} />}
            </ActionIcon>
          )}
        </Group>
      </Grid.Col>
    </Grid>
  );
};
