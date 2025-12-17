"use client";

import { Avatar } from "@/components/avatar";
import { Renderer } from "@/components/renderer";
import { renderTaskStatusStyle } from "@/modules/tasks/tasks-service";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Card, Group, Stack, Text, Tooltip } from "@mantine/core";
import { useForceUpdate, useHover } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { FC, useEffect } from "react";
import { TaskDataFragment } from "../../graphql/fragmentTask.graphql";
import { updateTaskPath } from "../../tasks-route-helpers";
import { TaskTimeTracking, TaskTimeTrackingUser } from "./time-tracking-types";

export const TimeTrackingTask: FC<{
  task: TaskDataFragment;
  date: Date;
}> = ({ task, date }) => {
  const now = DateTime.toSeconds(new Date());
  const workspace = useWorkspace();
  const hover = useHover();
  const forceUpdate = useForceUpdate();
  const color = useColor();
  const router = useRouter();

  const statusStyle = renderTaskStatusStyle(task.status, workspace.settings.taskStatuses);
  const assignee = task.assigneeUsers?.[0];

  const timeTrackings = (task.timeTrackings || []).filter(
    (v) => v.startAt && DateTime.isSame(v.startAt, date, "day")
  );

  const isHasInProgressTimeTracking = timeTrackings.find((v) => !!!v.endAt);

  const timeTrackingGroupByUsers: {
    user: TaskTimeTrackingUser;
    timeTrackings: TaskTimeTracking[];
  }[] = timeTrackings.reduce((acc: any, t) => {
    const user = t.user;
    if (acc.find((v: any) => v.user?._id === user?.userId)) {
      return acc.map((g: any) =>
        g.user?._id === user?.userId ? { ...g, timeTrackings: [...g.timeTrackings, t] } : g
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
        overflow: "hidden",
      }}
    >
      <Group
        w="100%"
        className="clickable"
        onClick={() => router.push(updateTaskPath({ code: task.code }))}
      >
        <Stack gap={8} w="100%">
          <Tooltip label={task.name}>
            <Text fz={14} fw={500} truncate>
              {task.name}
            </Text>
          </Tooltip>

          <Renderer visible={timeTrackingGroupByUsers.length > 0}>
            {timeTrackingGroupByUsers.map(({ user, timeTrackings }) => {
              const totalTime = timeTrackings.reduce((acc, t) => {
                const seconds = (t.endAt || now) - t.startAt;
                return acc + seconds;
              }, 0);

              if (!user) return null;

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
