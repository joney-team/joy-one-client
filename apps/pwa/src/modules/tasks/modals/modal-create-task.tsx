"use client";

import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { useRouter } from "@/hooks/use-router";
import { useLayout } from "@/layout/layout-context";
import { TaskForm, TaskFormProps } from "@/modules/tasks/components/form-task";
import { String } from "@/utils/string.utils";
import { zIndexes } from "@joy-one-client/config/layout";
import { Trans } from "@lingui/react/macro";
import { em, Group, Modal, Stack, Text, ThemeIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronRight, IconFolder, IconStack2, IconStackPush } from "@tabler/icons-react";
import { forwardRef, Fragment, ReactNode, useImperativeHandle, useMemo, useRef } from "react";
import { updateTaskPath } from "../tasks-route-helpers";

export interface ModalCreateTaskRef {
  open: (args?: TaskFormProps) => void;
}

export const ModalCreateTask = forwardRef<
  ModalCreateTaskRef,
  {
    children?: (open: (args?: TaskFormProps) => void) => ReactNode;
  }
>((props, ref) => {
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();
  const layout = useLayout();
  const args = useRef<TaskFormProps | null>(null);

  useImperativeHandle(ref, () => ({
    open: (a) => {
      args.current = a ?? null;
      open();
    },
    close: () => {
      args.current = null;
    },
  }));

  const breadcrumbs = useMemo(() => {
    return [
      args.current?.initial?.folder && (
        <Button
          size="compact-sm"
          variant="light"
          color={args.current?.initial?.folder?.color ?? "dark"}
          fz={em(15)}
          fw={500}
          leftIcon={IconFolder}
          onClick={() => {
            router.push(
              updateTaskPath(location.pathname, {
                slug: args.current?.initial?.folder?.slug,
              })
            );
            close();
          }}
        >
          {args.current?.initial?.folder.name}
        </Button>
      ),
      args.current?.initial?.parent && (
        <Button
          leftIcon={IconStack2}
          size="compact-sm"
          variant="subtle"
          color="dark"
          onClick={() => {
            router.push(`/tasks/${args.current?.initial?.parent?.code}`);
            close();
          }}
        >
          {String.limitCharacters(
            args.current?.initial?.parent?.name,
            layout.view === "mobile" ? 15 : 30
          )}
        </Button>
      ),
      <Text fz={12} fw={300}>
        <Trans>New Task</Trans>
      </Text>,
    ].filter(Boolean);
  }, [args.current?.initial?.folder, opened]);

  return (
    <Fragment>
      {typeof props.children === "function"
        ? props.children((a) => {
            args.current = a ?? null;
            open();
          })
        : null}

      <Modal
        onClose={close}
        opened={opened}
        title={
          <ModalTitle
            title={args.current?.task ? <Trans>Task</Trans> : <Trans>Create task</Trans>}
            icon={IconStackPush}
          />
        }
        fullScreen={layout.view === "mobile"}
        size={830}
        zIndex={zIndexes.commonModals + 1}
      >
        <Stack gap={0} pb={layout.view === "mobile" ? 16 * 2 : 0}>
          <Group gap={0}>
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

          {opened && (
            <TaskForm
              {...args.current}
              onClose={() => {
                args.current?.onClose?.();
                close();
              }}
            />
          )}
        </Stack>
      </Modal>
    </Fragment>
  );
});
