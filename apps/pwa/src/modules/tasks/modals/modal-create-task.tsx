"use client";

import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { Renderer } from "@/components/renderer";
import { useRouter } from "@/hooks/use-router";
import { useLayout } from "@/layout/layout-context";
import { useTags } from "@/modules/tags/tags-context";
import { TaskForm, TaskFormProps } from "@/modules/tasks/components/form-task";
import { getTaskEntity } from "@/modules/tasks/tasks-service";
import { String } from "@/utils/string.utils";
import { zIndexes } from "@joy-one-client/config/layout";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { em, Group, Modal, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconFolder, IconStack2, IconStackPush } from "@tabler/icons-react";
import { FC, Fragment, ReactNode, useRef } from "react";

export const ModalCreateTask: FC<{
  children: (open: (props?: TaskFormProps) => void) => ReactNode;
}> = ({ children }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();

  const tags = useTags();
  const layout = useLayout();

  const props = useRef<TaskFormProps | null>(null);

  const parentTask = getTaskEntity(props.current?.task?.parentId || props.current?.parentId);
  const parnetTagFolder = tags.list.find((v) => v._id === parentTask?.folderId);

  const tagFolder = tags.list.find(
    (v) => v._id === props.current?.folderId || v._id === parnetTagFolder?._id
  );

  return (
    <Fragment>
      {children((p) => {
        props.current = p || null;
        open();
      })}

      <Modal
        onClose={close}
        opened={opened}
        title={
          <ModalTitle title={props.current?.task ? t`Task` : t`Create task`} icon={IconStackPush} />
        }
        fullScreen={layout.view === "mobile"}
        size={830}
        zIndex={zIndexes.commonModals + 1}
      >
        <Stack gap={10} pb={layout.view === "mobile" ? 16 * 2 : 0}>
          <Renderer visible={!!tagFolder || !!parentTask || !!parnetTagFolder}>
            <Group gap={5} align="center" wrap="nowrap" ml={-8} mt={5}>
              {tagFolder && (
                <Button
                  size="compact-sm"
                  variant="subtle"
                  color="dark"
                  fz={em(15)}
                  fw={500}
                  leftIcon={IconFolder}
                  onClick={() => {
                    router.push(`/tasks?fs=${tagFolder._id}`);
                    close();
                  }}
                >
                  {tagFolder.name}
                </Button>
              )}

              {!!tagFolder && !!parentTask && <Text>/</Text>}

              {parentTask && (
                <Button
                  fz={em(15)}
                  fw={500}
                  leftIcon={IconStack2}
                  size="compact-sm"
                  variant="subtle"
                  color="dark"
                  onClick={() => {
                    router.push(`/tasks/${parentTask.code}`);
                    close();
                  }}
                >
                  {String.limitCharacters(parentTask.name, layout.view === "mobile" ? 15 : 30)}
                </Button>
              )}

              <Text>/</Text>

              <Text px={8} fz={em(14)} fw={300}>
                <Trans>New Task</Trans>
              </Text>
            </Group>
          </Renderer>

          {opened && (
            <TaskForm
              {...props.current}
              parentId={parentTask?._id}
              folderId={tagFolder?._id}
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
