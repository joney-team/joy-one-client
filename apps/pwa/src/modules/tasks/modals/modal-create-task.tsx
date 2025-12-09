"use client";

import { ModalTitle } from "@/components/modal-title";
import { useLayout } from "@/layout/layout-context";
import { useColor } from "@/modules/theme/use-color";
import { zIndexes } from "@joy-one-client/config/layout";
import { Trans } from "@lingui/react/macro";
import { Group, Modal, Skeleton, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconChevronRight, IconFolder, IconStack2, IconStackPush } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { forwardRef, Fragment, ReactNode, useImperativeHandle, useMemo, useState } from "react";
import type { CreateTaskFormProps } from "./modal-create-task-form";

const CreateTaskForm = dynamic(
  () => import("./modal-create-task-form").then((mod) => mod.CreateTaskForm),
  {
    ssr: false,
    loading: () => (
      <Stack px={16}>
        <Skeleton height={200} />
      </Stack>
    ),
  }
);

export interface ModalCreateTaskRef {
  open: (args?: CreateTaskFormProps) => void;
}

export const ModalCreateTask = forwardRef<
  ModalCreateTaskRef,
  {
    children?: (open: (args?: CreateTaskFormProps) => void) => ReactNode;
  }
>((props, ref) => {
  const color = useColor();
  const layout = useLayout();
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
          <IconFolder size={16} color={color(args?.initial?.folder?.color ?? "dark")} />
          <Text fz={13} fw={400}>
            {args?.initial?.folder.name}
          </Text>
        </Group>
      ),
      args?.initial?.parent && (
        <Group color={args?.initial?.folder?.color ?? "dark"} gap={5}>
          <IconStack2 size={16} color={color(args?.initial?.folder?.color ?? "dark")} />
          <Text fz={13} fw={400}>
            {args?.initial?.folder?.name}
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
        ? props.children((a) => {
            setArgs(a ?? null);
          })
        : null}

      <Modal
        opened={!!args}
        onClose={() => setArgs(null)}
        title={<ModalTitle title={<Trans>Create task</Trans>} icon={IconStackPush} />}
        fullScreen={layout.view === "mobile"}
        size={600}
        zIndex={zIndexes.commonModals + 1}
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        <Stack gap={16} pb={16} px={8}>
          {breadcrumbs.length > 1 && (
            <Group gap={0} px={16}>
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
