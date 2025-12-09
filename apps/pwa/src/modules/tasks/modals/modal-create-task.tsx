"use client";

import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { useRouter } from "@/hooks/use-router";
import { useLayout } from "@/layout/layout-context";
import { type TaskFormProps } from "@/modules/tasks/components/form-task";
import { String } from "@/utils/string.utils";
import { zIndexes } from "@joy-one-client/config/layout";
import { Trans } from "@lingui/react/macro";
import { em, Group, Modal, Skeleton, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconChevronRight, IconFolder, IconStack2, IconStackPush } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { forwardRef, Fragment, ReactNode, useImperativeHandle, useMemo, useState } from "react";
import { updateTaskPath } from "../tasks-route-helpers";

const TaskForm = dynamic(() => import("../components/form-task").then((mod) => mod.TaskForm), {
  ssr: false,
  loading: () => <Skeleton miw="100%" h={250} />,
});

export interface ModalCreateTaskRef {
  open: (args?: TaskFormProps) => void;
}

export const ModalCreateTask = forwardRef<
  ModalCreateTaskRef,
  {
    children?: (open: (args?: TaskFormProps) => void) => ReactNode;
  }
>((props, ref) => {
  const router = useRouter();
  const layout = useLayout();
  const [args, setArgs] = useState<TaskFormProps | null>(null);

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
        <Button
          size="compact-sm"
          variant="light"
          color={args?.initial?.folder?.color ?? "dark"}
          fz={em(15)}
          fw={500}
          leftIcon={IconFolder}
          onClick={() => {
            router.push(
              updateTaskPath(location.pathname, {
                slug: args?.initial?.folder?.slug,
              })
            );
            setArgs(null);
          }}
        >
          {args?.initial?.folder.name}
        </Button>
      ),
      args?.initial?.parent && (
        <Button
          leftIcon={IconStack2}
          size="compact-sm"
          variant="subtle"
          color="dark"
          onClick={() => {
            router.push(`/tasks/${args?.initial?.parent?.code}`);
            setArgs(null);
          }}
        >
          {String.limitCharacters(args?.initial?.parent?.name, layout.view === "mobile" ? 15 : 30)}
        </Button>
      ),
      <Text fz={12} fw={300}>
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
        onClose={() => setArgs(null)}
        opened={!!args}
        title={
          <ModalTitle
            title={args?.task ? <Trans>Task</Trans> : <Trans>Create task</Trans>}
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

          {args && (
            <TaskForm
              {...args}
              onClose={() => {
                args?.onClose?.();
                setArgs(null);
              }}
            />
          )}
        </Stack>
      </Modal>
    </Fragment>
  );
});
