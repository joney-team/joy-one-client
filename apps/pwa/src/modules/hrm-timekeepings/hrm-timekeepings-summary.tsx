"use client";

import { NumberFormat } from "@/components/format/number-format";
import { HrmTimekeepingsRules } from "@/graphql/types.graphql";
import { useLayout } from "@/layout/layout-context";
import { HrmTimekeepingEntity } from "@/modules/hrm-timekeepings/hrm-timekeepings-types";
import {
  calculateTimekeepings,
  workingTimeHours,
} from "@/modules/hrm-timekeepings/hrm-timekeepings-utils";
import { useColor } from "@/modules/theme/use-color";
import { UserCard } from "@/modules/users/components/user-card";
import { useWorkspaceMembers } from "@/modules/workspace-members/workspace-members-hooks";
import { WorkSlot } from "@/types";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans } from "@lingui/react/macro";
import { Badge, Card, Group, SimpleGrid, Stack, Table, Text } from "@mantine/core";
import { FC } from "react";
import { WorkspaceMemberDataFragment } from "../workspace-members/graphql/fragmentWorkspaceMember.graphql";
import { useWorkspaceSetting } from "../workspace-settings/hooks/use-workspace-setting";

interface HrmTimekeepingsSummaryProps {
  timekeepings: HrmTimekeepingEntity[];
}

export const HrmTimekeepingsSummary: FC<HrmTimekeepingsSummaryProps> = (props) => {
  const { timekeepings } = props;
  const { workspaceSetting } = useWorkspaceSetting();
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
    }, [] as { userId: string; user: WorkspaceMemberDataFragment; timekeepings: HrmTimekeepingEntity[] }[]);

  if (viewport.view === "mobile")
    return (
      <Card shadow="xs" p={10}>
        <SimpleGrid cols={{ md: 4 }}>
          {groupByUsers.map((groupByUser) => {
            const summary = useTimekeepingsSummary(groupByUser.timekeepings, {
              userInfo: userMemberInfos.find((v) => v.userId === groupByUser.userId)!,
              // TODO: Workspace schedule migration
              workSlots: [],
              rules: workspaceSetting?.hrmTimeKeepingsRules ?? undefined,
            });

            return (
              <Card key={groupByUser.userId} withBorder shadow="none" p={10}>
                <Group>
                  <UserCard user={groupByUser.user} />
                  <Stack gap={0}>
                    <Text>
                      <strong>
                        <Trans>Working hours</Trans>:{" "}
                      </strong>
                      <NumberFormat value={DateTime.countHours(summary.totalWorkingTime)} />{" "}
                      <Trans>hours</Trans>
                    </Text>
                    <Text c={summary.totalOvertime > 0 ? "primary" : "dark"}>
                      <strong>
                        <Trans>Overtime</Trans>:{" "}
                      </strong>
                      <NumberFormat value={DateTime.countHours(summary.totalOvertime)} />{" "}
                      <Trans>hours</Trans>
                    </Text>
                    <Text c={summary.totalLateTime > 0 ? "red" : "dark"}>
                      <strong>
                        <Trans>Late</Trans>:{" "}
                      </strong>
                      <NumberFormat value={DateTime.countHours(summary.totalLateTime)} />{" "}
                      <Trans>hours</Trans>
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
            <Table.Th>
              <Trans>Members</Trans>
            </Table.Th>
            <Table.Th ta="right">
              <Trans>Late</Trans>
            </Table.Th>
            <Table.Th ta="right">
              <Trans>Overtime</Trans>
            </Table.Th>
            <Table.Th ta="right">
              <Trans>Working</Trans>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {groupByUsers.map((groupByUser) => {
            const summary = useTimekeepingsSummary(groupByUser.timekeepings, {
              userInfo: userMemberInfos.find((v) => v.userId === groupByUser.userId)!,
              // TODO: Workspace schedule migration
              workSlots: [],
              rules: workspaceSetting?.hrmTimeKeepingsRules,
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
                      <Badge color="red">{DateTime.toHHMM(summary.totalLateTime)}</Badge>
                    )}

                    <Text>
                      <NumberFormat value={workingTimeHours(summary.totalLateTime)} />
                    </Text>
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
                        {DateTime.toHHMM(summary.totalOvertime)}
                      </Badge>
                    )}

                    <Text>
                      <NumberFormat value={workingTimeHours(summary.totalOvertime)} />
                    </Text>
                  </Group>
                </Table.Td>

                <Table.Td ta="right">
                  <Group justify="end">
                    {summary.totalWorkingTime > 0 && (
                      <Badge color="green">{DateTime.toHHMM(summary.totalWorkingTime)}</Badge>
                    )}

                    <Text>
                      <NumberFormat value={workingTimeHours(summary.totalWorkingTime)} />
                    </Text>
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
    userInfo: WorkspaceMemberDataFragment;
    workSlots?: WorkSlot[] | null;
    rules?: HrmTimekeepingsRules | null;
  }
) => {
  let pointedTimekeepingIds: string[] = [];
  let totalWorkingTime = 0;
  let totalOvertime = 0;
  let totalLateTime = 0;

  timekeepings.forEach((v) => {
    if (pointedTimekeepingIds.includes(v._id)) return;

    const _timekeepings = timekeepings.filter((t) =>
      DateTime.isSame(new Date(t.time * 1000), v.time * 1000, "day")
    );

    pointedTimekeepingIds = [..._timekeepings.map((v) => v._id), v._id, ...pointedTimekeepingIds];

    const calculated = calculateTimekeepings({
      timekeepings: _timekeepings,
      workSlots: args.workSlots,
      rules: args.rules,
      workTimeType: args.userInfo?.workingTimeType as any,
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
