"use client";

import { t } from "@lingui/core/macro";
import { Card, Stack, Text } from "@mantine/core";
import { FC } from "react";
import { Image } from "./image";

interface LaunchingSoonProps {
  shadow?: "xs" | "sm" | "md" | "lg" | "xl" | "none";
}

export const LaunchingSoon: FC<LaunchingSoonProps> = (props) => {
  const shadow = props.shadow ?? "xs";

  return (
    <Card shadow={shadow}>
      <Stack p={30} justify="center" align="center">
        <Image src="/images/launching-soon.png" alt="Launching Soon" maw={180} />
        <Text ta="center">{t`We are developing this feature, will be launched soon.`}</Text>
      </Stack>
    </Card>
  );
};
