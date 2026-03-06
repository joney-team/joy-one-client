"use client";

import { Button } from "@/components/buttons/button";
import { Modal } from "@/components/modal/modal";
import { useColor } from "@/modules/theme/use-color";
import { Trans } from "@lingui/react/macro";
import { Divider, Group, ModalProps, Stack, ThemeIcon } from "@mantine/core";
import { IconAlertTriangle, type Icon as TablerIcon } from "@tabler/icons-react";
import { forwardRef, Fragment, ReactNode, useImperativeHandle, useState } from "react";

interface ModalConfirmArgs {
  content: ReactNode;
  onConfirm: () => Promise<void | unknown> | void | unknown;
  onCancel?: () => void;
  confirmLabel?: ReactNode;
  color?: string;
  customModalProps?: Partial<ModalProps>;
  icon?: TablerIcon;
}

export interface ModalConfirmRef {
  open: (args: ModalConfirmArgs) => void;
  close: () => void;
}

interface ModalConfirmProps {
  children?: (ref: ModalConfirmRef) => ReactNode;
}

export const ModalConfirm = forwardRef<ModalConfirmRef, ModalConfirmProps>((props, ref) => {
  const { children } = props;
  const color = useColor();
  const [args, setArgs] = useState<ModalConfirmArgs | null>(null);

  const handleOpen = (args: ModalConfirmArgs) => {
    setArgs(args);
  };

  useImperativeHandle(ref, () => ({
    open: handleOpen,
    close: () => {
      setArgs(null);
    },
  }));

  const onConfirm = async () => {
    if (!args) return;
    await args?.onConfirm();
    setArgs(null);
  };

  const onCancel = () => {
    args?.onCancel?.();
    setArgs(null);
  };

  const IconComponent = args?.icon || IconAlertTriangle;
  const modalColor = color(args?.color ?? "orange");

  return (
    <Fragment>
      {children?.({
        open: handleOpen,
        close: () => {
          setArgs(null);
        },
      })}

      <Modal
        opened={!!args}
        onClose={onCancel}
        withCloseButton={false}
        closeOnClickOutside={false}
        styles={{
          body: {
            padding: 0,
          },
        }}
        {...args?.customModalProps}
      >
        {args && (
          <Stack align="stretch" gap={0}>
            <Group p={26} wrap="nowrap" align="start">
              <Group style={{ border: `1.5px solid ${modalColor}`, borderRadius: 14 }} p={3}>
                <ThemeIcon color={modalColor} variant="light" size="xl" radius={10}>
                  <IconComponent />
                </ThemeIcon>
              </Group>
              <Stack>{args.content}</Stack>
            </Group>
            <Divider miw="100%" opacity={0.5} />
            <Group justify="end" p="md" gap="sm" bg="var(--mantine-color-dark-outline-hover)">
              <Button miw={100} color="gray" variant="outline" onClick={onCancel} component="div">
                <Trans>Cancel</Trans>
              </Button>
              <Button miw={100} color={modalColor} onClick={onConfirm}>
                {args.confirmLabel ?? <Trans>Confirm</Trans>}
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Fragment>
  );
});

ModalConfirm.displayName = "ModalConfirm";
