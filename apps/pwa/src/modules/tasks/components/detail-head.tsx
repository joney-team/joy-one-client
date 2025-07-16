"use client";

import { Button } from "@/components/buttons/button";
import { Renderer } from "@/components/renderer";
import { TaskTagFolderSelector } from "@/modules/tasks/components/task-tag-folder-selector";
import { useLayout } from "@/layout/layout-context";
import { OnModalShareLink } from "@/modals/modal-share-link";
import { renderDateTime, t } from "@/modules/lang/lang-service";
import { useTasks } from "@/modules/tasks/tasks-context";
import { useTask } from "@/modules/tasks/hooks/use-task";
import { getRelatedTasks, getTaskEntity, bulkUpdateTasks } from "@/modules/tasks/tasks-service";
import { TaskEntity } from "@/modules/tasks/tasks-types";
import { capitalize, StringUtils } from "@/utils/string.utils";
import config from "@joy-one-client/config";
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

  const relatedTasks = getRelatedTasks(task, true);

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
              bulkUpdateTasks([{ ...task, tagFolderId: tag?._id }]);
            }}
            render={(ctx) => {
              return (
                <Tooltip label={capitalize(`${t("change")} ${t("folder")}`)}>
                  <Button
                    component="div"
                    size="compact-sm"
                    variant="subtle"
                    color="gray"
                    c="var(--mantine-color-dimmed)"
                    fz={em(16)}
                    fw={500}
                    px={3}
                    onClick={ctx.toggle}
                  >
                    {tagFolder ? tagFolder.name : `${t("general_tasks")}`}
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
                {StringUtils.limitCharacters(parentTask.name, viewport.view === "mobile" ? 15 : 30)}
              </Button>
            </Fragment>
          )}
        </Group>
      </Group>

      <Group justify="end" wrap="nowrap" gap={8}>
        <Renderer views={["desktop"]}>
          <Text fz={em(12)} c="var(--mantine-color-dimmed)" px={10}>
            {t("created_at")} {renderDateTime(task.createdAt, true)}
          </Text>

          <Button
            component="div"
            size="compact-md"
            fz={em(14)}
            fw={500}
            leftIcon={IconShare2}
            onClick={() => OnModalShareLink({ task, url: `${config.APP_URL}/tasks/${task.code}` })}
          >
            {t("share")}
          </Button>
        </Renderer>

        <Renderer views={["mobile", "tablet"]}>
          <ActionIcon
            onClick={() => OnModalShareLink({ task, url: `${config.APP_URL}/tasks/${task.code}` })}
            component="div"
          >
            <IconShare2 strokeWidth={1.5} size={18} />
          </ActionIcon>
        </Renderer>

        <ActionIcon component="div" variant="subtle" size="lg" color="dark" onClick={props.close}>
          <IconX strokeWidth={1.5} size={18} />
        </ActionIcon>
      </Group>
    </Group>
  );
};
