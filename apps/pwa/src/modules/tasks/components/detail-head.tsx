"use client";

import { Button } from "@/components/buttons/button";
import { DateFormat } from "@/components/format/date-format";
import { Renderer } from "@/components/renderer";
import { useLayout } from "@/layout/layout-context";
import { ModalSharelink } from "@/modals/modal-share-link";
import { TaskTagFolderSelector } from "@/modules/tasks/components/task-tag-folder-selector";
import { useTask } from "@/modules/tasks/hooks/use-task";
import { useTasks } from "@/modules/tasks/tasks-context";
import { getRelatedTasks, getTaskEntity, updateTasks } from "@/modules/tasks/tasks-service";
import { TaskEntity } from "@/modules/tasks/tasks-types";
import { String } from "@/utils/string.utils";
import config from "@joy-one-client/config";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, em, Group, Text, ThemeIcon, Tooltip } from "@mantine/core";
import { IconChevronDown, IconChevronUp, IconShare2, IconStack2, IconX } from "@tabler/icons-react";
import { FC, Fragment } from "react";

interface TaskDetailHeadProps {
  task: TaskEntity;
  close: () => void;
}

export const TaskDetailHead: FC<TaskDetailHeadProps> = (props) => {
  const { task } = props;
  const [_, { themeColor, tagFolder }] = useTask(props.task._id);

  const viewport = useLayout();
  const tasks = useTasks();

  const parentTask = getTaskEntity(task.parentId);

  const relatedTasks = getRelatedTasks(task, { includeSelf: true });

  const indexOfTask = relatedTasks.findIndex((t) => t._id === task._id);
  const nextTask = relatedTasks[indexOfTask + 1];
  const prevTask = relatedTasks[indexOfTask - 1];

  const isCanNext = !!nextTask;
  const isCanPrev = !!prevTask;

  const onNext = () => {
    if (nextTask) tasks.open(nextTask);
  };

  const onPrev = () => {
    if (prevTask) tasks.open(prevTask);
  };

  return (
    <Group justify="space-between" wrap="nowrap" h="100%">
      <Group gap={3} wrap="nowrap">
        <Group gap={0} mr={8}>
          <Tooltip label={prevTask?.name} disabled={!isCanPrev}>
            <ActionIcon
              component="div"
              variant={isCanPrev ? "subtle" : "transparent"}
              color={isCanPrev ? "dark" : "gray.3"}
              style={{ cursor: isCanPrev ? "pointer" : "default" }}
              onClick={onPrev}
            >
              <IconChevronUp size={18} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label={nextTask?.name} disabled={!isCanNext}>
            <ActionIcon
              component="div"
              variant={isCanNext ? "subtle" : "transparent"}
              color={isCanNext ? "dark" : "gray.3"}
              style={{ cursor: isCanNext ? "pointer" : "default" }}
              onClick={onNext}
            >
              <IconChevronDown size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <ThemeIcon variant="light" color={themeColor}>
          <IconStack2 />
        </ThemeIcon>

        <Group gap={5} align="center" wrap="nowrap">
          <TaskTagFolderSelector
            excludeIds={[tagFolder?._id || "none"]}
            onSelect={(tag) => {
              updateTasks([{ ...task, folderId: tag?._id }]);
            }}
            render={(ctx) => {
              return (
                <Tooltip label={t`Change folder`}>
                  <Button
                    component="div"
                    size="compact-sm"
                    variant="subtle"
                    color="gray"
                    c="var(--mantine-color-dimmed)"
                    fz={15}
                    fw={500}
                    px={5}
                    onClick={ctx.toggle}
                  >
                    {tagFolder ? tagFolder.name : <Trans>General tasks</Trans>}
                  </Button>
                </Tooltip>
              );
            }}
          />

          {!!parentTask && (
            <Fragment>
              <Text c="var(--mantine-color-dimmed)">/</Text>

              <Button
                component="div"
                size="compact-sm"
                variant="subtle"
                color="dark"
                fz={em(16)}
                fw={500}
                px={3}
                onClick={() => tasks.open(parentTask)}
              >
                {String.limitCharacters(parentTask.name, viewport.view === "mobile" ? 15 : 30)}
              </Button>
            </Fragment>
          )}
        </Group>
      </Group>

      <ModalSharelink>
        {(shareLink) => (
          <Group justify="end" wrap="nowrap" gap={8}>
            <Renderer views={["desktop"]}>
              <Text fz={em(12)} c="var(--mantine-color-dimmed)" px={10}>
                <Trans>Created at</Trans> <DateFormat value={task.createdAt} type="date-time" />
              </Text>

              <Button
                component="div"
                size="compact-sm"
                variant="light"
                leftIcon={IconShare2}
                onClick={() => shareLink({ task, url: `${config.APP_URL}/tasks/${task.code}` })}
              >
                <Trans>Share</Trans>
              </Button>
            </Renderer>

            <Renderer views={["mobile", "tablet"]}>
              <ActionIcon
                onClick={() => shareLink({ task, url: `${config.APP_URL}/tasks/${task.code}` })}
                component="div"
              >
                <IconShare2 strokeWidth={1.5} size={18} />
              </ActionIcon>
            </Renderer>

            <ActionIcon
              component="div"
              variant="subtle"
              size="lg"
              color="dark"
              onClick={props.close}
            >
              <IconX strokeWidth={1.5} size={18} />
            </ActionIcon>
          </Group>
        )}
      </ModalSharelink>
    </Group>
  );
};
