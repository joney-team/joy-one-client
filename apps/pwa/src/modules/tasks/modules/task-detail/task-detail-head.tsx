"use client";

import { Button } from "@/components/buttons/button";
import { DateFormat } from "@/components/format/date-format";
import { Renderer } from "@/components/renderer";
import { ModalSharelink, ModalSharelinkRef } from "@/modals/modal-share-link";
import { TaskTagFolderSelector } from "@/modules/tasks/components/task-tag-folder-selector";
import { useQuery } from "@apollo/client/react";
import config from "@joy-one-client/config";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, em, Group, Text, ThemeIcon, Tooltip } from "@mantine/core";
import {
  IconChevronDown,
  IconChevronRight,
  IconChevronUp,
  IconShare2,
  IconStack2,
  IconX,
} from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { FC, Fragment, useMemo, useRef } from "react";
import { TaskDataFragment } from "../../graphql/fragmentTask.graphql";
import QUERY_SIBLING_TASKS, {
  type SiblingTasksQuery,
  type SiblingTasksQueryVariables,
} from "../../graphql/querySiblingTasks.graphql";
import { useUpdateTasks } from "../../hooks/use-update-tasks";
import { updateTaskPath } from "../../tasks-route-helpers";

import styles from "./task-detail.module.css";

interface TaskDetailHeadProps {
  task: TaskDataFragment;
  close: () => void;
}

export const TaskDetailHead: FC<TaskDetailHeadProps> = ({ task, close }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { updateTasks } = useUpdateTasks();
  const modalSharelink = useRef<ModalSharelinkRef>(null);

  const siblingTasks = useQuery<SiblingTasksQuery, SiblingTasksQueryVariables>(
    QUERY_SIBLING_TASKS,
    {
      variables: {
        id: task._id,
      },
    }
  );

  const isCanNext = siblingTasks.data?.siblingTasks.next !== null;
  const isCanPrev = siblingTasks.data?.siblingTasks.previous !== null;

  const onNext = () => {
    if (siblingTasks.data?.siblingTasks.next) {
      router.push(
        pathname.replace(`/${task.code}`, `/${siblingTasks.data?.siblingTasks.next.code}`)
      );
    }
  };

  const onPrev = () => {
    if (siblingTasks.data?.siblingTasks.previous) {
      router.push(
        pathname.replace(`/${task.code}`, `/${siblingTasks.data?.siblingTasks.previous.code}`)
      );
    }
  };

  const breadcrumbs = useMemo(() => {
    return [
      <TaskTagFolderSelector
        excludeIds={[task.folder?._id ?? task.parent?.folderId ?? "none"]}
        onSelect={(tag) => {
          updateTasks([
            {
              _id: task._id,
              folder: tag,
            },
          ]);
        }}
        render={(ctx) => {
          return (
            <Tooltip label={<Trans>Change folder</Trans>}>
              <Group className={styles.TaskBreadcrumb} onClick={ctx.toggle}>
                {task.folder?.name?.trim() ?? task.parent?.folder?.name?.trim() ?? (
                  <Trans>General tasks</Trans>
                )}
              </Group>
            </Tooltip>
          );
        }}
      />,
      task.parent ? (
        <Group
          className={styles.TaskBreadcrumb}
          onClick={() => {
            router.push(updateTaskPath({ code: task.parent?.code }));
          }}
        >
          {task.parent.name.trim()}
        </Group>
      ) : (
        false
      ),
      <Group className={styles.TaskBreadcrumb} c="gray" data-current="true">
        {task.name.trim()}
      </Group>,
    ].filter(Boolean);
  }, [task]);

  return (
    <Group justify="space-between" wrap="nowrap" h="100%" miw={0}>
      <Group gap={3} wrap="nowrap" miw={0}>
        <Group gap={0} mr={8}>
          <Tooltip label={siblingTasks.data?.siblingTasks.previous?.name} disabled={!isCanPrev}>
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

          <Tooltip label={siblingTasks.data?.siblingTasks.next?.name} disabled={!isCanNext}>
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

        <ThemeIcon
          variant="light"
          color={task.folder?.color ?? task.parent?.folder?.color ?? "gray"}
        >
          <IconStack2 />
        </ThemeIcon>

        <Group className={styles.TaskBreadcrumbs} gap={0} align="center" wrap="nowrap" px={5}>
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
      </Group>

      <Group justify="end" wrap="nowrap" gap={8}>
        <Renderer views={["desktop"]}>
          {task.createdAt && (
            <Text fz={em(12)} c="var(--mantine-color-dimmed)" px={10}>
              <Trans>Created at</Trans> <DateFormat value={task.createdAt} type="date-time" />
            </Text>
          )}

          <Button
            component="div"
            size="compact-sm"
            variant="light"
            leftIcon={IconShare2}
            onClick={() =>
              modalSharelink.current?.open({ task, url: `${config.APP_URL}/tasks/${task.code}` })
            }
            h={30}
          >
            <Trans>Share</Trans>
          </Button>
        </Renderer>

        <Renderer views={["mobile", "tablet"]}>
          <ActionIcon
            onClick={() =>
              modalSharelink.current?.open({ task, url: `${config.APP_URL}/tasks/${task.code}` })
            }
            size={30}
          >
            <IconShare2 strokeWidth={1.5} size={18} />
          </ActionIcon>
        </Renderer>

        <ActionIcon component="div" variant="subtle" size={30} color="gray" onClick={close}>
          <IconX strokeWidth={1.5} size={18} />
        </ActionIcon>
      </Group>

      <ModalSharelink ref={modalSharelink} />
    </Group>
  );
};
