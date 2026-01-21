"use client";

import { Avatar } from "@/components/avatar";
import { ButtonSelect } from "@/components/buttons/button-select";
import { Empty } from "@/components/empty";
import { Errored } from "@/components/errored";
import { NumberFormat } from "@/components/format/number-format";
import { useList } from "@/components/list/use-list";
import { Renderer } from "@/components/renderer";
import { SectionTitle } from "@/components/session-title";
import { useTags } from "@/modules/tags/tags-context";
import { TagType } from "@/modules/tags/tags-types";
import { getTasks } from "@/modules/tasks/tasks-service";
import { DefaultTaskStatusId, TaskEntity } from "@/modules/tasks/tasks-types";
import { WorkspaceMemberDataFragment } from "@/modules/workspace-members/graphql/fragmentWorkspaceMember.graphql";
import { WidgetProps } from "@/widgets/widgets-types";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans } from "@lingui/react/macro";
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

  const users = tasks.data.reduce<WorkspaceMemberDataFragment[]>((acc, task) => {
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
  }, []);

  return (
    <Card shadow="xs" p={16} w="100%">
      <Stack>
        <SectionTitle name={<Trans>Tasks time trackings</Trans>} icon={IconStopwatch}>
          <Group gap={8}>
            <ButtonSelect
              icon={IconFolder}
              label={<Trans>Folder</Trans>}
              autoHideLabel
              activeColor={
                tasks.params.folderId
                  ? taskFolderTags.find((f) => f._id === tasks.params.folderId)?.color || "primary"
                  : "gray"
              }
              iconStrokeWidth={1.8}
              value={tasks.params.folderId}
              options={taskFolderTags.map((f) => ({
                label: f.name,
                value: f._id,
                leftSession: (
                  <ThemeIcon color={f.color || "gray"} variant="transparent">
                    <IconFolder />
                  </ThemeIcon>
                ),
              }))}
              onClear={() => tasks.removeParams(["folderId"])}
              onChange={(value) => tasks.setParams({ folderId: value })}
              enabled={taskFolderTags.length > 0}
            />
          </Group>
        </SectionTitle>

        <Renderer visible={tasks.isFetching}>
          <Skeleton h={200} />
        </Renderer>

        <Errored visible={tasks.isHasError} error={tasks.error} p={0} />

        <Empty visible={!tasks.isFetching && tasks.isEmpty && users.length === 0} />

        <Renderer visible={!tasks.isFetching && users.length > 0}>
          <Table withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  <Trans>Member</Trans>
                </Table.Th>
                <Table.Th>
                  <Trans>Total assigned tasks</Trans>
                </Table.Th>
                <Table.Th>
                  <Trans>Tasks completed rate</Trans>
                </Table.Th>
                <Table.Th>
                  <Trans>Time trackings</Trans>
                </Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {users.map((user) => {
                const now = DateTime.toSeconds(new Date());
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
                    <Table.Td>
                      <NumberFormat value={assignedTasks.length} />
                    </Table.Td>
                    <Table.Td>
                      <NumberFormat
                        value={(completedAssignedTasks.length * 100) / assignedTasks.length}
                        format={{ maximumFractionDigits: 2 }}
                        suffix="%"
                      />
                    </Table.Td>
                    <Table.Td>
                      {totalTimeTrackings > 0 ? DateTime.toHHMM(totalTimeTrackings) : "--"}
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
