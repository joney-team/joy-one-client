import { useColor } from "@/modules/theme/use-color";
import { Avatar } from "@/components/avatar";
import { Calendar } from "@/components/calendar";
import { Button } from "@/components/buttons/button";
import { Renderer } from "@/components/renderer";
import { WorkspaceMemberSelector } from "@/modules/workspace-members/workspace-member-selector";
import { useLayout } from "@/layout/layout-context";
import { OnModalCreateTask } from "@/modules/tasks/modals/modal-create-task";
import { onReconnected, useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { t } from "@/modules/lang/lang-service";
import { useTasks } from "@/modules/tasks/tasks-context";
import { getTasks, renderTaskStatusStyle } from "@/modules/tasks/tasks-service";
import { DefaultTaskStatusId, TaskEntity, TaskTimeTracking } from "@/modules/tasks/tasks-types";
import { useWorkspaceMembers } from "@/modules/workspace-members/workspace-members-hooks";
import { WorkspaceMember } from "@/modules/workspace-members/workspace-members-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { DateTimeUtils } from "@/utils/dateTime.utils";
import { objSelect } from "@/utils/object.utils";
import { StringUtils } from "@/utils/string.utils";
import { useList } from "@/utils/use-list.util";
import { ActionIcon, Card, Group, Loader, rgba, ScrollArea, Stack, Text, ThemeIcon, Tooltip } from "@mantine/core";
import { useForceUpdate, useHover } from "@mantine/hooks";
import { IconCirclePlus, IconMinus, IconPlus, IconUsers, IconX } from "@tabler/icons-react";
import dayjs from "dayjs";
import { FC, PropsWithChildren, useEffect } from "react";

export const TasksCalendarView: FC<PropsWithChildren> = (props) => {
  const { tagFolder } = useTasks();
  const layout = useLayout();
  const assigneesHover = useHover();

  const getQuery = (query: any) => {
    let _query = { ...query };

    const date = _query.date ? new Date(+_query.date * 1000) : new Date();
    const range = DateTimeUtils.getStartEndOfMonth(date);

    const fromDate = DateTimeUtils.timeToSeconds(range.start);
    const toDate = DateTimeUtils.timeToSeconds(range.end);

    return {
      ..._query,
      fromDate,
      toDate,
      date,
      getAll: true,
    };
  };

  const tasks = useList<TaskEntity>({
    id: `calendar-${tagFolder?._id || "all"}`,
    fetch: (q) => getTasks(objSelect(getQuery(q), ["fromDate", "toDate", "tagFolderId", "assigneeUserIds", "getAll"])),
  });

  const query = getQuery(tasks.query);
  const [assignees, isAssigneesReady, setAssignee] = useWorkspaceMembers(query.assigneeUserIds);
  const assigneeUserIds: string[] = query.assigneeUserIds || [];

  useEventsListener(
    [EventType.TASK_NEW, EventType.TASK_ARCHIVED],
    () => {
      tasks.fetch(true, { isSilient: true });
    },
    [tagFolder?._id]
  );

  useEventsListener(
    [EventType.TASKS_UPDATED],
    (ev) => {
      const _tasks = ev.data.tasks as TaskEntity[];
      if (_tasks) {
        tasks.setData(
          tasks.data.map((t) => {
            const updatedTask = _tasks.find((nt) => nt._id === t._id);
            if (updatedTask) return updatedTask;
            return t;
          })
        );
      }
    },
    [tagFolder, tasks.data]
  );

  useEffect(() => {
    if (tasks.isInitialized)
      tasks.fetch(true, {
        isSilient: true,
        addonQuery: {
          tagFolderId: tagFolder?._id,
        },
      });
  }, [tagFolder, tasks.isInitialized]);

  onReconnected(() => {
    tasks.fetch(true, { isSilient: true });
  }, [tagFolder]);

  return (
    <ScrollArea.Autosize mah="100%" flex={1}>
      <Stack p={16}>
        <Group gap={8}>
          <WorkspaceMemberSelector
            onSelect={(user) => {
              setAssignee(user);
              const isSelected = assigneeUserIds.includes(user.userId);
              let _assigneeUserIds: string[] = [...assigneeUserIds];
              if (isSelected) {
                _assigneeUserIds = _assigneeUserIds.filter((id) => id !== user.userId);
              } else {
                _assigneeUserIds.push(user.userId);
              }

              if (_assigneeUserIds.length === 0) {
                tasks.removeQuery("assigneeUserIds");
              } else {
                tasks.setQuery("assigneeUserIds", _assigneeUserIds);
              }
            }}
            optionRightSection={(user) => {
              const isSelected = assigneeUserIds.includes(user.userId);

              return (
                <Group>
                  <ThemeIcon radius={100} variant="transparent" color="gray" size="sm">
                    {isSelected ? <IconMinus size={16} /> : <IconPlus size={16} />}
                  </ThemeIcon>
                </Group>
              );
            }}
            render={(ctx) => {
              const isHasAssignee = assigneeUserIds.length > 0;

              return (
                <Group justify="space-between" style={{ position: "relative" }} ref={assigneesHover.ref}>
                  <Button
                    onClick={ctx.toggle}
                    size="compact-md"
                    h={32}
                    color={isHasAssignee ? "primary" : "gray"}
                    variant="outline"
                    radius={100}
                    fz={12}
                    leftIcon={IconUsers}
                    iconSize={18}
                  >
                    <Group gap={5}>
                      <Text fz={12} fw={500}>
                        {t("members")}
                      </Text>

                      {!isAssigneesReady ? (
                        <Loader size={13} type="dots" color="gray" />
                      ) : (
                        isHasAssignee && (
                          <Group gap={5} mr={0}>
                            {assigneeUserIds.map((userId, i) => {
                              const assignee = assignees.find((assignee) => assignee.userId === userId);
                              if (!assignee) return null;
                              return (
                                <Group key={userId} ml={i > 0 ? -10 : 0}>
                                  <Tooltip label={assignee.name}>
                                    <Avatar withBorder user={assignee} size={22} />
                                  </Tooltip>
                                </Group>
                              );
                            })}
                          </Group>
                        )
                      )}
                    </Group>
                  </Button>

                  {isHasAssignee && assigneesHover.hovered && (
                    <ThemeIcon
                      color="dark.2"
                      radius={100}
                      size={16}
                      style={{
                        position: "absolute",
                        right: -5,
                        top: -5,
                        border: `1px solid white`,
                        cursor: "pointer",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        tasks.removeQuery("assigneeUserIds");
                      }}
                    >
                      <IconX size={7} strokeWidth={4} />
                    </ThemeIcon>
                  )}
                </Group>
              );
            }}
          />
        </Group>

        <Card shadow="xs" p={16}>
          <Stack>
            <Calendar
              initialDate={query.date}
              onChange={(range) => {
                const isThisMonth = dayjs(range.start).isSame(new Date(), "month");
                if (isThisMonth) {
                  tasks.removeQuery("date");
                } else {
                  tasks.setQuery("date", DateTimeUtils.timeToSeconds(range.start) + 60 * 60 * 24);
                }
              }}
              renderDayHead={(date, hovered, isOutOfRange) => {
                if (isOutOfRange) return null;

                return (
                  <Group>
                    <Tooltip
                      label={StringUtils.capitalizeFirstLetter(`${t("add")} ${t("task")} ${t("need_complete")}`)}
                    >
                      <ActionIcon
                        variant="subtle"
                        radius={100}
                        color="gray"
                        onClick={() => OnModalCreateTask({ dueDate: DateTimeUtils.timeToSeconds(date) })}
                        opacity={hovered || layout.view !== "desktop" ? 1 : 0}
                      >
                        <IconCirclePlus size={18} strokeWidth={1.5} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                );
              }}
              renderDay={(date, _, isOutOfRange) => {
                if (isOutOfRange) return null;

                const closedTasks = tasks.data.filter(
                  (task) => task.closedAt && dayjs(task.closedAt * 1000).isSame(date, "day")
                );
                const dueDateTasks = tasks.data.filter(
                  (task) => task.dueDate && dayjs(task.dueDate * 1000).isSame(date, "day")
                );
                const createdTasks = tasks.data.filter(
                  (task) => task.createdAt && dayjs(task.createdAt * 1000).isSame(date, "day")
                );

                return (
                  <Stack w="100%" px={5} pb={5} gap={10}>
                    <Renderer visible={createdTasks.length > 0}>
                      <Text fz={10} mb={-5}>
                        • {t("created")}
                      </Text>
                      <Stack gap={5}>
                        {createdTasks.map((task) => (
                          <TaskRow key={task._id} date={date} task={task} type="createdAt" />
                        ))}
                      </Stack>
                    </Renderer>

                    <Renderer visible={dueDateTasks.length > 0}>
                      <Text fz={10} mb={-5}>
                        • {t("due_date")}
                      </Text>
                      <Stack gap={5}>
                        {dueDateTasks.map((task) => (
                          <TaskRow key={task._id} date={date} task={task} type="dueDate" />
                        ))}
                      </Stack>
                    </Renderer>

                    <Renderer visible={closedTasks.length > 0}>
                      <Text fz={10} mb={-5}>
                        • {t("task_closed")}
                      </Text>
                      <Stack gap={5}>
                        {closedTasks.map((task) => (
                          <TaskRow key={task._id} date={date} task={task} type="closed" />
                        ))}
                      </Stack>
                    </Renderer>
                  </Stack>
                );
              }}
            />
          </Stack>
        </Card>
        {props.children}
      </Stack>
    </ScrollArea.Autosize>
  );
};

const TaskRow: FC<{
  task: TaskEntity;
  date: Date;
  type: "closed" | "dueDate" | "createdAt";
}> = ({ task, date, type }) => {
  const color = useColor();

  const now = DateTimeUtils.timeToSeconds();
  const workspace = useWorkspace();
  const hover = useHover();
  const forceUpdate = useForceUpdate();
  const tasks = useTasks();

  const statusStyle = renderTaskStatusStyle(task.status, workspace.settings.taskStatuses);
  const assignee = task.assigneeUsers?.[0];

  const isDueDateExpired =
    task.status !== DefaultTaskStatusId.CLOSED && task.dueDate && dayjs(task.dueDate * 1000).isBefore(dayjs());

  const timeTrackings = (task.timeTrackings || []).filter(
    (v) => v.startAt && dayjs(v.startAt * 1000).isSame(date, "day")
  );

  const isHasInProgressTimeTracking = timeTrackings.find((v) => !!!v.endAt);

  const timeTrackingGroupByUsers: { user: WorkspaceMember; timeTrackings: TaskTimeTracking[] }[] = timeTrackings.reduce(
    (acc: any, t) => {
      const user = t.user;
      if (acc.find((v: any) => v.user._id === user.userId)) {
        return acc.map((g: any) => (g.user._id === user.userId ? { ...g, timeTrackings: [...g.timeTrackings, t] } : g));
      } else {
        return [...acc, { user, timeTrackings: [t] }];
      }
    },
    []
  );

  useEffect(() => {
    if (isHasInProgressTimeTracking) {
      const interval = setInterval(() => {
        forceUpdate();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isHasInProgressTimeTracking]);

  return (
    <Card
      withBorder
      w="100%"
      p={5}
      radius={5}
      ref={hover.ref}
      style={{
        borderLeft: `3px solid ${color(
          type === "createdAt" ? "gray.5" : isDueDateExpired ? "red" : statusStyle.color
        )}`,
        position: "relative",
      }}
    >
      <Group w="max-content" style={{ cursor: "pointer" }} onClick={() => tasks.open(task)}>
        <Stack gap={8}>
          <Text fz={14} fw={500}>
            {task.name}
          </Text>

          <Renderer visible={timeTrackingGroupByUsers.length > 0}>
            {timeTrackingGroupByUsers.map(({ user, timeTrackings }) => {
              const totalTime = timeTrackings.reduce((acc, t) => {
                const seconds = (t.endAt || now) - t.startAt;
                return acc + seconds;
              }, 0);

              return (
                <Group key={user.userId} gap={5}>
                  <Avatar user={user} size={16} hideOnlineStatus />
                  <Renderer visible={!!!isHasInProgressTimeTracking}>
                    <Text fz={12} fw={500}>
                      {DateTimeUtils.toHHMM(totalTime)}
                    </Text>
                  </Renderer>

                  <Renderer visible={!!isHasInProgressTimeTracking}>
                    <Text fz={12} c="orange" fw={500}>
                      {DateTimeUtils.toHHMMSS(totalTime)}
                    </Text>
                  </Renderer>
                </Group>
              );
            })}
          </Renderer>
        </Stack>
      </Group>

      <Group
        miw={30}
        justify="end"
        align="start"
        pr={5}
        py={5}
        pl={assignee ? 30 : 5}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(to right, ${rgba("var(--mantine-color-body)", 0)}, ${rgba(
            "var(--mantine-color-body)",
            1
          )}, ${rgba("var(--mantine-color-body)", 1)}, ${rgba("var(--mantine-color-body)", 1)})`,
        }}
      >
        {!!assignee && <Avatar user={assignee} size={20} hideOnlineStatus />}
      </Group>
    </Card>
  );
};
