"use client";

import { Avatar } from "@/components/avatar";
import { Calendar } from "@/components/calendar/calendar";
import { Renderer } from "@/components/renderer";
import { useRouter } from "@/hooks/use-router";
import { useLayout } from "@/layout/layout-context";
import { useTasks } from "@/modules/tasks/tasks-context";
import { useWorkspaceMembers } from "@/modules/workspace-members/workspace-members-hooks";
import { CalendarView } from "@/types";
import { nonLoading } from "@/utils/non-loading";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Card, Divider, Group, ScrollArea, Stack, Text, Tooltip } from "@mantine/core";
import { IconStopwatch } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { FC, PropsWithChildren, useEffect, useMemo, useRef, useState } from "react";
import { GetTasksQueryVariables } from "../../graphql/getTasks.graphql";
import { useTasksQuery } from "../../hooks/use-tasks-query";
import type { ModalTaskTimeTrackingRef } from "../../modals/modal-task-time-tracking";
import { TimeTrackingTask } from "./time-tracking-task";
import { TaskTimeTracking, TaskTimeTrackingUser } from "./time-tracking-types";

const ModalTaskTimeTracking = dynamic(
  () => import("../../modals/modal-task-time-tracking").then((mod) => mod.ModalTaskTimeTracking),
  {
    ssr: false,
    loading: nonLoading,
  },
);

export const TimeTrackingTasks: FC<PropsWithChildren> = (props) => {
  const { activatedFolder, state } = useTasks();
  const layout = useLayout();
  const { removeQueries, setQueries } = useRouter();
  const searchs = useSearchParams();
  const queryDate = searchs.get("date");
  const modalTaskTimeTrackingRef = useRef<ModalTaskTimeTrackingRef>(null);
  const [view, setView] = useState<CalendarView>(CalendarView.MONTH);

  const groupVariables = useMemo<GetTasksQueryVariables>(() => {
    const date = queryDate ? new Date(+queryDate * 1000) : new Date();
    const range = DateTime.getRange(date, "month");

    const fromTrackingTime = DateTime.toSeconds(range.start);
    const toTrackingTime = DateTime.toSeconds(range.end);

    return {
      ...state.variables,
      folderId: activatedFolder?._id,
      fromTrackingTime,
      toTrackingTime,
      parentId: "root",
      all: true,
    };
  }, [state, activatedFolder?._id, queryDate]);

  const { getTasks, tasks } = useTasksQuery({ variables: groupVariables });

  useEffect(() => {
    getTasks();
  }, [groupVariables]);

  const timeTrackingUsers = tasks.reduce(
    (acc, task) => {
      task.timeTrackings?.forEach((timeTracking) => {
        if (!timeTracking.user) return;
        const user = timeTracking.user;
        if (!acc.find((u) => u.user?.userId === user.userId)) {
          acc.push({ user, timeTrackings: [timeTracking] });
        } else {
          acc.find((u) => u.user?.userId === user.userId)?.timeTrackings.push(timeTracking);
        }
      });

      return acc;
    },
    [] as { user: TaskTimeTrackingUser; timeTrackings: TaskTimeTracking[] }[],
  );

  const onChangeDate = (date: Date) => {
    const isThisMonth = DateTime.isSame(date, new Date(), "month");
    if (isThisMonth) {
      removeQueries(["date"]);
    } else {
      setQueries({
        date: (DateTime.toSeconds(date) + 60 * 60 * 24).toString(),
      });
    }
  };

  const assigneeUserIds: string[] = searchs.get("assigneeUserIds")?.split(",") || [];
  const [assignees] = useWorkspaceMembers([
    ...assigneeUserIds,
    ...timeTrackingUsers.map((v) => v.user?.userId || ""),
  ]);

  return (
    <ScrollArea.Autosize mah="100%" flex={1}>
      <Stack p="sm">
        <Card shadow="xs" p="md">
          <Calendar
            key={queryDate}
            view={view}
            onViewChange={setView}
            initialDate={queryDate ? new Date(+queryDate * 1000) : new Date()}
            onChange={(range) => onChangeDate(range.start)}
            renderDayHead={(date, hovered, isOutOfRange) => {
              return (
                <Group>
                  <Tooltip label={<Trans>Add time trackings</Trans>}>
                    <ActionIcon
                      variant="subtle"
                      radius={100}
                      color="gray"
                      onClick={() => {
                        if (isOutOfRange) onChangeDate(date);
                        modalTaskTimeTrackingRef.current?.open({
                          date,
                          onSubmit: () => getTasks(),
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

              const timeTrackingTasks = tasks.filter(
                (task) =>
                  task.timeTrackings &&
                  task.timeTrackings.some(
                    (v) => v.startAt && DateTime.isSame(v.startAt, date, "day"),
                  ),
              );

              return (
                <Stack w="100%" px={5} pb={5} gap={10}>
                  <Renderer visible={timeTrackingTasks.length > 0}>
                    <Stack gap={5}>
                      {timeTrackingTasks.map((task) => (
                        <TimeTrackingTask key={task._id} date={date} task={task} />
                      ))}
                    </Stack>
                  </Renderer>
                </Stack>
              );
            }}
          />
        </Card>

        {timeTrackingUsers.length > 0 && (
          <Group gap={8} justify="left" w={layout.view === "mobile" ? "100%" : undefined}>
            {timeTrackingUsers.map(({ user, timeTrackings }) => {
              const totalTime = timeTrackings.reduce((acc, t) => {
                if (t.endAt) {
                  const seconds = t.endAt - t.startAt;
                  return acc + seconds;
                }

                return acc;
              }, 0);

              const userInfo = assignees.find((m) => m.userId === user?.userId);
              if (!userInfo || !user) return null;

              return (
                <Card key={user?.userId} withBorder p={3} pr={10} radius={100} shadow="none">
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
        )}

        {props.children}

        <ModalTaskTimeTracking ref={modalTaskTimeTrackingRef} />
      </Stack>
    </ScrollArea.Autosize>
  );
};
