"use client";

import { ButtonSelect } from "@/components/buttons/button-select";
import { useList } from "@/components/list/use-list";
import { EventType } from "@/graphql/enums.graphql";
import { useLayout } from "@/layout/layout-context";
import { useAuth } from "@/modules/auth/auth-context";
import { useEventsListener } from "@/modules/events/event-service";
import {
  HrmTimekeepingsCalendar,
  TimekeepingsCalendarExplain,
} from "@/modules/hrm-timekeepings/hrm-timekeepings-calendar";
import { getTimekeepings } from "@/modules/hrm-timekeepings/hrm-timekeepings-service";
import {
  HrmTimekeepingEntity,
  HrmTimekeepingStatus,
} from "@/modules/hrm-timekeepings/hrm-timekeepings-types";
import { OnModalCaptureTimekeeping } from "@/modules/hrm-timekeepings/modals/modal-request-timekeeping";
import { OnModalListTimekeepings } from "@/modules/hrm-timekeepings/modals/modal-timekeeping-list";
import { DateTime } from "@joy-one-client/utils/date-time";
import { ActionIcon, Card, Group, SimpleGrid, Skeleton, Stack, Text, em } from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconClipboardList } from "@tabler/icons-react";
import { type FC, useEffect } from "react";

export const HrmMemberTimekeepings: FC = () => {
  const layout = useLayout();
  const auth = useAuth();

  const getQuery = (query: any) => {
    let _query = { ...query };

    const date = _query.date ? DateTime.normalizeDate(_query.date) : new Date();
    const range = DateTime.getRange(date, "month");
    const fromTime = DateTime.toSeconds(range.start);
    const toTime = DateTime.toSeconds(range.end);

    return {
      fromTime,
      toTime,
      date,
      userId: auth.user._id,
      getAll: true,
      status: [
        HrmTimekeepingStatus.AUTO_APPROVAL,
        HrmTimekeepingStatus.MANUAL_APPROVAL,
        HrmTimekeepingStatus.PENDING,
      ],
    };
  };

  const timekeepings = useList<HrmTimekeepingEntity>({
    id: "user-timekeepings",
    fetch: (q) => getTimekeepings(getQuery(q)),
  });

  const pendingTimekeepings = useList<HrmTimekeepingEntity>({
    fetch: () => getTimekeepings({ status: HrmTimekeepingStatus.PENDING }),
  });

  useEffect(() => {
    layout.setComponents({
      head: "Lịch sử chấm công của tôi",
    });
  }, []);

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
    },
    [auth.user._id]
  );

  const query = getQuery(timekeepings.params);

  return (
    <Stack p={16}>
      <SimpleGrid cols={{ md: 2 }}>
        <Group gap={10} justify={layout.view === "mobile" ? "center" : "start"}>
          <ButtonSelect
            icon={IconClipboardList}
            label="Đề xuất chấm công"
            onClick={() => OnModalCaptureTimekeeping()}
          />

          {pendingTimekeepings.count > 0 && (
            <ButtonSelect
              icon={IconClipboardList}
              label="Đề xuất đang chờ duyệt"
              isActive={pendingTimekeepings.count > 0}
              quantity={pendingTimekeepings.count}
              activeColor="orange"
              onClick={() => {
                if (pendingTimekeepings.count <= 0) return;
                return OnModalListTimekeepings({
                  query: {
                    status: HrmTimekeepingStatus.PENDING,
                    userId: auth.user._id,
                  },
                  title: "Đề xuất đang chờ duyệt",
                });
              }}
            />
          )}
        </Group>

        <Group justify={layout.view === "mobile" ? "center" : "end"}>
          <TimekeepingsCalendarExplain />
        </Group>
      </SimpleGrid>

      <Card p={10} shadow="xs">
        <Stack>
          <Group justify="center">
            <ActionIcon
              variant="outline"
              size={30}
              radius={150}
              color="dark.2"
              onClick={() => timekeepings.setParams({ date: +query.fromTime - 1000 })}
            >
              <IconChevronLeft strokeWidth={1.5} size={18} />
            </ActionIcon>

            <Group justify="center">
              <Text ta="center" fz={em(15)}>{`Tháng ${
                query.date.getMonth() + 1
              }/${query.date.getFullYear()}`}</Text>
            </Group>

            <ActionIcon
              variant="outline"
              size={30}
              radius={150}
              color="dark.2"
              onClick={() => {
                timekeepings.setParams({ date: +query.toTime + 10000 });
              }}
            >
              <IconChevronRight strokeWidth={1.5} size={18} />
            </ActionIcon>
          </Group>

          {timekeepings.isFetching ? (
            <Skeleton height={300} />
          ) : (
            <HrmTimekeepingsCalendar
              initialDate={query.date}
              showAddButton
              timekeepings={timekeepings.data}
            />
          )}
        </Stack>
      </Card>
    </Stack>
  );
};
