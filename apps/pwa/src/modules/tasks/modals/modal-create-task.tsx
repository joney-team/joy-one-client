"use client";

import { Modal } from "@/components/modal/modal";
import { useColor } from "@/modules/theme/use-color";
import { zIndexes } from "@joy-one-client/config/layout";
import { Trans } from "@lingui/react/macro";
import { Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconChevronRight, IconFolder, IconStack2, IconStackPush } from "@tabler/icons-react";
import { forwardRef, Fragment, ReactNode, useImperativeHandle, useMemo, useState } from "react";
import { CreateTaskForm, type CreateTaskFormProps } from "./modal-create-task-form";

export interface ModalCreateTaskRef {
  open: (args?: CreateTaskFormProps) => void;
  close: () => void;
}

export const ModalCreateTask = forwardRef<
  ModalCreateTaskRef,
  {
    children?: (ref: ModalCreateTaskRef) => ReactNode;
  }
>((props, ref) => {
  const color = useColor();
  const [args, setArgs] = useState<CreateTaskFormProps | null>(null);

  useImperativeHandle(ref, () => ({
    open: (a) => {
      setArgs(a ?? {});
    },
    close: () => {
      setArgs(null);
    },
  }));

  const breadcrumbs = useMemo(() => {
    return [
      args?.initial?.folder && (
        <Group color={args?.initial?.folder?.color ?? "dark"} gap={5}>
          <IconFolder size={18} color={color(args?.initial?.folder?.color ?? "dark")} />
          <Text fz={13} fw={400}>
            {args?.initial?.folder.name}
          </Text>
        </Group>
      ),
      args?.initial?.parent && (
        <Group gap={5}>
          <IconStack2 size={18} color={color("dark")} />
          <Text fz={13} fw={400}>
            {args?.initial?.parent?.name}
          </Text>
        </Group>
      ),
      <Text fz={13} fw={400} c="gray">
        <Trans>New Task</Trans>
      </Text>,
    ].filter(Boolean);
  }, [args]);

  return (
    <Fragment>
      {typeof props.children === "function"
        ? props.children({
            open: (a) => {
              setArgs(a ?? {});
            },
            close: () => {
              setArgs(null);
            },
          })
        : null}

      <Modal
        id="modal-create-task"
        name={<Trans>Create task</Trans>}
        icon={IconStackPush}
        isFullscreenOnMobile
        opened={!!args}
        onClose={() => {
          setArgs(null);
        }}
        size={600}
        zIndex={zIndexes.commonModals + 1}
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        <Stack gap={16} pb={20} pt={8}>
          {breadcrumbs.length > 1 && (
            <Group gap={0} px={20}>
              {breadcrumbs.map((breadcrumb, index) => (
                <Fragment key={index}>
                  {breadcrumb}
                  {index < breadcrumbs.length - 1 && (
                    <ThemeIcon variant="transparent" color="gray" size="sm">
                      <IconChevronRight size={14} />
                    </ThemeIcon>
                  )}
                </Fragment>
              ))}
            </Group>
          )}

          {args && <CreateTaskForm {...args} onClose={() => setArgs(null)} />}
        </Stack>
      </Modal>
    </Fragment>
  );
});
