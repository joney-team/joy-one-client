"use client";

import { Avatar } from "@/components/avatar";
import { ButtonSelect } from "@/components/buttons/button-select";
import { Empty } from "@/components/empty";
import { Errored } from "@/components/errored";
import { Renderer } from "@/components/renderer";
import { SessionTitle } from "@/components/session-title";
import { num, t } from "@/modules/lang/lang-service";
import { useTags } from "@/modules/tags/tags-context";
import { TagType } from "@/modules/tags/tags-types";
import { getTasks } from "@/modules/tasks/tasks-service";
import { DefaultTaskStatusId, TaskEntity } from "@/modules/tasks/tasks-types";
import { WorkspaceMemberInfo } from "@/modules/workspace-members/workspace-members-types";
import { DateTimeUtils } from "@/utils/dateTime.utils";
import { StringUtils } from "@/utils/string.utils";
import { useList } from "@/components/list/use-list";
import { WidgetProps } from "@/widgets/types";
import { Card, Group, Skeleton, Stack, Table, Text, ThemeIcon } from "@mantine/core";
import { IconFolder, IconStopwatch } from "@tabler/icons-react";
import { FC } from "react";
import { ReportWidgetsContext } from "../types";

export const ReportTimeTrackingsWidget: FC<WidgetProps<ReportWidgetsContext>> = (props) => {
  const tags = useTags();
  const taskFolderTags = tags.list
    .filter((v) => v.type === TagType.TASK_FOLDER)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const tasks = useList<TaskEntity>({
    id: `report-time-trackings-${props.ctx.fromTime}-${props.ctx.toTime}`,
    fetch: (q) =>
      getTasks({
        ...q,
        fromTime: props.ctx.fromTime,
        toTime: props.ctx.toTime,
        getAll: true,
      }),
  });

  const users = tasks.data.reduce((acc, task) => {
    task.assigneeUsers?.map((user) => {
      if (!acc.some((u) => u.userId === user.userId)) {
        acc.push(user);
      }
    });

    task.timeTrackings?.map((t) => {
      if (!acc.some((u) => u.userId === t.user.userId)) {
        acc.push(t.user);
      }
    });

    return acc;
  }, [] as WorkspaceMemberInfo[]);

  return (
    <Card shadow="xs" p={16} w="100%">
      <Stack>
        <SessionTitle name={t("tasks_time_trackings")} icon={IconStopwatch}>
          <Group gap={8}>
            <ButtonSelect
              icon={IconFolder}
              label={t("folder")}
              autoHideLabel
              activeColor={
                tasks.params.tagFolderId
                  ? taskFolderTags.find((f) => f._id === tasks.params.tagFolderId)?.color ||
                    "primary"
                  : "gray"
              }
              iconStrokeWidth={1.8}
              value={tasks.params.tagFolderId}
              options={taskFolderTags.map((f) => ({
                label: f.name,
                value: f._id,
                leftSession: (
                  <ThemeIcon color={f.color || "gray"} variant="transparent">
                    <IconFolder />
                  </ThemeIcon>
                ),
              }))}
              onClear={() => tasks.removeParam("tagFolderId")}
              onChange={(value) => tasks.setParam("tagFolderId", value)}
              enabled={taskFolderTags.length > 0}
            />
          </Group>
        </SessionTitle>

        <Renderer visible={tasks.isFetching}>
          <Skeleton h={200} />
        </Renderer>

        <Errored visible={tasks.isHasError} error={tasks.error} p={0} />

        <Empty visible={!tasks.isFetching && tasks.isEmpty && users.length === 0} />

        <Renderer visible={!tasks.isFetching && users.length > 0}>
          <Table withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t("member")}</Table.Th>
                <Table.Th>
                  {StringUtils.capitalizeFirstLetter(`${t("total")} ${t("assigned_tasks")}`)}
                </Table.Th>
                <Table.Th>{t("tasks_completed_rate")}</Table.Th>
                <Table.Th>{t("time_trackings")}</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {users.map((user) => {
                const now = DateTimeUtils.timeToSeconds();
                const relatedTasks = tasks.data.filter((t) =>
                  t.relatedUserIds?.some((u) => u === user.userId)
                );

                const totalTimeTrackings = relatedTasks.reduce((acc, t) => {
                  const relatedTimeTrackings =
                    t.timeTrackings?.filter((t) => t.user.userId === user.userId) || [];
                  const totalTime = relatedTimeTrackings.reduce((acc, t) => {
                    const seconds = (t.endAt || now) - t.startAt;
                    return acc + seconds;
                  }, 0);

                  return acc + totalTime;
                }, 0);

                const assignedTasks = relatedTasks.filter((v) =>
                  v.assigneeUserIds?.includes(user.userId)
                );

                const completedAssignedTasks = assignedTasks.filter(
                  (t) => t.status === DefaultTaskStatusId.CLOSED
                );

                return (
                  <Table.Tr key={user.userId}>
                    <Table.Td>
                      <Group>
                        <Avatar user={user} size={20} hideOnlineStatus />
                        <Text>{user.name}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>{num(assignedTasks.length, { empty: "--" })}</Table.Td>
                    <Table.Td>
                      {assignedTasks.length > 0
                        ? num((completedAssignedTasks.length * 100) / assignedTasks.length, {
                            suffix: `% (${completedAssignedTasks.length}/${assignedTasks.length})`,
                            empty: "--",
                          })
                        : "--"}
                    </Table.Td>
                    <Table.Td>
                      {totalTimeTrackings > 0 ? DateTimeUtils.toHHMM(totalTimeTrackings) : "--"}
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Renderer>
      </Stack>
    </Card>
  );
};
