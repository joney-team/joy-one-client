"use client";

import { Button } from "@/components/buttons/button";
import { useColor } from "@/modules/theme/use-color";
import { useColorScheme } from "@/modules/theme/use-color-scheme";
import { onError } from "@/utils/exceptions.utils";
import { zIndexes } from "@joy-one/config/layout";
import { Trans } from "@lingui/react/macro";
import { Divider, Group, Stack, ThemeIcon, Title } from "@mantine/core";
import { modals } from "@mantine/modals";
import { Icon, IconAlertTriangleFilled } from "@tabler/icons-react";
import { Fragment, ReactNode, useMemo } from "react";

interface UseConfirmModalArgs {
  content: ReactNode;
  onConfirm: () => Promise<void | unknown> | void | unknown;
  icon?: Icon;
  type?: "warning" | "danger" | "success";
  title?: ReactNode;
  onCancel?: () => void;
  confirmLabel?: string | ReactNode;
  cancelLabel?: string | ReactNode;
  inverse?: boolean;
}

const Content = ({
  content,
  onConfirm,
  onCancel,
  title,
  icon,
  confirmLabel,
  cancelLabel,
  type = "warning",
  inverse = false,
  onClose,
}: UseConfirmModalArgs & { onClose: () => void }) => {
  const color = useColor();
  const colorScheme = useColorScheme();

  const Icon = icon || IconAlertTriangleFilled;

  const modalColor = useMemo(() => {
    if (type === "success") return color({ light: "green", dark: "green.9" });
    if (type === "warning") return color({ light: "orange", dark: "orange.9" });
    if (type === "danger") return color({ light: "red", dark: "red.9" });
    return color({ light: "gray", dark: "gray.9" });
  }, [type, color]);

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      onError(error);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  return (
    <Stack gap={0}>
      <Group wrap="nowrap" align="start" p="md">
        <ThemeIcon
          color={modalColor}
          variant={colorScheme === "light" ? "light" : "filled"}
          size="xl"
        >
          <Icon />
        </ThemeIcon>

        <Stack gap={6}>
          <Title order={4} fw={600} c={modalColor}>
            {title ?? <Trans>Confirmation</Trans>}
          </Title>
          {content}
        </Stack>
      </Group>

      <Divider />

      <Group
        w="100%"
        px={16}
        py={12}
        justify="end"
        gap={12}
        bg={color({ light: "gray.0", dark: "dark.6" })}
      >
        {inverse ? (
          <Fragment>
            <Button
              color={color({ light: "dark", dark: "gray.6" })}
              variant="outline"
              onClick={handleConfirm}
            >
              {confirmLabel ?? <Trans>Confirm</Trans>}
            </Button>

            <Button color="dark" onClick={handleCancel}>
              {cancelLabel ?? <Trans>Cancel</Trans>}
            </Button>
          </Fragment>
        ) : (
          <Fragment>
            <Button variant="outline" color="gray" onClick={handleCancel}>
              {cancelLabel ?? <Trans>Cancel</Trans>}
            </Button>
            <Button color={modalColor} onClick={handleConfirm}>
              {confirmLabel ?? <Trans>Confirm</Trans>}
            </Button>
          </Fragment>
        )}
      </Group>
    </Stack>
  );
};

export const onConfirmModal = (args: UseConfirmModalArgs) => {
  const modalId = `confirm-modal-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

  return modals.open({
    modalId,
    withCloseButton: false,
    closeOnEscape: false,
    closeOnClickOutside: false,
    children: <Content {...args} onClose={() => modals.close(modalId)} />,
    styles: {
      body: {
        padding: 0,
      },
    },
    zIndex: zIndexes.modalConfirmation,
  });
};
