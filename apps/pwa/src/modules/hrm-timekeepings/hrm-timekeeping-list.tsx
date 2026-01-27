"use client";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { ButtonSelect } from "@/components/buttons/button-select";
import { Image } from "@/components/image";
import { useList } from "@/components/list/use-list";
import { SectionTitle } from "@/components/session-title";
import { EventType } from "@/graphql/enums.graphql";
import { useLayout } from "@/layout/layout-context";
import { useEventsListener } from "@/modules/events/event-service";
import {
  HrmTimekeepingsCalendar,
  TimekeepingsCalendarExplain,
} from "@/modules/hrm-timekeepings/hrm-timekeepings-calendar";
import { HrmTimekeepingsSummary } from "@/modules/hrm-timekeepings/hrm-timekeepings-summary";
import { OnModalListTimekeepings } from "@/modules/hrm-timekeepings/modals/modal-timekeeping-list";
import { WorkspaceMemberSelector } from "@/modules/workspace-members/components/workspace-member-selector";
import { useWorkspaceMembers } from "@/modules/workspace-members/workspace-members-hooks";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { DateTime } from "@joy-one-client/utils/date-time";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  Card,
  Center,
  Group,
  Loader,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
  em,
} from "@mantine/core";
import { useHover } from "@mantine/hooks";
import {
  IconArrowRight,
  IconClipboardList,
  IconMinus,
  IconPlus,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { type FC } from "react";
import { useWorkspaceSetting } from "../workspace-settings/hooks/useWorkspaceSetting";
import { getTimekeepings } from "./hrm-timekeepings-service";
import { HrmTimekeepingEntity, HrmTimekeepingStatus } from "./hrm-timekeepings-types";

export const HrmTimekeepingList: FC = () => {
  const workspace = useWorkspace();
  const viewport = useLayout();
  const assigneesHover = useHover();
  const router = useRouter();
  const { isHrmTimekeepingAvailable } = useWorkspaceSetting();

  const getQuery = (query: any) => {
    let _query = { ...query };

    const date = _query.date ? new Date(+_query.date * 1000) : new Date();
    const range = DateTime.getRange(date, "month");
    const fromTime = DateTime.toSeconds(range.start);
    const toTime = DateTime.toSeconds(range.end);

    return {
      ..._query,
      fromTime,
      toTime,
      date,
      getAll: true,
      status: [HrmTimekeepingStatus.AUTO_APPROVAL, HrmTimekeepingStatus.MANUAL_APPROVAL],
    };
  };

  const timekeepings = useList<HrmTimekeepingEntity>({
    id: "timekeepings",
    fetch: (q) => getTimekeepings(getQuery(q)),
  });

  const pendingTimekeepings = useList<HrmTimekeepingEntity>({
    fetch: () => getTimekeepings({ status: HrmTimekeepingStatus.PENDING }),
  });

  useEventsListener(
    [
      EventType.HrmTimekeepingMemberCheckIn,
      EventType.HrmTimekeepingMemberCheckOut,
      EventType.HrmTimekeepingManualApproval,
      EventType.HrmTimekeepingRejected,
      EventType.HrmTimekeepingRemoved,
    ],
    () => {
      timekeepings.fetch(true, { isSilient: true });
      pendingTimekeepings.fetch(true, { isSilient: true });
    }
  );

  const query = getQuery(timekeepings.params);
  const [assignees, isAssigneesReady, setAssignee] = useWorkspaceMembers(query.assigneeUserIds);
  const assigneeUserIds: string[] = query.assigneeUserIds || [];

  if (
    !isHrmTimekeepingAvailable &&
    workspace.hasPermission(WorkspacePermission.HRM_TIMEKEEPINGS_CENSORSHIP)
  ) {
    return (
      <Stack p={16}>
        <Card p={25} shadow="xs">
          <Stack justify="center" align="center">
            <Center>
              <Image src={`/images/timekeeping-checkin.png`} w={em(250)} />
            </Center>

            <Title tt="capitalize" fw={500} fz={em(25)} c="primary">
              <Trans>Timekeeping setup</Trans>
            </Title>
            <Center>
              <Button
                rightSection={<IconArrowRight size={18} />}
                onClick={() => router.push("/WorkspaceSettings/hrm-timekeepings")}
              >
                <Trans>Start now</Trans>
              </Button>
            </Center>
          </Stack>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack p={16}>
      <SimpleGrid cols={{ md: 2 }}>
        <Group gap={10} justify={viewport.view === "mobile" ? "center" : "start"}>
          <WorkspaceMemberSelector
            onSelect={(user) => {
              if (!user) return;
              setAssignee(user as any);
              const isSelected = assigneeUserIds.includes(user.userId);
              let _assigneeUserIds: string[] = [...assigneeUserIds];
              if (isSelected) {
                _assigneeUserIds = _assigneeUserIds.filter((id) => id !== user.userId);
              } else {
                _assigneeUserIds.push(user.userId);
              }

              if (_assigneeUserIds.length === 0) {
                timekeepings.removeParams(["assigneeUserIds"]);
              } else {
                timekeepings.setParams({ assigneeUserIds: _assigneeUserIds });
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
                    leftIcon={IconUsers}
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
                        timekeepings.removeParams(["assigneeUserIds"]);
                      }}
                    >
                      <IconX size={7} strokeWidth={4} />
                    </ThemeIcon>
                  )}
                </Group>
              );
            }}
          />

          {pendingTimekeepings.count > 0 &&
            workspace.hasPermission(WorkspacePermission.HRM_TIMEKEEPINGS_CENSORSHIP) && (
              <ButtonSelect
                icon={IconClipboardList}
                label={t`Approval Timekeeping`}
                isActive={pendingTimekeepings.count > 0}
                quantity={pendingTimekeepings.count}
                activeColor="orange"
                onClick={() => {
                  if (pendingTimekeepings.count <= 0) return;
                  return OnModalListTimekeepings({
                    query: { status: HrmTimekeepingStatus.PENDING },
                    title: t`Approval Timekeeping`,
                  });
                }}
              />
            )}
        </Group>

        <Group justify={viewport.view === "mobile" ? "center" : "end"}>
          <TimekeepingsCalendarExplain />
        </Group>
      </SimpleGrid>

      <Card p={10} shadow="xs">
        <Stack>
          {timekeepings.isFetching ? (
            <Skeleton height={300} />
          ) : (
            <HrmTimekeepingsCalendar
              showAddButton
              timekeepings={timekeepings.data}
              onDateChange={(range) => {
                if (DateTime.isSame(range.start, new Date(), "day")) {
                  timekeepings.removeParams(["date"]);
                } else {
                  timekeepings.setParams({ date: DateTime.toSeconds(range.start) });
                }
              }}
            />
          )}
        </Stack>
      </Card>

      {timekeepings.isHasData && (
        <Stack gap={8}>
          <SectionTitle name={t`Total summary`} icon={IconUsers} />

          <HrmTimekeepingsSummary timekeepings={timekeepings.data} />
        </Stack>
      )}
    </Stack>
  );
};
