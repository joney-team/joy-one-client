"use client";

import { Button } from "@/components/buttons/button";
import { useColor } from "@/modules/theme/use-color";
import { Trans } from "@lingui/react/macro";
import { Divider, Group, Modal, Stack, ThemeIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconAlertTriangle } from "@tabler/icons-react";
import { FC, Fragment, ReactNode, useRef } from "react";

interface ModalConfirmArgs {
  children: ReactNode;
  onConfirm: () => Promise<void>;
  onCancel?: () => void;
  confirmLabel?: ReactNode;
  color?: string;
}

export const ModalConfirm: FC<{
  children: (open: (args: ModalConfirmArgs) => void) => ReactNode;
}> = ({ children }) => {
  const color = useColor();
  const [opened, { open, close }] = useDisclosure(false);
  const argsRef = useRef<ModalConfirmArgs | null>(null);

  const onConfirm = async () => {
    await argsRef.current?.onConfirm();
    close();
  };

  return (
    <Fragment>
      {children((args) => {
        argsRef.current = args;
        open();
      })}

      <Modal
        opened={opened}
        onClose={close}
        withCloseButton={false}
        centered
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        <Stack align="stretch" gap={0}>
          <Group p="md" wrap="nowrap">
            <ThemeIcon color={color(argsRef.current?.color)} variant="light" size="xl">
              <IconAlertTriangle />
            </ThemeIcon>
            <Stack>{argsRef.current?.children}</Stack>
          </Group>
          <Divider miw="100%" opacity={0.5} />
          <Group justify="end" p="md">
            <Button color="gray" variant="outline" onClick={close}>
              <Trans>Cancel</Trans>
            </Button>
            <Button color={color(argsRef.current?.color)} onClick={onConfirm}>
              {argsRef.current?.confirmLabel ?? <Trans>Confirm</Trans>}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Fragment>
  );
};
