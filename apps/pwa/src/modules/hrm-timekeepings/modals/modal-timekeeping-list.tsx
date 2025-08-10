"use client";

import { Button } from "@/components/buttons/button";
import { ButtonViewMore } from "@/components/buttons/button-view-more";
import { Empty } from "@/components/empty";
import { Errored } from "@/components/errored";
import { ModalTitle } from "@/components/modal-title";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { HrmTimekeepingCard } from "@/modules/hrm-timekeepings/hrm-timekeeping-card";
import {
  approveTimekeeping,
  getTimekeepings,
} from "@/modules/hrm-timekeepings/hrm-timekeepings-service";
import {
  HrmTimekeepingEntity,
  HrmTimekeepingStatus,
  HrmTimekeepingType,
} from "@/modules/hrm-timekeepings/hrm-timekeepings-types";
import { calculateTimekeepings } from "@/modules/hrm-timekeepings/hrm-timekeepings-utils";
import { num, t } from "@/modules/lang/lang-service";
import { useWorkspaceMembers } from "@/modules/workspace-members/workspace-members-hooks";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { DateTimeUtils } from "@/utils/dateTime.utils";
import { useList } from "@/components/list/use-list";
import {
  Badge,
  Center,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  em,
  useMantineTheme,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconAnalyze, IconClockCheck, IconListCheck, IconMoodSad } from "@tabler/icons-react";
import { Fragment, type FC } from "react";

interface ModalTImekeepingListProps {
  query?: any;
  title?: string;
  captured?: boolean;
}

export const ModalTImekeepingList: FC<ModalTImekeepingListProps> = (props) => {
  const workspace = useWorkspace();
  const theme = useMantineTheme();

  const timekeepings = useList<HrmTimekeepingEntity>({
    fetch: (q) =>
      getTimekeepings({
        sortTime: 1,
        getAll: props.captured,
        ...q,
        ...props.query,
      }),
  });

  const [userMemberInfos] = useWorkspaceMembers([props.query?.userId].filter(Boolean));
  const member = props.query?.userId
    ? userMemberInfos.find((member) => member.userId === props.query?.userId)
    : null;

  useEventsListener(
    [
      EventType.HRM_TIMEKEEPING_MEMBER_CHECK_IN,
      EventType.HRM_TIMEKEEPING_MEMBER_CHECK_OUT,
      EventType.HRM_TIMEKEEPING_MANUAL_APPROVAL,
      EventType.HRM_TIMEKEEPING_REJECTED,
      EventType.HRM_TIMEKEEPING_REMOVED,
    ],
    () => {
      timekeepings.fetch(true, { isSilient: true });
    }
  );

  const calculated = calculateTimekeepings({
    timekeepings: timekeepings.data,
    rules: workspace.settings.hrmTimeKeepingsRules,
    workSlots: workspace.settings.wSlots,
    workTimeType: member?.workingTimeType,
  });

  const close = () => {
    modals.close("ModalListTimekeepings");
  };

  const lastTimekeeping = timekeepings.data[timekeepings.data.length - 1];
  const isWorking =
    lastTimekeeping &&
    DateTimeUtils.isToday(lastTimekeeping.time * 1000) &&
    lastTimekeeping.type === HrmTimekeepingType.CHECK_IN;
  const isForgotCheckOut =
    lastTimekeeping &&
    !DateTimeUtils.isToday(lastTimekeeping.time * 1000) &&
    lastTimekeeping.type !== HrmTimekeepingType.CHECK_OUT;

  const isEmpty = timekeepings.count === 0 && !timekeepings.isFetching && !timekeepings.error;

  const approveAll = () => {
    Promise.all(
      timekeepings.data.map((timekeeping) => {
        return approveTimekeeping(timekeeping._id, true);
      })
    );
    close();
  };

  const pendingTimekeepings = timekeepings.data.filter(
    (v) => v.status === HrmTimekeepingStatus.PENDING
  );

  return (
    <Stack>
      {isEmpty ? (
        <Empty />
      ) : (
        props.captured && (
          <Fragment>
            {(function () {
              if (isWorking) {
                return (
                  <Center p={10}>
                    <Group gap={5}>
                      <IconAnalyze
                        strokeWidth={1.5}
                        size={18}
                        color={theme.colors.orange[6]}
                        className="animRotate"
                      />
                      <Text fz={em(15)} c="orange">
                        {t("working")}
                      </Text>
                    </Group>
                  </Center>
                );
              }

              if (isForgotCheckOut) {
                return (
                  <Center p={10}>
                    <Group gap={5}>
                      <IconMoodSad strokeWidth={1.5} size={18} color={theme.colors.gray[6]} />
                      <Text fz={em(15)} c="gray">
                        {t("hrm_timekeepings_not_check_out")}
                      </Text>
                    </Group>
                  </Center>
                );
              }

              return (
                <SimpleGrid cols={1} spacing={5}>
                  <Group gap={10}>
                    <Text fw={700}>{t("hrm_timekeepings_working_time")}:</Text>
                    <Text>{num(calculated.totalWorkingTime, { type: "hours" })}</Text>
                    {calculated.totalWorkingTime > 0 && (
                      <Badge color="green">
                        {DateTimeUtils.toHHMM(calculated.totalWorkingTime)}
                      </Badge>
                    )}
                  </Group>

                  {calculated.overTime > 0 && (
                    <Group gap={10}>
                      <Text fw={700}>{t("hrm_timekeepings_overtime")}:</Text>
                      <Text>{num(calculated.overTime, { type: "hours" })}</Text>
                      {calculated.overTime > 0 && (
                        <Badge color="green">{DateTimeUtils.toHHMM(calculated.overTime)}</Badge>
                      )}
                    </Group>
                  )}

                  {calculated.lateTime > 0 && (
                    <Group gap={10}>
                      <Text fw={700}>{t("hrm_timekeepings_late")}:</Text>
                      <Text>{num(calculated.lateTime, { type: "hours" })}</Text>
                      {calculated.lateTime > 0 && (
                        <Badge color="red">{DateTimeUtils.toHHMM(calculated.lateTime)}</Badge>
                      )}
                    </Group>
                  )}
                </SimpleGrid>
              );
            })()}
          </Fragment>
        )
      )}

      {timekeepings.isHasData && (
        <Fragment>
          {pendingTimekeepings.length > 0 && (
            <Group justify="space-between" wrap="nowrap">
              <Text>
                {t("hrm_timekeepings_approval_count", { count: num(pendingTimekeepings.length) })}
              </Text>

              <Button
                size="xs"
                onClick={() => approveAll()}
                variant="outline"
                radius={100}
                leftIcon={IconListCheck}
              >
                {t("approve_all")}
              </Button>
            </Group>
          )}

          {timekeepings.data.map((timekeeping) => (
            <HrmTimekeepingCard key={timekeeping._id} timekeeping={timekeeping} />
          ))}
        </Fragment>
      )}

      {timekeepings.isFetching && <Skeleton height={150} />}
      {timekeepings.error && <Errored error={timekeepings.error} />}

      {timekeepings.isAbleToLoadMore && (
        <Center>
          <ButtonViewMore onClick={() => timekeepings.fetch()} />
        </Center>
      )}
    </Stack>
  );
};

export const OnModalListTimekeepings = (props: ModalTImekeepingListProps) => {
  return modals.open({
    modalId: "ModalListTimekeepings",
    title: (
      <ModalTitle title={props.title || t("hrm_timekeepings_history")} icon={IconClockCheck} />
    ),
    children: <ModalTImekeepingList {...props} />,
    size: "lg",
  });
};
