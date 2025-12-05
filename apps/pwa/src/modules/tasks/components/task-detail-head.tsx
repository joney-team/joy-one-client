"use client";

import { Button } from "@/components/buttons/button";
import { DateFormat } from "@/components/format/date-format";
import { Renderer } from "@/components/renderer";
import { useLayout } from "@/layout/layout-context";
import { ModalSharelink } from "@/modals/modal-share-link";
import { TaskTagFolderSelector } from "@/modules/tasks/components/task-tag-folder-selector";
import { String } from "@/utils/string.utils";
import { useQuery } from "@apollo/client/react";
import config from "@joy-one-client/config";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, em, Group, Text, ThemeIcon, Tooltip } from "@mantine/core";
import { IconChevronDown, IconChevronUp, IconShare2, IconStack2, IconX } from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { FC, Fragment } from "react";
import { useUpdateTasks } from "../hooks/use-update-tasks";
import { TaskDataFragment } from "../queries/fragmentTask.graphql";
import QUERY_SIBLING_TASKS, {
  type SiblingTasksQuery,
  type SiblingTasksQueryVariables,
} from "../queries/querySiblingTasks.graphql";

interface TaskDetailHeadProps {
  task: TaskDataFragment;
  close: () => void;
}

export const TaskDetailHead: FC<TaskDetailHeadProps> = ({ task, close }) => {
  const router = useRouter();
  const pathname = usePathname();
  const viewport = useLayout();
  const { updateTasks } = useUpdateTasks();

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

  return (
    <Group justify="space-between" wrap="nowrap" h="100%">
      <Group gap={3} wrap="nowrap">
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

        <ThemeIcon variant="light" color={task.folder?.color ?? "gray"}>
          <IconStack2 />
        </ThemeIcon>

        <Group gap={5} align="center" wrap="nowrap">
          <TaskTagFolderSelector
            excludeIds={[task.folder?._id || "none"]}
            onSelect={(tag) => {
              updateTasks([
                {
                  _id: task._id,
                  folder: tag
                    ? {
                        __typename: "TagEntity",
                        _id: tag._id,
                        color: tag.color,
                        name: tag.name,
                        slug: tag.slug,
                      }
                    : null,
                },
              ]);
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
                    {task.folder ? task.folder.name : <Trans>General tasks</Trans>}
                  </Button>
                </Tooltip>
              );
            }}
          />

          {task.parent !== null && (
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
                onClick={() => {
                  router.push(pathname.replace(`/${task.code}`, `/${task.parent?.code}`));
                }}
              >
                {String.limitCharacters(task.parent.name, viewport.view === "mobile" ? 15 : 30)}
              </Button>
            </Fragment>
          )}
        </Group>
      </Group>

      <ModalSharelink>
        {(shareLink) => (
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

            <ActionIcon component="div" variant="subtle" size="lg" color="dark" onClick={close}>
              <IconX strokeWidth={1.5} size={18} />
            </ActionIcon>
          </Group>
        )}
      </ModalSharelink>
    </Group>
  );
};
