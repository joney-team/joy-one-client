"use client";

import { useRouter } from "@/hooks/use-router";
import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { Renderer } from "@/components/renderer";
import { TaskForm, TaskFormProps } from "@/modules/tasks/components/form-task";
import { useLayout } from "@/layout/layout-context";
import { tl } from "@/modules/lang/lang-service";
import { useTags } from "@/modules/tags/tags-context";
import { getTaskEntity } from "@/modules/tasks/tasks-service";
import { String } from "@/utils/string.utils";
import { em, Group, Modal, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconFolder, IconStack2, IconStackPush } from "@tabler/icons-react";
import { FC, useRef } from "react";
import { zIndexes } from "@joy-one-client/config/layout";

export let OnModalCreateTask: (props?: TaskFormProps) => void = () => {};

export const ModalCreateTask: FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();

  const tags = useTags();
  const layout = useLayout();

  const props = useRef<TaskFormProps | null>(null);

  const parentTask = getTaskEntity(props.current?.task?.parentId || props.current?.parentId);
  const parnetTagFolder = tags.list.find((v) => v._id === parentTask?.tagFolderId);

  const tagFolder = tags.list.find(
    (v) => v._id === props.current?.tagFolderId || v._id === parnetTagFolder?._id
  );

  OnModalCreateTask = (p) => {
    props.current = p || null;
    open();
  };

  return (
    <Modal
      onClose={close}
      opened={opened}
      title={
        <ModalTitle
          title={props.current?.task ? tl("task") : `${tl("create")} ${tl("task")}`}
          icon={IconStackPush}
        />
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
              {tl("new_task")}
            </Text>
          </Group>
        </Renderer>

        {opened && (
          <TaskForm
            {...props.current}
            parentId={parentTask?._id}
            tagFolderId={tagFolder?._id}
            onClose={() => {
              props.current?.onClose?.();
              close();
            }}
          />
        )}
      </Stack>
    </Modal>
  );
};
