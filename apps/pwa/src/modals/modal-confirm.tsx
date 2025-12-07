"use client";

import { Button } from "@/components/buttons/button";
import { useColor } from "@/modules/theme/use-color";
import { Trans } from "@lingui/react/macro";
import { Divider, Group, Modal, ModalProps, Stack, ThemeIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconAlertTriangle, type Icon as TablerIcon } from "@tabler/icons-react";
import { forwardRef, Fragment, ReactNode, useImperativeHandle, useRef } from "react";

interface ModalConfirmArgs {
  children: ReactNode;
  onConfirm: () => Promise<void | unknown> | void | unknown;
  onCancel?: () => void;
  confirmLabel?: ReactNode;
  color?: string;
  customModalProps?: Partial<ModalProps>;
  icon?: TablerIcon;
}

export interface ModalConfirmRef {
  open: (args: ModalConfirmArgs) => void;
}

interface ModalConfirmProps {
  children?: (open: (args: ModalConfirmArgs) => void) => ReactNode;
}

export const ModalConfirm = forwardRef<ModalConfirmRef, ModalConfirmProps>((props, ref) => {
  const { children } = props;
  const color = useColor();
  const [opened, { open, close }] = useDisclosure(false);
  const argsRef = useRef<ModalConfirmArgs | null>(null);

  const handleOpen = (args: ModalConfirmArgs) => {
    argsRef.current = args;
    open();
  };

  useImperativeHandle(ref, () => ({
    open: handleOpen,
  }));

  const onConfirm = async () => {
    await argsRef.current?.onConfirm();
    close();
  };

  const onCancel = () => {
    argsRef.current?.onCancel?.();
    close();
  };

  const IconComponent = argsRef.current?.icon || IconAlertTriangle;
  const modalColor = color(argsRef.current?.color ?? "orange");

  return (
    <Fragment>
      {typeof children === "function" ? children(handleOpen) : null}

      <Modal
        opened={opened}
        onClose={onCancel}
        withCloseButton={false}
        centered
        styles={{
          body: {
            padding: 0,
          },
        }}
        {...argsRef.current?.customModalProps}
      >
        <Stack align="stretch" gap={0}>
          <Group p="md" wrap="nowrap" align="start">
            <ThemeIcon color={modalColor} variant="light" size="xl">
              <IconComponent />
            </ThemeIcon>
            <Stack>{argsRef.current?.children}</Stack>
          </Group>
          <Divider miw="100%" opacity={0.5} />
          <Group justify="end" p="sm" gap="sm">
            <Button color="gray" variant="outline" onClick={onCancel} component="div">
              <Trans>Cancel</Trans>
            </Button>
            <Button color={modalColor} onClick={onConfirm}>
              {argsRef.current?.confirmLabel ?? <Trans>Confirm</Trans>}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Fragment>
  );
});

ModalConfirm.displayName = "ModalConfirm";
