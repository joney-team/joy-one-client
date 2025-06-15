"use client";

import { useColor } from "@/modules/theme/use-color";
import { WorkSlot } from "@/types";
import { useLayout } from "@/layout/layout-context";
import {
  HrmTimekeepingEntity,
  HrmTimekeepingsRules,
} from "@/modules/hrm-timekeepings/hrm-timekeepings-types";
import { calculateTimekeepings } from "@/modules/hrm-timekeepings/hrm-timekeepings-utils";
import { num, t } from "@/modules/lang/lang-service";
import { useWorkspaceMembers } from "@/modules/workspace-members/workspace-members-hooks";
import { WorkspaceMember } from "@/modules/workspace-members/workspace-members-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { DateTimeUtils } from "@/utils/dateTime.utils";
import { Badge, Card, Group, SimpleGrid, Stack, Table, Text } from "@mantine/core";
import { FC } from "react";
import { UserCard } from "@/modules/users/components/user-card";

interface HrmTimekeepingsSummaryProps {
  timekeepings: HrmTimekeepingEntity[];
}

export const HrmTimekeepingsSummary: FC<HrmTimekeepingsSummaryProps> = (props) => {
  const { timekeepings } = props;
  const workspace = useWorkspace();
  const viewport = useLayout();
  const color = useColor();
  const [userMemberInfos] = useWorkspaceMembers([...new Set(timekeepings.map((v) => v.userId))]);

  const groupByUsers = [...timekeepings]
    .sort((a, b) => a.time - b.time)
    .reduce((out, item) => {
      const isExisted = out.find((v) => v.userId === item.userId);
      if (isExisted) {
        isExisted.timekeepings.push(item);
      } else {
        out.push({
          userId: item.userId,
          user: item.user,
          timekeepings: [item],
        });
      }

      return out;
    }, [] as { userId: string; user: WorkspaceMember; timekeepings: HrmTimekeepingEntity[] }[]);

  if (viewport.view === "mobile")
    return (
      <Card shadow="xs" p={10}>
        <SimpleGrid cols={{ md: 4 }}>
          {groupByUsers.map((groupByUser) => {
            const summary = useTimekeepingsSummary(groupByUser.timekeepings, {
              userInfo: userMemberInfos.find((v) => v.userId === groupByUser.userId)!,
              workSlots: workspace.settings.wSlots,
              rules: workspace.settings.hrmTimeKeepingsRules,
            });

            return (
              <Card key={groupByUser.userId} withBorder shadow="none" p={10}>
                <Group>
                  <UserCard user={groupByUser.user} />
                  <Stack gap={0}>
                    <Text>
                      <strong>Giờ công: </strong>
                      {num(DateTimeUtils.calculateWorkHours(summary.totalWorkingTime))} giờ
                    </Text>
                    <Text c={summary.totalOvertime > 0 ? "primary" : "dark"}>
                      <strong>OT: </strong>
                      {num(DateTimeUtils.calculateWorkHours(summary.totalOvertime))} giờ
                    </Text>
                    <Text c={summary.totalLateTime > 0 ? "red" : "dark"}>
                      <strong>Đi trễ: </strong>
                      {num(DateTimeUtils.calculateWorkHours(summary.totalLateTime))} giờ
                    </Text>
                  </Stack>
                </Group>
              </Card>
            );
          })}
        </SimpleGrid>
      </Card>
    );

  return (
    <Card shadow="xs" p={0}>
      <Table striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t("members")}</Table.Th>
            <Table.Th ta="right">{t("hrm_timekeepings_late")}</Table.Th>
            <Table.Th ta="right">{t("hrm_timekeepings_overtime")}</Table.Th>
            <Table.Th ta="right">{t("hrm_timekeepings_working_time")}</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {groupByUsers.map((groupByUser) => {
            const summary = useTimekeepingsSummary(groupByUser.timekeepings, {
              userInfo: userMemberInfos.find((v) => v.userId === groupByUser.userId)!,
              workSlots: workspace.settings.wSlots,
              rules: workspace.settings.hrmTimeKeepingsRules,
            });

            return (
              <Table.Tr key={groupByUser.userId}>
                <Table.Td>
                  <Group>
                    <UserCard user={groupByUser.user} />
                  </Group>
                </Table.Td>

                <Table.Td
                  ta="right"
                  c={summary.totalLateTime > 0 ? "red" : undefined}
                  fw={summary.totalLateTime > 0 ? 700 : undefined}
                >
                  <Group justify="end">
                    {summary.totalLateTime > 0 && (
                      <Badge color="red">{DateTimeUtils.toHHMM(summary.totalLateTime)}</Badge>
                    )}

                    <Text>{num(summary.totalLateTime, { type: "hours" })}</Text>
                  </Group>
                </Table.Td>

                <Table.Td
                  ta="right"
                  c={color(summary.totalOvertime > 0 ? "primary" : undefined)}
                  fw={summary.totalOvertime > 0 ? 700 : undefined}
                >
                  <Group justify="end">
                    {summary.totalOvertime > 0 && (
                      <Badge color={color("primary")}>
                        {DateTimeUtils.toHHMM(summary.totalOvertime)}
                      </Badge>
                    )}

                    <Text>{num(summary.totalOvertime, { type: "hours" })}</Text>
                  </Group>
                </Table.Td>

                <Table.Td ta="right">
                  <Group justify="end">
                    {summary.totalWorkingTime > 0 && (
                      <Badge color="green">{DateTimeUtils.toHHMM(summary.totalWorkingTime)}</Badge>
                    )}

                    <Text>{num(summary.totalWorkingTime, { type: "hours" })}</Text>
                  </Group>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Card>
  );
};

const useTimekeepingsSummary = (
  timekeepings: HrmTimekeepingEntity[],
  args: {
    userInfo: WorkspaceMember;
    workSlots?: WorkSlot[] | undefined;
    rules?: HrmTimekeepingsRules;
  }
) => {
  let pointedTimekeepingIds: string[] = [];
  let totalWorkingTime = 0;
  let totalOvertime = 0;
  let totalLateTime = 0;

  timekeepings.forEach((v) => {
    if (pointedTimekeepingIds.includes(v._id)) return;

    const _timekeepings = timekeepings.filter((t) =>
      DateTimeUtils.isMatchDay(new Date(t.time * 1000), v.time * 1000)
    );

    pointedTimekeepingIds = [..._timekeepings.map((v) => v._id), v._id, ...pointedTimekeepingIds];

    const calculated = calculateTimekeepings({
      timekeepings: _timekeepings,
      workSlots: args.workSlots,
      rules: args.rules,
      workTimeType: args.userInfo?.workingTimeType,
    });

    totalWorkingTime += calculated.totalWorkingTime;
    totalLateTime += calculated.lateTime;
    if (calculated.overTime) totalOvertime += calculated.overTime;
  });

  return {
    totalWorkingTime,
    totalOvertime,
    totalLateTime,
  };
};
