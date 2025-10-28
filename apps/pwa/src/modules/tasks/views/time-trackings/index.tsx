"use client";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { Calendar } from "@/components/calendar";
import { useList } from "@/components/list/use-list";
import { Renderer } from "@/components/renderer";
import { useLayout } from "@/layout/layout-context";
import { EventType } from "@/modules/events/event-types";
import { OnModalTaskTimeTracking } from "@/modules/tasks/modals/modal-task-time-tracking";
import { useTasks } from "@/modules/tasks/tasks-context";
import { getTasks, renderTaskStatusStyle } from "@/modules/tasks/tasks-service";
import { TaskEntity, TaskTimeTracking } from "@/modules/tasks/tasks-types";
import { useColor } from "@/modules/theme/use-color";
import { WorkspaceMemberSelector } from "@/modules/workspace-members/components/workspace-member-selector";
import { useWorkspaceMembers } from "@/modules/workspace-members/workspace-members-hooks";
import {
  WorkspaceMember,
  WorkspaceMemberInfo,
} from "@/modules/workspace-members/workspace-members-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { objSelect } from "@/utils/object.utils";
import { DateTime } from "@joy-one-client/utils/date-time";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  Card,
  Divider,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useForceUpdate, useHover } from "@mantine/hooks";
import { IconMinus, IconPlus, IconStopwatch, IconUsers, IconX } from "@tabler/icons-react";
import dayjs from "dayjs";
import { FC, PropsWithChildren, useEffect } from "react";

export const TasksTimeTrackings: FC<PropsWithChildren> = (props) => {
  const ctx = useTasks();
  const layout = useLayout();
  const assigneesHover = useHover();

  const getQuery = (query: any) => {
    let _query = { ...query };

    const date = _query.date ? new Date(+_query.date * 1000) : new Date();
    const range = DateTime.getRange(date, "month");

    const fromTrackingTime = DateTime.toSeconds(range.start);
    const toTrackingTime = DateTime.toSeconds(range.end);

    return {
      ..._query,
      fromTrackingTime,
      toTrackingTime,
      date,
      getAll: true,
    };
  };

  const tasks = useList<TaskEntity>({
    id: `tc-${ctx.tagFolder?._id || "all"}`,
    fetch: (q) =>
      getTasks(
        objSelect(getQuery(q), ["fromTrackingTime", "toTrackingTime", "assigneeUserIds", "getAll"])
      ),
    events: [EventType.TASKS_UPDATED, EventType.TASK_NEW, EventType.TASK_ARCHIVED],
  });

  const _tasks = tasks.data.filter((v) => !ctx.tagFolder || v.tagFolderId === ctx.tagFolder?._id);
  const query = getQuery(tasks.params);

  const timeTrackingUsers = _tasks.reduce((acc, task) => {
    task.timeTrackings?.forEach((v) => {
      const user = v.user;
      if (!acc.find((u) => u.user.userId === user.userId)) {
        acc.push({ user, timeTrackings: [v] });
      } else {
        acc.find((u) => u.user.userId === user.userId)!.timeTrackings.push(v);
      }
    });

    return acc;
  }, [] as { user: WorkspaceMemberInfo; timeTrackings: TaskTimeTracking[] }[]);

  const onChangeDate = (date: Date) => {
    const isThisMonth = dayjs(date).isSame(new Date(), "month");
    if (isThisMonth) {
      tasks.removeParams(["date"]);
    } else {
      tasks.setParams({
        date: DateTime.toSeconds(date) + 60 * 60 * 24,
      });
    }
  };

  const assigneeUserIds: string[] = query.assigneeUserIds || [];
  const [assignees, isAssigneesReady, setAssignee] = useWorkspaceMembers([
    ...assigneeUserIds,
    ...timeTrackingUsers.map((v) => v.user.userId),
  ]);

  return (
    <ScrollArea.Autosize mah="100%" flex={1}>
      <Stack p={16}>
        <Group gap={8}>
          <WorkspaceMemberSelector
            onSelect={(user) => {
              if (!user) return;
              setAssignee(user);
              const isSelected = assigneeUserIds.includes(user.userId);
              let _assigneeUserIds: string[] = [...assigneeUserIds];
              if (isSelected) {
                _assigneeUserIds = _assigneeUserIds.filter((id) => id !== user.userId);
              } else {
                _assigneeUserIds.push(user.userId);
              }

              if (_assigneeUserIds.length === 0) {
                tasks.removeParams(["assigneeUserIds"]);
              } else {
                tasks.setParams({ assigneeUserIds: _assigneeUserIds });
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
            target={(ctx) => {
              const isHasAssignee = assigneeUserIds.length > 0;

              return (
                <Group
                  justify="space-between"
                  style={{ position: "relative" }}
                  ref={assigneesHover.ref}
                >
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
                        <Trans>Members</Trans>
                      </Text>

                      {!isAssigneesReady ? (
                        <Loader size={13} type="dots" color="gray" />
                      ) : (
                        isHasAssignee && (
                          <Group gap={5} mr={0}>
                            {assigneeUserIds.map((userId, i) => {
                              const assignee = assignees.find(
                                (assignee) => assignee.userId === userId
                              );
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
                        tasks.removeParams(["assigneeUserIds"]);
                      }}
                    >
                      <IconX size={7} strokeWidth={4} />
                    </ThemeIcon>
                  )}
                </Group>
              );
            }}
          />

          <Renderer visible={timeTrackingUsers.length > 0}>
            <Group
              flex={1}
              justify={layout.view === "mobile" ? "left" : "end"}
              gap={8}
              w={layout.view === "mobile" ? "100%" : undefined}
            >
              {timeTrackingUsers.map(({ user, timeTrackings }) => {
                const totalTime = timeTrackings.reduce((acc, t) => {
                  if (t.endAt) {
                    const seconds = t.endAt - t.startAt;
                    return acc + seconds;
                  }

                  return acc;
                }, 0);

                const userInfo = assignees.find((m) => m.userId === user.userId);
                if (!userInfo) return null;

                return (
                  <Card key={user.userId} withBorder p={3} pr={10} radius={100} shadow="none">
                    <Group gap={8} wrap="nowrap">
                      <Avatar user={userInfo} size={22} hideOnlineStatus />
                      <Stack>
                        <Text fz={12} fw={500}>
                          {userInfo.name}
                        </Text>
                      </Stack>
                      <Divider orientation="vertical" />
                      <Text fz={12} fw={700}>
                        {DateTime.toHHMM(totalTime)}
                      </Text>
                    </Group>
                  </Card>
                );
              })}
            </Group>
          </Renderer>
        </Group>

        <Card shadow="xs" p={16}>
          <Calendar
            key={tasks.params.date}
            initialDate={query.date}
            onChange={(range) => onChangeDate(range.start)}
            renderDayHead={(date, hovered, isOutOfRange) => {
              return (
                <Group>
                  <Tooltip label={t`Add time trackings`}>
                    <ActionIcon
                      variant="subtle"
                      radius={100}
                      color="gray"
                      onClick={() => {
                        if (isOutOfRange) onChangeDate(date);
                        OnModalTaskTimeTracking({
                          date,
                          onSubmit: () => tasks.fetch(true, { isSilient: true }),
                        });
                      }}
                      opacity={hovered || layout.view !== "desktop" ? 1 : 0}
                    >
                      <IconStopwatch size={20} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              );
            }}
            renderDay={(date, _, isOutOfRange) => {
              if (isOutOfRange) return null;

              const timeTrackingTasks = _tasks.filter(
                (task) =>
                  task.timeTrackings &&
                  task.timeTrackings.some(
                    (v) => v.startAt && dayjs(v.startAt * 1000).isSame(date, "day")
                  )
              );

              return (
                <Stack w="100%" px={5} pb={5} gap={10}>
                  <Renderer visible={timeTrackingTasks.length > 0}>
                    <Stack gap={5}>
                      {timeTrackingTasks.map((task) => (
                        <TaskRow key={task._id} date={date} task={task} />
                      ))}
                    </Stack>
                  </Renderer>
                </Stack>
              );
            }}
          />
        </Card>
        {props.children}
      </Stack>
    </ScrollArea.Autosize>
  );
};

const TaskRow: FC<{
  task: TaskEntity;
  date: Date;
}> = ({ task, date }) => {
  const now = DateTime.toSeconds(new Date());
  const workspace = useWorkspace();
  const hover = useHover();
  const forceUpdate = useForceUpdate();
  const tasks = useTasks();
  const color = useColor();

  const statusStyle = renderTaskStatusStyle(task.status, workspace.settings.taskStatuses);
  const assignee = task.assigneeUsers?.[0];

  const timeTrackings = (task.timeTrackings || []).filter(
    (v) => v.startAt && dayjs(v.startAt * 1000).isSame(date, "day")
  );

  const isHasInProgressTimeTracking = timeTrackings.find((v) => !!!v.endAt);

  const timeTrackingGroupByUsers: { user: WorkspaceMember; timeTrackings: TaskTimeTracking[] }[] =
    timeTrackings.reduce((acc: any, t) => {
      const user = t.user;
      if (acc.find((v: any) => v.user._id === user.userId)) {
        return acc.map((g: any) =>
          g.user._id === user.userId ? { ...g, timeTrackings: [...g.timeTrackings, t] } : g
        );
      } else {
        return [...acc, { user, timeTrackings: [t] }];
      }
    }, []);

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
        borderLeft: `3px solid ${color(statusStyle.color)}`,
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
                      {DateTime.toHHMM(totalTime)}
                    </Text>
                  </Renderer>

                  <Renderer visible={!!isHasInProgressTimeTracking}>
                    <Text fz={12} c="orange" fw={500}>
                      {DateTime.toHHMMSS(totalTime)}
                    </Text>
                  </Renderer>
                </Group>
              );
            })}
          </Renderer>
        </Stack>
      </Group>

      <Renderer views={["desktop", "tablet"]}>
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
            background: `linear-gradient(to right, #ffffff00, #ffffff, #ffffff)`,
          }}
        >
          {!!assignee && <Avatar user={assignee} size={20} hideOnlineStatus />}
        </Group>
      </Renderer>
    </Card>
  );
};
