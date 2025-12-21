"use client";

import { useLayout } from "@/layout/layout-context";
import {
  HrmTimekeepingEntity,
  HrmTimekeepingStatus,
  HrmTimekeepingType,
} from "@/modules/hrm-timekeepings/hrm-timekeepings-types";
import { calculateTimekeepings } from "@/modules/hrm-timekeepings/hrm-timekeepings-utils";
import { OnModalCaptureTimekeeping } from "@/modules/hrm-timekeepings/modals/modal-request-timekeeping";
import { OnModalListTimekeepings } from "@/modules/hrm-timekeepings/modals/modal-timekeeping-list";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspaceMembers } from "@/modules/workspace-members/workspace-members-hooks";
import { WorkspaceMemberLegacy } from "@/modules/workspace-members/workspace-members-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { DateTime } from "@joy-one-client/utils/date-time";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  Card,
  Center,
  Group,
  Space,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
  em,
  useMantineTheme,
} from "@mantine/core";
import { useForceUpdate } from "@mantine/hooks";
import { IconAnalyze, IconAnalyzeOff, IconClockPlus } from "@tabler/icons-react";
import { FC, Fragment, useEffect } from "react";
import { Avatar } from "../../components/avatar";
import { Calendar } from "../../components/calendar/calendar";
import { Circle } from "../../components/circle";

interface HrmTimekeepingsProps {
  initialDate?: Date;
  hideUserAvatar?: boolean;
  timekeepings: HrmTimekeepingEntity[];
  showAddButton?: boolean;
  onDateChange?: (range: { start: Date; end: Date }) => void;
}

export const HrmTimekeepingsCalendar: FC<HrmTimekeepingsProps> = (props) => {
  const { timekeepings, initialDate } = props;

  const workspace = useWorkspace();
  const forceUpdate = useForceUpdate();
  const layout = useLayout();
  const color = useColor();

  const [userMemberInfos] = useWorkspaceMembers([...new Set(timekeepings.map((v) => v.userId))]);

  useEffect(() => {
    const interval = setInterval(forceUpdate, 1000 * 45);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Stack>
      <Calendar
        initialDate={initialDate}
        onChange={props.onDateChange}
        renderDayHead={(date, hoverd, isOutOfRange) => {
          if (props.showAddButton && !isOutOfRange && (hoverd || layout.view !== "desktop"))
            return (
              <Group>
                <Tooltip
                  label={t({ message: "Request Check-in/out", comment: "HRM Timekeepings" })}
                >
                  <ActionIcon
                    variant="subtle"
                    radius={100}
                    color="gray"
                    onClick={() => OnModalCaptureTimekeeping(date)}
                  >
                    <IconClockPlus size={18} strokeWidth={1.5} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            );
        }}
        renderDay={(date) => {
          const groupByUsers = [...timekeepings]
            .filter((v) => DateTime.isSame(date, v.time, "day"))
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
            }, [] as { userId: string; user: WorkspaceMemberLegacy; timekeepings: HrmTimekeepingEntity[] }[]);

          return (
            <Group gap={5} align="start">
              {groupByUsers.map((v) => {
                const userInfo = userMemberInfos.find((m) => m.userId === v.userId);
                if (!userInfo) return null;

                const calculated = calculateTimekeepings({
                  timekeepings: v.timekeepings,
                  workSlots: workspace.settings.wSlots,
                  rules: workspace.settings.hrmTimeKeepingsRules,
                  workTimeType: userInfo.workingTimeType,
                });

                const nowCalculate = calculateTimekeepings({
                  timekeepings: [
                    ...v.timekeepings,
                    {
                      ...v.timekeepings[v.timekeepings.length - 1],
                      type: HrmTimekeepingType.CHECK_OUT,
                      time: DateTime.toSeconds(new Date()),
                    },
                  ],
                  workSlots: workspace.settings.wSlots,
                  rules: workspace.settings.hrmTimeKeepingsRules,
                  workTimeType: userInfo.workingTimeType,
                });

                const isToday = DateTime.isSame(date, new Date(), "day");
                const isWorking =
                  isToday &&
                  v.timekeepings[v.timekeepings.length - 1].type === HrmTimekeepingType.CHECK_IN;
                const range = DateTime.getRange(date, "day");
                const isPendingApproval = v.timekeepings.some(
                  (v) => v.status === HrmTimekeepingStatus.PENDING
                );

                // const debugDay = new Date(2024, 7, 1, 0, 0, 0);
                // const isDebug = DateTimeUtils.isMatchDay(date, debugDay);

                // if (isDebug) {
                //   console.log(`User > ${v.user.name}`);
                //   // console.log(JSON.stringify({
                //   //   timekeepings: v.timekeepings,
                //   //   workSlots: ws.settings.workSlots,
                //   //   rules: ws.settings.hrmTimeKeepingsRules
                //   // }))

                //   console.log(calculated.timeLogs);

                //   console.table(Object.keys(calculated).map((key) => {
                //     return {
                //       key: key,
                //       valueInHHMMSS: `${DateTimeUtils.toHHMMSS((calculated as any)[key])} (${(calculated as any)[key]})`
                //     }
                //   }));
                // }

                return (
                  <Card
                    shadow="none"
                    p={2}
                    key={`${v.userId}-${date.getTime()}`}
                    withBorder
                    radius={50}
                    style={{
                      overflow: "visible",
                      cursor: "pointer",
                      borderColor: isPendingApproval ? color("orange") : undefined,
                    }}
                    onClick={() =>
                      OnModalListTimekeepings({
                        query: {
                          userId: v.userId,
                          fromTime: DateTime.toSeconds(range.start),
                          toTime: DateTime.toSeconds(range.end),
                        },
                        captured: true,
                      })
                    }
                  >
                    <Stack gap={3} align="center" pb={5}>
                      {props.hideUserAvatar ? (
                        <Space pt={3} />
                      ) : (
                        <Avatar user={v.user} size={30} hideOnlineStatus={!isToday} />
                      )}
                      <Stack gap={0}>
                        <Text c={isWorking ? "orange" : "dark"} ta="center" fz={em(10)} fw={700}>
                          {DateTime.toHHMM(
                            isWorking ? nowCalculate.totalWorkingTime : calculated.totalWorkingTime
                          )}
                        </Text>

                        <Group justify="center" gap={2}>
                          {calculated.lateTime > 0 && <Circle size={8} bg="red.8" />}
                          {calculated.overTime > 0 && <Circle size={8} bg="primary" />}
                        </Group>

                        {(function () {
                          if (!isToday) return null;
                          if (isWorking) {
                            return (
                              <Center mt={5}>
                                <ThemeIcon variant="transparent" size="xs" color="orange">
                                  <IconAnalyze strokeWidth={1.5} size={16} className="animRotate" />
                                </ThemeIcon>
                              </Center>
                            );
                          }
                        })()}
                      </Stack>
                    </Stack>
                  </Card>
                );
              })}
            </Group>
          );
        }}
      />
    </Stack>
  );
};

export const TimekeepingsCalendarExplain: FC = () => {
  const theme = useMantineTheme();

  return (
    <Fragment>
      <Group gap={5}>
        <Circle size={8} bg="red.8" />
        <Text fz={em(12)}>
          <Trans>Late</Trans>
        </Text>
      </Group>
      <Group gap={5}>
        <Circle size={8} bg="orange.5" />
        <Text fz={em(12)}>
          <Trans>Early leave</Trans>
        </Text>
      </Group>

      <Group gap={5}>
        <Circle size={8} bg="primary" />
        <Text fz={em(12)}>
          <Trans>Overtime</Trans>
        </Text>
      </Group>

      <Group gap={5}>
        <IconAnalyze
          strokeWidth={1.5}
          size={16}
          color={theme.colors.orange[6]}
          className="animRotate"
        />
        <Text fz={em(12)}>
          <Trans>Working</Trans>
        </Text>
      </Group>

      <Group gap={5}>
        <IconAnalyzeOff strokeWidth={1.5} size={16} color={theme.colors.gray[6]} />
        <Text fz={em(12)}>
          <Trans>Temporary off</Trans>
        </Text>
      </Group>
    </Fragment>
  );
};
