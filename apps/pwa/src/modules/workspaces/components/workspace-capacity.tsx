"use client";

import { apiClient } from "@/modules/apis";
import { FileCapacity } from "@/modules/files/file-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { formatBytes } from "@/utils/file.utils";
import { round } from "@/utils/number.utils";
import { Group, Stack, Text, em } from "@mantine/core";
import dynamic from "next/dynamic";
import { FC, useEffect, useState } from "react";

const PieChart = dynamic(() => import("@mantine/charts").then((mod) => mod.PieChart), {
  ssr: false,
});

export const WorkspaceCapacity: FC = () => {
  const [capacity, setCapacity] = useState<FileCapacity>();
  const workspace = useWorkspace();

  const fetchCapacity = async () => {
    await apiClient
      .get(`/files/capacity/workspace`)
      .then((res) => setCapacity(res))
      .catch(console.error);
  };

  useEffect(() => {
    fetchCapacity();
  }, [workspace.member.workspaceId]);

  if (!capacity) return null;

  return (
    <Group justify="center" py={16}>
      <Group align="center" gap={10}>
        <PieChart
          size={60}
          data={[
            {
              name: "Còn lại",
              value: 100 - round((capacity.totalSizeInBytes * 100) / capacity.limitSizeInBytes, 1),
              color: "primary",
            },
            {
              name: "Đã dùng",
              value: round((capacity.totalSizeInBytes * 100) / capacity.limitSizeInBytes, 1),
              color: "red.8",
            },
          ]}
        />

        <Stack gap={3}>
          <Text fz={em(10)}>Dung lượng lưu trữ</Text>
          <Text ta="right" fw={500} fz={em(13)}>
            {formatBytes(capacity.totalSizeInBytes)} / {formatBytes(capacity.limitSizeInBytes)}
          </Text>
        </Stack>
      </Group>
    </Group>
  );
};
