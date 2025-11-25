"use client";

import { useColor } from "@/modules/theme/use-color";
import { ActionIcon, Box, Grid, Group, Stack, Text } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { IconCopy, IconCopyCheck } from "@tabler/icons-react";

export const LoanRowInfo = <
  T extends string | number | unknown[] | Record<string, any> | undefined
>(props: {
  label: string | JSX.Element;
  description?: string;
  value: T;
  renderValue?: (value: T) => JSX.Element | string;
  copy?: boolean;
  visible?: boolean;
}): JSX.Element | null => {
  const clipboard = useClipboard();
  const color = useColor();

  if (props.visible === false) return null;

  return (
    <Grid>
      <Grid.Col span={4}>
        <Stack gap={5}>
          <Text fz={15} fw={600}>
            {props.label}
          </Text>
          {!!props.description && (
            <Text fz={12} fw={400} c="gray">
              {props.description}
            </Text>
          )}
        </Stack>
      </Grid.Col>

      <Grid.Col span="auto">
        <Group gap={10}>
          {props.renderValue ? (
            <Box>{props.renderValue(props.value)}</Box>
          ) : (
            <Text>{String(props.value) || "--"}</Text>
          )}

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
