"use client";

import { useRouter } from "@/hooks/use-router";
import { onArchive } from "@/utils/actions";
import { Trans } from "@lingui/react/macro";
import { Center, Text } from "@mantine/core";
import { IconArchive } from "@tabler/icons-react";
import { FC, ReactNode } from "react";
import { Button } from "./button";

interface ButtonArchiveProps {
  process: () => Promise<any> | any;
  enabled?: boolean;
  mt?: number;
  name?: string | ReactNode;
  onClick?: () => void;
  onArchived?: () => void;
  goBackWhenArchived?: boolean;
  label?: string;
}

export const ButtonArchive: FC<ButtonArchiveProps> = (props) => {
  const router = useRouter();
  const goBackWhenArchived =
    typeof props.goBackWhenArchived === "boolean" ? props.goBackWhenArchived : true;

  if (props.enabled === false) return null;

  return (
    <Center mt={props.mt}>
      <Button
        size="compact-xs"
        color="gray"
        variant="subtle"
        leftIcon={IconArchive}
        onClick={() => {
          if (props.onClick) return props.onClick();
          if (props.process)
            return onArchive({
              name: props.name,
              process: async () => {
                await props.process?.();
                if (props.onArchived) props.onArchived();
                if (goBackWhenArchived) router.back();
              },
            });
        }}
      >
        {props.label ?? <Trans>Archive</Trans>}
      </Button>
    </Center>
  );
};
