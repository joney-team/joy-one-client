"use client";

import { Button } from "@/components/buttons/button";
import { ButtonViewMore } from "@/components/buttons/button-view-more";
import { Empty } from "@/components/empty";
import { Errored } from "@/components/errored";
import { NumberFormat } from "@/components/format/number-format";
import { useList } from "@/components/list/use-list";
import { ModalHead } from "@/components/modal/modal-head";
import { EventType } from "@/graphql/enums.graphql";
import { useEventsListener } from "@/modules/events/event-service";
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
import {
  calculateTimekeepings,
  workingTimeHours,
} from "@/modules/hrm-timekeepings/hrm-timekeepings-utils";
import { useWorkspaceMembers } from "@/modules/workspace-members/workspace-members-hooks";
import { useWorkspaceSetting } from "@/modules/workspace-settings/hooks/use-workspace-setting";
import { DateTime } from "@joy-one-client/utils/date-time";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
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
  const theme = useMantineTheme();
  const { workspaceSetting } = useWorkspaceSetting();

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
      EventType.HrmTimekeepingMemberCheckIn,
      EventType.HrmTimekeepingMemberCheckOut,
      EventType.HrmTimekeepingManualApproval,
      EventType.HrmTimekeepingRejected,
      EventType.HrmTimekeepingRemoved,
    ],
    () => {
      timekeepings.fetch(true, { isSilient: true });
    }
  );

  const calculated = calculateTimekeepings({
    timekeepings: timekeepings.data,
    rules: workspaceSetting?.hrmTimeKeepingsRules,
    // TODO: Workspace schedule migration
    workSlots: [],
    workTimeType: member?.workingTimeType as any,
  });

  const close = () => {
    modals.close("ModalListTimekeepings");
  };

  const lastTimekeeping = timekeepings.data[timekeepings.data.length - 1];
  const isWorking =
    lastTimekeeping &&
    DateTime.isSame(lastTimekeeping.time * 1000, new Date(), "day") &&
    lastTimekeeping.type === HrmTimekeepingType.CHECK_IN;
  const isForgotCheckOut =
    lastTimekeeping &&
    !DateTime.isSame(lastTimekeeping.time * 1000, new Date(), "day") &&
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
                        <Trans>Working</Trans>
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
                        <Trans>Not check out</Trans>
                      </Text>
                    </Group>
                  </Center>
                );
              }

              return (
                <SimpleGrid cols={1} spacing={5}>
                  <Group gap={10}>
                    <Text fw={700}>
                      <Trans>Working time</Trans>:
                    </Text>
                    <Text>
                      <NumberFormat value={workingTimeHours(calculated.totalWorkingTime)} />
                    </Text>
                    {calculated.totalWorkingTime > 0 && (
                      <Badge color="green">{DateTime.toHHMM(calculated.totalWorkingTime)}</Badge>
                    )}
                  </Group>

                  {calculated.overTime > 0 && (
                    <Group gap={10}>
                      <Text fw={700}>
                        <Trans>Working time</Trans>:
                      </Text>
                      <Text>
                        <NumberFormat value={workingTimeHours(calculated.overTime)} />
                      </Text>
                      {calculated.overTime > 0 && (
                        <Badge color="green">{DateTime.toHHMM(calculated.overTime)}</Badge>
                      )}
                    </Group>
                  )}

                  {calculated.lateTime > 0 && (
                    <Group gap={10}>
                      <Text fw={700}>
                        <Trans>Late</Trans>:
                      </Text>
                      <Text>
                        <NumberFormat value={workingTimeHours(calculated.lateTime)} />
                      </Text>
                      {calculated.lateTime > 0 && (
                        <Badge color="red">{DateTime.toHHMM(calculated.lateTime)}</Badge>
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
                <Trans>
                  There are <NumberFormat value={pendingTimekeepings.length} /> timekeeping requests
                  pending approval
                </Trans>
              </Text>

              <Button
                size="xs"
                onClick={() => approveAll()}
                variant="outline"
                radius={100}
                leftIcon={IconListCheck}
              >
                <Trans>Approve all</Trans>
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
    title: <ModalHead name={props.title || t`Timekeepings history`} icon={IconClockCheck} />,
    children: <ModalTImekeepingList {...props} />,
    size: "lg",
  });
};
