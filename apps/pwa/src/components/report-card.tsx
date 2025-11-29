"use client";

import { useGradient } from "@/modules/theme/use-color";
import { Card, Group, Skeleton, Stack, Text } from "@mantine/core";
import { Icon, IconReportAnalytics } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { FC } from "react";

const Sparkline = dynamic(() => import("@mantine/charts").then((mod) => mod.Sparkline), {
  ssr: false,
  loading: () => <Skeleton height={200} />,
});

interface ReportCardProps {
  icon?: Icon;
  name: string;
  value: any;
  sparkline?: number[];
}

export const ReportCard: FC<ReportCardProps> = (props) => {
  const Icon = props.icon || IconReportAnalytics;
  const gradient = useGradient();
  const isShowSparkline =
    props.sparkline && !props.sparkline.every((v) => v === 0) && props.sparkline.length > 1;

  return (
    <Card
      style={{
        background: gradient(),
        cursor: "pointer",
      }}
      flex={1}
      p={10}
      shadow="xs"
    >
      <Group justify="space-between" wrap="nowrap">
        <Group wrap="nowrap">
          <Icon size={40} strokeWidth={0.9} color="white" />
          <Stack gap={0}>
            <Text c="white" fz={12} fw={300}>
              {props.name}
            </Text>
            <Text c="white" fw={700} fz={16}>
              {props.value}
            </Text>
          </Stack>
        </Group>

        {isShowSparkline && (
          <Sparkline
            w={100}
            h={50}
            data={props.sparkline!}
            curveType="monotone"
            color="white"
            fillOpacity={0.6}
            strokeWidth={2}
          />
        )}
      </Group>
    </Card>
  );
};
