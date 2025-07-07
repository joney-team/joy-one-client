"use client";

import { Group, Text, ThemeIcon } from "@mantine/core";
import { IconAnalyze } from "@tabler/icons-react";
import { FC } from "react";

interface LoadingProps {
  message?: string;
}

export const Loading: FC<LoadingProps> = (props) => {
  return (
    <Group justify="center" gap={5}>
      <ThemeIcon variant="transparent" color="dark">
        <IconAnalyze size={18} style={{ animation: `animRotate 2s linear infinite` }} />
      </ThemeIcon>

      <Text ta="center" c="dark">
        {props.message || "Đang tải dữ liệu..."}
      </Text>
    </Group>
  );
};
