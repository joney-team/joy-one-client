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
import { FC, Fragment, ReactNode, useMemo, useRef } from "react";
import { updateTaskPath } from "../tasks-route-helpers";

export const ModalCreateTask: FC<{
  children: (open: (args?: TaskFormProps) => void) => ReactNode;
}> = ({ children }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();
  const layout = useLayout();
  const props = useRef<TaskFormProps | null>(null);

  const breadcrumbs = useMemo(() => {
    return [
      props.current?.initial?.folder && (
        <Button
          size="compact-sm"
          variant="light"
          color={props.current?.initial?.folder?.color ?? "dark"}
          fz={em(15)}
          fw={500}
          leftIcon={IconFolder}
          onClick={() => {
            router.push(
              updateTaskPath(location.pathname, {
                slug: props.current?.initial?.folder?.slug,
              })
            );
            close();
          }}
        >
          {props.current?.initial?.folder.name}
        </Button>
      ),
      props.current?.initial?.parent && (
        <Button
          leftIcon={IconStack2}
          size="compact-sm"
          variant="subtle"
          color="dark"
          onClick={() => {
            router.push(`/tasks/${props.current?.initial?.parent?.code}`);
            close();
          }}
        >
          {String.limitCharacters(
            props.current?.initial?.parent?.name,
            layout.view === "mobile" ? 15 : 30
          )}
        </Button>
      ),
      <Text fz={12} fw={300}>
        <Trans>New Task</Trans>
      </Text>,
    ].filter(Boolean);
  }, [props.current?.initial?.folder, opened]);

  return (
    <Fragment>
      {children((args) => {
        props.current = args ?? null;
        open();
      })}

      <Modal
        onClose={close}
        opened={opened}
        title={
          <ModalTitle
            title={props.current?.task ? <Trans>Task</Trans> : <Trans>Create task</Trans>}
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
              {...props.current}
              onClose={() => {
                props.current?.onClose?.();
                close();
              }}
            />
          )}
        </Stack>
      </Modal>
    </Fragment>
  );
};
