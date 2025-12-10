"use client";

import { Button } from "@/components/buttons/button";
import { TaskDataFragment } from "@/modules/tasks/graphql/fragmentTask.graphql";
import { zIndexes } from "@joy-one-client/config/layout";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Card, em, Group, Modal, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { IconCopy, IconShare2, IconX } from "@tabler/icons-react";
import { forwardRef, Fragment, ReactNode, useImperativeHandle, useMemo, useState } from "react";

export interface ModalSharelinkRef {
  open: (state: ModalShareLinkArgs) => void;
  close: () => void;
}

interface ModalShareLinkArgs {
  task?: Pick<TaskDataFragment, "_id">;
  url: string;
}

export const ModalSharelink = forwardRef<
  ModalSharelinkRef,
  {
    children?: (ref: ModalSharelinkRef) => ReactNode;
  }
>((props, ref) => {
  const { children } = props;
  const [args, setArgs] = useState<ModalShareLinkArgs | null>(null);
  const clipboard = useClipboard({ timeout: 500 });

  useImperativeHandle(ref, () => ({
    open: (s) => {
      setArgs(s);
    },
    close: () => {
      setArgs(null);
    },
  }));

  const title = useMemo(() => {
    if (args?.task) return t`Share this task`;
    return t`Share`;
  }, [args]);

  const onClose = () => {
    setArgs(null);
  };

  return (
    <Fragment>
      {typeof children === "function"
        ? children({
            open: (s) => {
              setArgs(s);
            },
            close: () => {
              setArgs(null);
            },
          })
        : null}

      <Modal
        opened={!!args}
        onClose={onClose}
        withCloseButton={false}
        zIndex={zIndexes.commonModals + 1}
        yOffset={100}
      >
        {args && (
          <Stack>
            <Group justify="space-between">
              <Group gap={10}>
                <ThemeIcon variant="filled">
                  <IconShare2 size={20} />
                </ThemeIcon>

                <Title order={3} fz={em(15)} fw={500}>
                  {title}
                </Title>
              </Group>

              <Group justify="end">
                <ActionIcon variant="subtle" color="gray" onClick={onClose}>
                  <IconX />
                </ActionIcon>
              </Group>
            </Group>

            <Group justify="space-between" align="end" wrap="nowrap">
              <Stack gap={3} flex={1}>
                <Text fz={em(12)} fw={500}>
                  <Trans>Link</Trans>
                </Text>
                <Card p={5} pl={10} withBorder shadow="none">
                  <Text truncate="end">{args.url}</Text>
                </Card>
              </Stack>

              <Group>
                <Button
                  leftIcon={IconCopy}
                  variant={clipboard.copied ? "filled" : "outline"}
                  onClick={() => clipboard.copy(args.url)}
                >
                  {clipboard.copied ? <Trans>Copied</Trans> : <Trans>Copy</Trans>}
                </Button>
              </Group>
            </Group>
          </Stack>
        )}
      </Modal>
    </Fragment>
  );
});
