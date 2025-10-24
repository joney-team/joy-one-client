import { type FC, useEffect } from "react";
import { ButtonSelect } from "@/components/buttons/button-select";
import {
  HrmTimekeepingsCalendar,
  TimekeepingsCalendarExplain,
} from "@/modules/hrm-timekeepings/hrm-timekeepings-calendar";
import { useLayout } from "@/layout/layout-context";
import { OnModalListTimekeepings } from "@/modules/hrm-timekeepings/modals/modal-timekeeping-list";
import { OnModalCaptureTimekeeping } from "@/modules/hrm-timekeepings/modals/modal-request-timekeeping";
import { useAuth } from "@/modules/auth/auth-context";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { getTimekeepings } from "@/modules/hrm-timekeepings/hrm-timekeepings-service";
import {
  HrmTimekeepingEntity,
  HrmTimekeepingStatus,
} from "@/modules/hrm-timekeepings/hrm-timekeepings-types";
import { DateTime } from "@/utils/date-time.utils";
import { useList } from "@/components/list/use-list";
import { ActionIcon, Card, Group, SimpleGrid, Skeleton, Stack, Text, em } from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconClipboardList } from "@tabler/icons-react";

export const HrmMemberTimekeepings: FC = () => {
  const layout = useLayout();
  const auth = useAuth();

  const getQuery = (query: any) => {
    let _query = { ...query };

    const date = _query.date ? new Date(+_query.date * 1000) : new Date();
    const range = DateTime.getStartEndOfMonth(date);

    const fromTime = DateTime.timeToSeconds(range.start);
    const toTime = DateTime.timeToSeconds(range.end);

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
      EventType.HRM_TIMEKEEPING_MEMBER_CHECK_IN,
      EventType.HRM_TIMEKEEPING_MEMBER_CHECK_OUT,
      EventType.HRM_TIMEKEEPING_MANUAL_APPROVAL,
      EventType.HRM_TIMEKEEPING_REJECTED,
      EventType.HRM_TIMEKEEPING_REMOVED,
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
                console.log("query", query);
                console.log("query", +query.toTime + 10000);
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
