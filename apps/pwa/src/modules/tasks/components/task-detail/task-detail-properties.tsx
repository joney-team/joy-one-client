import { Avatar } from "@/components/avatar";
import { ButtonArchive } from "@/components/buttons/button-archive";
import { DateFormat } from "@/components/format/date-format";
import { Hovered } from "@/components/hovered";
import { formatDuration } from "@/components/inputs/estimate-time-input/estimate-time-input-utils";
import { TimeTrackingsInput } from "@/components/inputs/time-trackings-input";
import { useColor } from "@/modules/theme/use-color";
import { Trans, useLingui } from "@lingui/react/macro";
import { ActionIcon, Badge, Group, Stack, Text, ThemeIcon, Tooltip } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import {
  Icon,
  IconCalendar,
  IconCaretRightFilled,
  IconCheck,
  IconFlag,
  IconFlagFilled,
  IconHourglassHigh,
  IconPlaystationCircle,
  IconPlus,
  IconStopwatch,
  IconTags,
  IconUser,
  IconUserSquareRounded,
  IconX,
} from "@tabler/icons-react";
import { FC, PropsWithChildren, ReactNode, useMemo, useRef } from "react";
import { TaskDataFragment } from "../../graphql/fragmentTask.graphql";
import { useTaskStatuses } from "../../hooks/use-task-statuses";
import { useUpdateTasks } from "../../hooks/use-update-tasks";
import { taskPriorities } from "../../tasks-constants";
import { DefaultTaskStatusId } from "../../tasks-types";
import { useTaskMenu } from "../task-menu/task-menu";
import { TaskMenuAction } from "../task-menu/task-menu-types";

const FormField: FC<
  PropsWithChildren<{
    label: ReactNode;
    icon: Icon;
    iconColor?: string;
    onClick?: (contentRef: HTMLDivElement) => void;
    onRemove?: () => void;
    value?: ReactNode;
  }>
> = ({ label, icon: Icon, iconColor, onClick, onRemove, value, children }) => {
  const hover = useHover();
  const color = useColor();
  const contentRef = useRef<HTMLDivElement>(null);

  const content = useMemo(() => {
    if (value) {
      return (
        <Group px={8} gap={5} align="center">
          {value}
        </Group>
      );
    }

    if (children) {
      return children;
    }

    return (
      <Group px={8} gap={5} align="center">
        <IconPlus size={13} color={color("gray")} />

        <Text c="gray" fz={13}>
          {label}
        </Text>
      </Group>
    );
  }, [value, children]);

  return (
    <Tooltip label={label} openDelay={100} position="left" offset={-10}>
      <Group
        flex={1}
        w="100%"
        gap={3}
        className="clickable"
        onClick={() => {
          if (!contentRef.current || !onClick) return;
          onClick(contentRef.current);
        }}
        px="md"
      >
        <ThemeIcon variant="transparent" color={color(iconColor || "gray")} size="sm">
          <Icon strokeWidth={1.5} />
        </ThemeIcon>

        <Group flex={1} p={0} ref={contentRef}>
          <Group
            flex={1}
            gap={5}
            w="100%"
            ref={hover.ref}
            className="unselectable"
            bg={hover.hovered ? "var(--mantine-color-default-hover)" : "transparent"}
            mih={36}
            style={{
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            <Group flex={1} miw={0} gap={5} ref={contentRef}>
              {content}
            </Group>

            {!!onRemove && !!value && (
              <Group px={8} opacity={hover.hovered ? 1 : 0} align="center">
                <ActionIcon
                  variant="subtle"
                  color="gray.5"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemove?.();
                  }}
                >
                  <IconX size={16} strokeWidth={1.5} />
                </ActionIcon>
              </Group>
            )}
          </Group>
        </Group>
      </Group>
    </Tooltip>
  );
};

export const TaskDetailProperties: FC<{ task: TaskDataFragment; onClose: () => void }> = ({
  task,
  onClose,
}) => {
  const { status, statuses } = useTaskStatuses(task);
  const { t } = useLingui();
  const { updateTasks } = useUpdateTasks();

  const currentStatusIndex = statuses.findIndex((v) => v.id === task.status);
  const nextStatus = statuses[currentStatusIndex + 1];
  const completedStatus = statuses.find((v) => v.id === DefaultTaskStatusId.CLOSED);

  const taskMenu = useTaskMenu({
    task,
    groupVariables: null,
    options: {
      offset: { x: 10 },
    },
  });

  return (
    <Stack mih={0} h="100%" gap="xs">
      <Stack flex={1}>
        <Stack gap="xs">
          {status && (
            <FormField
              icon={IconPlaystationCircle}
              key={status.id}
              label={<Trans>Status</Trans>}
              onClick={(e) =>
                taskMenu.open({
                  action: TaskMenuAction.CHANGE_STATUS,
                  target: e,
                })
              }
            >
              <Group px={8} gap={5}>
                <Group
                  gap={0}
                  bg={status.color ?? "gray"}
                  wrap="nowrap"
                  component="button"
                  style={{
                    padding: 0,
                    cursor: "pointer",
                    outline: "none",
                    border: "none",
                    borderRadius: 5,
                  }}
                >
                  <Group
                    px={8}
                    align="center"
                    justify="center"
                    style={{
                      borderRight: nextStatus ? `1px solid #00000020` : "none",
                    }}
                  >
                    <Text c="white" fz={13} fw={500} tt="uppercase">
                      {status.name}
                    </Text>
                  </Group>

                  {nextStatus && (
                    <Tooltip label={`${t`Next status`} ${nextStatus.name}`}>
                      <ActionIcon
                        size={24}
                        radius={5}
                        component="div"
                        color="white"
                        variant="transparent"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          updateTasks({ _id: task._id, status: nextStatus.id });
                        }}
                      >
                        <IconCaretRightFilled size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>

                {task.status !== completedStatus?.id && (
                  <Hovered>
                    {({ hovered, ref }) => (
                      <Tooltip label={<Trans>Task complete</Trans>}>
                        <ActionIcon
                          ref={ref}
                          size={24}
                          radius={5}
                          color={hovered ? completedStatus?.color ?? "gray" : "gray"}
                          variant={hovered ? "filled" : "light"}
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            await updateTasks({
                              _id: task._id,
                              status: DefaultTaskStatusId.CLOSED,
                            });
                          }}
                        >
                          <IconCheck size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Hovered>
                )}
              </Group>
            </FormField>
          )}

          <FormField
            icon={IconUser}
            label={<Trans>Assignee</Trans>}
            value={
              task.assigneeUsers.length > 0
                ? task.assigneeUsers?.map((member) => (
                    <Avatar key={member._id} size={26} user={member} hideOnlineStatus />
                  ))
                : null
            }
            onClick={(e) =>
              taskMenu.open({
                action: TaskMenuAction.CHANGE_ASSIGNEE,
                target: e,
              })
            }
            onRemove={() =>
              updateTasks({
                _id: task._id,
                assigneeUsers: [],
              })
            }
          />

          <FormField
            label={<Trans>Priority</Trans>}
            icon={task.priority ? IconFlagFilled : IconFlag}
            iconColor={task.priority ? taskPriorities[task.priority]?.color : "gray"}
            onRemove={() =>
              updateTasks({
                _id: task._id,
                priority: null,
              })
            }
            value={task.priority ? t(taskPriorities[task.priority]?.label) : undefined}
            onClick={(e) =>
              taskMenu.open({
                action: TaskMenuAction.CHANGE_PRIORITY,
                target: e,
              })
            }
          />

          <FormField
            label={<Trans>Due date</Trans>}
            icon={IconCalendar}
            onRemove={() =>
              updateTasks({
                _id: task._id,
                dueDate: null,
                startDate: null,
              })
            }
            value={task.dueDate ? <DateFormat value={task.dueDate} /> : null}
            onClick={(e) =>
              taskMenu.open({
                action: TaskMenuAction.CHANGE_TIMELINE,
                target: e,
              })
            }
          />

          <FormField icon={IconStopwatch} label={<Trans>Time trackings</Trans>}>
            <TimeTrackingsInput px="sm" flex={1} task={task} />
          </FormField>

          <FormField
            icon={IconHourglassHigh}
            label={<Trans>Estimate time</Trans>}
            onRemove={() =>
              updateTasks({
                _id: task._id,
                estimatedTime: null,
              })
            }
            value={task.estimatedTime ? formatDuration(task.estimatedTime) : null}
            onClick={(e) => {
              taskMenu.open({
                action: TaskMenuAction.CHANGE_ESTIMATE_TIME,
                target: e,
              });
            }}
          />

          <FormField
            label={<Trans>Customer</Trans>}
            icon={IconUserSquareRounded}
            onRemove={() =>
              updateTasks({
                _id: task._id,
                customer: null,
              })
            }
            value={task.customer ? task.customer.name : null}
            onClick={(e) =>
              taskMenu.open({
                action: TaskMenuAction.CHANGE_CUSTOMER,
                target: e,
              })
            }
          />

          <FormField
            icon={IconTags}
            label={<Trans>Tags</Trans>}
            onClick={(e) =>
              taskMenu.open({
                action: TaskMenuAction.CHANGE_TAGS,
                target: e,
              })
            }
            onRemove={() =>
              updateTasks({
                _id: task._id,
                tags: [],
              })
            }
            value={
              task.tags && task.tags.length > 0
                ? task.tags?.map((tag) => (
                    <Badge key={tag._id} color={tag.color || "gray"} size="sm" variant="light">
                      {tag.name}
                    </Badge>
                  ))
                : null
            }
          />
        </Stack>
      </Stack>

      <Stack p="md">
        <ButtonArchive
          name={<Trans>Task</Trans>}
          process={async () => {
            if (!task) return;
            await updateTasks([{ _id: task._id, isArchived: true }]);
            onClose();
          }}
        />
      </Stack>
    </Stack>
  );
};
