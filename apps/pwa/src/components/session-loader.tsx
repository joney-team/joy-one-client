import { Skeleton, Stack } from "@mantine/core";
import { FC } from "react";

interface SessionLoaderProps {
  enabled?: boolean;
}

export const SessionLoader: FC<SessionLoaderProps> = (props) => {
  if (props.enabled === false) return null;

  return (
    <Stack>
      <Skeleton height={150} />
    </Stack>
  );
};
