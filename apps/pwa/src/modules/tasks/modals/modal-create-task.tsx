"use client";

import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { Renderer } from "@/components/renderer";
import { useRouter } from "@/hooks/use-router";
import { useLayout } from "@/layout/layout-context";
import { TaskForm, TaskFormProps } from "@/modules/tasks/components/form-task";
import { String } from "@/utils/string.utils";
import { zIndexes } from "@joy-one-client/config/layout";
import { Trans } from "@lingui/react/macro";
import { em, Group, Modal, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconFolder, IconStack2, IconStackPush } from "@tabler/icons-react";
import { FC, Fragment, ReactNode, useRef } from "react";

export const ModalCreateTask: FC<{
  children: (open: (args?: TaskFormProps) => void) => ReactNode;
}> = ({ children }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();
  const layout = useLayout();
  const props = useRef<TaskFormProps | null>(null);

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
        <Stack gap={10} pb={layout.view === "mobile" ? 16 * 2 : 0}>
          <Renderer
            visible={
              Boolean(props.current?.initial) &&
              (!!props.current?.initial?.parent || !!props.current?.initial?.folder)
            }
          >
            <Group gap={4} align="center" wrap="nowrap" pt={8}>
              {props.current?.initial?.folder && (
                <Button
                  size="compact-sm"
                  variant="subtle"
                  color="dark"
                  fz={em(15)}
                  fw={500}
                  leftIcon={IconFolder}
                  onClick={() => {
                    router.push(`/tasks?fs=${props.current?.initial?.folder?._id}`);
                    close();
                  }}
                >
                  {props.current?.initial?.folder.name}
                </Button>
              )}

              {!!props.current?.initial?.folder && !!props.current?.initial?.parent && (
                <Text c="gray">/</Text>
              )}

              {props.current?.initial?.parent && (
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
              )}

              {props.current?.initial?.parent && (
                <Fragment>
                  <Text c="gray">/</Text>
                  <Text px={5} fz={12} fw={300}>
                    <Trans>New Task</Trans>
                  </Text>
                </Fragment>
              )}
            </Group>
          </Renderer>

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
