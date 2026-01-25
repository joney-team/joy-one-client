"use client";

import { Renderer } from "@/components/renderer";
import { useQuery } from "@apollo/client/react";
import config from "@joy-one-client/config";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Card, CopyButton, Group, Text, ThemeIcon, Tooltip } from "@mantine/core";
import {
  IconChevronDown,
  IconChevronRight,
  IconChevronUp,
  IconCopy,
  IconCopyCheck,
  IconLink,
  IconStack2,
  IconX,
} from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { FC, Fragment, useMemo } from "react";
import { TaskDataFragment } from "../../graphql/fragmentTask.graphql";
import QUERY_SIBLING_TASKS, {
  type SiblingTasksQuery,
  type SiblingTasksQueryVariables,
} from "../../graphql/querySiblingTasks.graphql";
import { updateTaskPath } from "../../tasks-route-helpers";

import { useColor } from "@/modules/theme/use-color";
import { useClipboard, useHover } from "@mantine/hooks";
import { useTaskMenu } from "../task-menu/task-menu";
import { TaskMenuAction } from "../task-menu/task-menu-types";
import styles from "./task-detail.module.css";

interface TaskDetailHeadProps {
  task: TaskDataFragment;
  close: () => void;
}

const TaskCodeButton: FC<{ task: TaskDataFragment }> = (props) => {
  const { task } = props;
  const hover = useHover();
  const color = useColor();

  return (
    <Group style={{ position: "relative" }}>
      <CopyButton value={task.code}>
        {({ copied, copy }) => (
          <Tooltip label={<Trans>Copy code</Trans>}>
            <Group>
              <Card
                withBorder
                shadow="none"
                h={26}
                py={0}
                px={8}
                onClick={copy}
                style={{ cursor: "pointer" }}
                ref={hover.ref}
              >
                <Group h="100%" align="center" gap={5}>
                  <Text fz={13} c="var(--mantine-color-dimmed)" fw={500}>
                    {task.code}
                  </Text>

                  <Renderer visible={hover.hovered && !copied}>
                    <IconCopy size={13} color="var(--mantine-color-dimmed)" />
                  </Renderer>

                  <Renderer visible={copied}>
                    <IconCopyCheck size={13} color={color("primary")} />
                  </Renderer>
                </Group>
              </Card>
            </Group>
          </Tooltip>
        )}
      </CopyButton>
    </Group>
  );
};

export const TaskDetailHead: FC<TaskDetailHeadProps> = ({ task, close }) => {
  const clipboard = useClipboard({ timeout: 500 });
  const color = useColor();
  const router = useRouter();
  const pathname = usePathname();
  const taskMenu = useTaskMenu({ task, groupVariables: null });

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
      <Tooltip label={<Trans>Change folder</Trans>}>
        <Group
          className={styles.TaskBreadcrumb}
          gap={5}
          onClick={(e) =>
            taskMenu.open({ action: TaskMenuAction.CHANGE_FOLDER, target: e.currentTarget })
          }
        >
          <ThemeIcon
            variant="transparent"
            color={task.folder?.color ?? task.parent?.folder?.color ?? "gray"}
            size="sm"
          >
            <IconStack2 size={18} />
          </ThemeIcon>

          {task.folder?.name?.trim() ?? task.parent?.folder?.name?.trim() ?? (
            <Trans>General tasks</Trans>
          )}
        </Group>
      </Tooltip>,
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

        <TaskCodeButton task={task} />
      </Group>,
    ].filter(Boolean);
  }, [task, taskMenu]);

  return (
    <Group justify="space-between" wrap="nowrap" h="100%" miw={0}>
      <Group gap={3} wrap="nowrap" miw={0}>
        <Group gap={0}>
          <Tooltip label={siblingTasks.data?.siblingTasks.previous?.name} disabled={!isCanPrev}>
            <ActionIcon
              component="div"
              variant={isCanPrev ? "subtle" : "transparent"}
              color={isCanPrev ? "dark" : "gray.3"}
              style={{ cursor: isCanPrev ? "pointer" : "default" }}
              onClick={onPrev}
            >
              <IconChevronUp size={16} />
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
              <IconChevronDown size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>

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

      <Group justify="end" wrap="nowrap" gap={3}>
        <Tooltip label={clipboard.copied ? <Trans>Copied</Trans> : <Trans>Copy link URL</Trans>}>
          <ActionIcon
            onClick={() => clipboard.copy(`${config.APP_URL}/tasks/${task.code}`)}
            component="div"
            variant="subtle"
            size="md"
            color={clipboard.copied ? color("primary") : "gray"}
          >
            <IconLink size={18} />
          </ActionIcon>
        </Tooltip>

        <ActionIcon component="div" variant="subtle" size="md" color="gray" onClick={close}>
          <IconX size={18} />
        </ActionIcon>
      </Group>
    </Group>
  );
};
