"use client";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { CalendarViewSelector } from "@/components/calendar-view-selector";
import { DateFormat } from "@/components/format/date-format";
import { useGraphqlList } from "@/components/list/use-graphql-list";
import { Renderer } from "@/components/renderer";
import { Selector } from "@/components/selector";
import { TimeSlots } from "@/components/time-slots/time-slots";
import { TimeEvent, TimeInterval, TimeSlotsColumn } from "@/components/time-slots/time-slots.types";
import { getMinutesFromStringTime } from "@/components/time-slots/time-slots.utils";
import { BookingStatus, EventType } from "@/graphql/enums.graphql";
import { useColor } from "@/modules/theme/use-color";
import {
  WorkspaceMemberSelector,
  WorkspaceMemberSelectorValue,
} from "@/modules/workspace-members/components/workspace-member-selector";
import { useWorkspaceMembers } from "@/modules/workspace-members/workspace-members-hooks";
import { CalendarView } from "@/types";
import { nonLoading } from "@/utils/non-loading";
import { ObjectUtils } from "@/utils/object.utils";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  ActionIcon,
  Card,
  Center,
  Combobox,
  Group,
  Loader,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconCalendarDown,
  IconChevronLeft,
  IconChevronRight,
  IconCircleFilled,
  IconMinus,
  IconPlus,
  IconRefresh,
  IconUsers,
} from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { type FC, Fragment, useMemo, useRef } from "react";
import { bookingActiveStatus, bookingStatuses } from "./booking-constants";
import type { ModalCreateBookingRef } from "./modals/modal-create-booking";

import { getBookingTitle } from "./booking-utils";
import QUERY_BOOKINGS, { type BookingsQuery } from "./graphql/queryBookings.graphql";
import { useWorkspaceSetting } from "../workspace-settings/hooks/use-workspace-setting";
import type { ModalBookingDetailRef } from "./modals/modal-booking-detail";

const ModalCreateBooking = dynamic(
  () => import("./modals/modal-create-booking").then((mod) => mod.ModalCreateBooking),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const ModalBookingDetail = dynamic(
  () => import("./modals/modal-booking-detail").then((mod) => mod.ModalBookingDetail),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const normalizeQuery = (query: any) => {
  const date = query.date ? DateTime.normalizeDate(+query.date) : new Date();
  const view = Object.values(CalendarView).includes(query.view) ? query.view : CalendarView.WEEK;

  const { start, end } = DateTime.getRange(date, view);
  const startTime = new Date(start);
  const endTime = new Date(end);
  const assigneeUserIds = `${(query.assigneeUserIds ?? "").toString()}`.split(",").filter(Boolean);

  return {
    assigneeUserIds,
    startTime,
    endTime,
    view,
    date,
    status: query.status,
  };
};

export const BookingList: FC = () => {
  const color = useColor();
  const { t } = useLingui();
  const modalCreateBookingRef = useRef<ModalCreateBookingRef>(null);
  const modalBookingDetailRef = useRef<ModalBookingDetailRef>(null);
  const { workspaceSetting } = useWorkspaceSetting();

  const bookings = useGraphqlList<BookingsQuery["list"]["results"][number]>({
    query: QUERY_BOOKINGS,
    id: "bk",
    normalizeParams: (params) => {
      const query = normalizeQuery(params);
      const range = `${DateTime.toSeconds(query.startTime)}-${DateTime.toSeconds(query.endTime)}`;

      return ObjectUtils.cleanObj({
        ...params,
        rangeStartTime: range,
        assigneeUserIds: query.assigneeUserIds.length > 0 ? query.assigneeUserIds : undefined,
        status: query.status ?? bookingActiveStatus,
        getAll: true,
      });
    },
    isIgnoreEventActionType: true,
    events: [
      EventType.BookingNew,
      EventType.BookingUpdated,
      EventType.BookingCheckin,
      EventType.BookingInProgress,
      EventType.BookingCompleted,
      EventType.BookingCancelled,
    ],
  });

  const [assignees, isAssigneesReady, setWorkspaceMember] = useWorkspaceMembers(
    bookings.params.assigneeUserIds
  );

  const normalizedQuery = normalizeQuery(bookings.params);

  const setDate = (date: Date) => {
    const isToday = DateTime.isSame(date, new Date(), "day");
    if (isToday) {
      bookings.removeParams(["date"]);
    } else {
      bookings.setParams({ date: DateTime.toSeconds(date) });
    }
  };

  const nextRange = () => {
    const nextDate = DateTime.add(normalizedQuery.date, normalizedQuery.view, 1);
    if (DateTime.isSame(nextDate, new Date(), "day")) {
      bookings.removeParams(["date"]);
    } else {
      bookings.setParams({ date: DateTime.toSeconds(nextDate) });
    }
  };

  const previousRange = () => {
    const previousDate = DateTime.subtract(normalizedQuery.date, normalizedQuery.view, 1);
    if (DateTime.isSame(previousDate, new Date(), "day")) {
      bookings.removeParams(["date"]);
    } else {
      bookings.setParams({ date: DateTime.toSeconds(previousDate) });
    }
  };

  const displayDate = useMemo(() => {
    if (normalizedQuery.view === CalendarView.WEEK) {
      const { start, end } = DateTime.getRange(normalizedQuery.date, normalizedQuery.view);
      return (
        <Fragment>
          <DateFormat value={start} type="date" />
          {" - "}
          <DateFormat value={end} type="date" />
        </Fragment>
      );
    }

    if (normalizedQuery.view === CalendarView.MONTH) {
      return (
        <DateFormat
          value={normalizedQuery.date}
          type="custom"
          format={{ month: "short", year: "numeric" }}
        />
      );
    }

    return (
      <DateFormat
        value={normalizedQuery.date}
        type="custom"
        format={{ month: "short", day: "2-digit", year: "numeric" }}
      />
    );
  }, [normalizedQuery.view, normalizedQuery.date]);

  const toggleAssigneeUser = (member?: WorkspaceMemberSelectorValue | null) => {
    if (!member) return;

    setWorkspaceMember(member as any);
    const isSelected = normalizedQuery.assigneeUserIds.includes(member.userId);
    const assigneeUserIds = isSelected
      ? normalizedQuery.assigneeUserIds.filter((id) => id !== member.userId)
      : [...normalizedQuery.assigneeUserIds, member.userId];

    if (assigneeUserIds.length === 0) {
      bookings.removeParams(["assigneeUserIds"]);
    } else {
      bookings.setParams({ assigneeUserIds: assigneeUserIds.toString() });
    }
  };

  const selectedAssignees = assignees.filter((u) =>
    normalizedQuery.assigneeUserIds.includes(u.userId)
  );

  const selectStatus = (status?: string) => {
    if (status === "default" || !status) {
      bookings.removeParams(["status"]);
    } else if (Object.values(BookingStatus).includes(status as BookingStatus)) {
      bookings.setParams({ status });
    }
  };

  const isCanResetFilter = Object.keys(bookings.params).length > 0;
  const resetFilter = () => bookings.removeAllParams();

  const dates = useMemo(() => {
    if (normalizedQuery.view === CalendarView.DAY) {
      return [DateTime.normalizeDate(normalizedQuery.date)];
    }

    if (normalizedQuery.view === CalendarView.WEEK) {
      const startWeek = DateTime.getRange(normalizedQuery.date, "week").start;
      return new Array(7).fill(0).map((_, index) => DateTime.add(startWeek, "day", index));
    }

    return [];
  }, [normalizedQuery.view, normalizedQuery.date]);

  const columns = useMemo<TimeSlotsColumn[]>(() => {
    if (normalizedQuery.view === CalendarView.DAY) {
      return [
        {
          head: (
            <Text fz="xs" px="xs" py={4}>
              <DateFormat
                value={normalizedQuery.date}
                type="custom"
                format={{ month: "long", day: "numeric", year: "numeric" }}
              />
            </Text>
          ),
        },
      ];
    }

    if (normalizedQuery.view === CalendarView.WEEK) {
      return dates.map((date) => ({
        head: (
          <Text fz="xs" px="xs" py={4}>
            <DateFormat value={date} type="custom" format={{ weekday: "narrow" }} />
            {" - "}
            <DateFormat value={date} type="date" />
          </Text>
        ),
      }));
    }

    return [];
  }, [dates]);

  const availableTimeIntervals = useMemo<TimeInterval[] | undefined>(() => {
    const workingDays = workspaceSetting?.schedule?.workingDays ?? [];
    if (workingDays.length === 0) return undefined;

    const intervals: TimeInterval[] = [];

    dates.forEach((date, dateIndex) => {
      const dayOfWeek = DateTime.getDayOfWeek(date);
      const workingDayIntervals = workingDays.filter((w) => w.day === dayOfWeek);
      if (!workingDayIntervals) return;

      workingDayIntervals.forEach((interval) => {
        intervals.push({
          start: interval.start,
          end: interval.end,
          columnIndex: dateIndex,
        });
      });
    });

    return intervals;
  }, [workspaceSetting?.schedule?.workingDays, dates]);

  const defaultSelectedDate = useMemo(() => {
    const selectedDate =
      dates[0] && DateTime.isBefore(new Date(), dates[0]) ? dates[0] : new Date();

    return new Date(selectedDate);
  }, [dates]);

  const events = useMemo<TimeEvent[]>(() => {
    return bookings.data.reduce((acc, booking) => {
      const dateIndex = dates.findIndex((date) => DateTime.isSame(date, booking.startTime, "day"));

      if (dateIndex < 0) return acc;

      acc.push({
        id: booking._id,
        title: getBookingTitle(booking),
        columnIndex: dateIndex,
        start: DateTime.toTimeInputValue(booking.startTime),
        end: DateTime.toTimeInputValue(booking.endTime),
      });

      return acc;
    }, []);
  }, [bookings.data, dates]);

  return (
    <Stack p={16}>
      <Card shadow="xs" p={0}>
        <Stack>
          <Group p="sm" pb={0} justify="space-between">
            <Group flex={1}>
              <Group gap={5}>
                <ActionIcon
                  variant="outline"
                  color={color("gray")}
                  size="sm"
                  onClick={previousRange}
                >
                  <IconChevronLeft strokeWidth={1.5} size={18} />
                </ActionIcon>

                <ActionIcon variant="outline" size="sm" color={color("gray")} onClick={nextRange}>
                  <IconChevronRight strokeWidth={1.5} size={18} />
                </ActionIcon>
              </Group>

              <Text fz={14} fw={500} tt="capitalize">
                {displayDate}
              </Text>

              <Group gap={8}>
                <WorkspaceMemberSelector
                  onSelect={toggleAssigneeUser}
                  optionRightSection={(user) => {
                    const isSelected = normalizedQuery.assigneeUserIds.includes(user.userId);
                    return (
                      <ActionIcon
                        variant="subtle"
                        color={color("gray")}
                        size="sm"
                        onClick={() => toggleAssigneeUser(user)}
                      >
                        {isSelected ? <IconMinus size={16} /> : <IconPlus size={16} />}
                      </ActionIcon>
                    );
                  }}
                  target={(ctx) => {
                    return (
                      <Card
                        py={0}
                        pl={8}
                        pr={5}
                        shadow="none"
                        h={32}
                        style={{ cursor: "pointer" }}
                        withBorder
                        onClick={ctx.toggle}
                        radius={150}
                        className="unselectable"
                      >
                        <Group wrap="nowrap" align="center" h={32} gap={5}>
                          <IconUsers size={16} color={color("gray")} />

                          {!isAssigneesReady ? (
                            <Loader size={13} type="dots" color="gray" />
                          ) : selectedAssignees.length === 0 ? (
                            <Text fz={11} c="gray" fw={500}>
                              <Trans>Attendees</Trans>
                            </Text>
                          ) : (
                            <Group gap={5}>
                              {selectedAssignees.map((u, i) => {
                                return (
                                  <Center key={u.userId} ml={i > 0 ? -10 : 0}>
                                    <Tooltip label={u.name}>
                                      <Avatar user={u} size={23} withBorder />
                                    </Tooltip>
                                  </Center>
                                );
                              })}
                            </Group>
                          )}
                        </Group>
                      </Card>
                    );
                  }}
                />

                <Selector
                  dropdownProps={{ miw: 200 }}
                  pinnedOptions={[
                    {
                      id: "default",
                      label: <Trans>Active</Trans>,
                    },
                    {
                      id: BookingStatus.Completed,
                      label: t(bookingStatuses[BookingStatus.Completed].label),
                    },
                    {
                      id: BookingStatus.Rescheduled,
                      label: t(bookingStatuses[BookingStatus.Rescheduled].label),
                    },
                    {
                      id: BookingStatus.Cancelled,
                      label: t(bookingStatuses[BookingStatus.Cancelled].label),
                    },
                  ]}
                  renderOption={(option) => {
                    return (
                      <Combobox.Option value={option.id} key={option.id}>
                        <Group gap={5}>
                          <IconCircleFilled
                            size={13}
                            color={color(
                              bookingStatuses[option.id as BookingStatus]?.color ?? "primary"
                            )}
                          />
                          <Text fz="sm" c="gray" fw={500}>
                            {option.label}
                          </Text>
                        </Group>
                      </Combobox.Option>
                    );
                  }}
                  onSelect={(e) => selectStatus(e?.id)}
                  target={(ctx) => {
                    const statusColor = !normalizedQuery.status
                      ? "primary"
                      : bookingStatuses[normalizedQuery.status as BookingStatus].color ?? "primary";

                    const statusLabel = !normalizedQuery.status ? (
                      <Trans>Active</Trans>
                    ) : (
                      t(bookingStatuses[normalizedQuery.status as BookingStatus].label)
                    );

                    return (
                      <Card
                        onClick={ctx.toggle}
                        py={0}
                        px={8}
                        shadow="none"
                        h={32}
                        style={{ cursor: "pointer" }}
                        withBorder
                        radius={150}
                        className="unselectable"
                      >
                        <Group wrap="nowrap" align="center" h={32} gap={5}>
                          <IconCircleFilled size={13} color={color(statusColor)} />

                          <Text fz={11} c="gray" fw={500}>
                            {statusLabel}
                          </Text>
                        </Group>
                      </Card>
                    );
                  }}
                />

                <Renderer visible={isCanResetFilter}>
                  <Tooltip label={<Trans>Reset filter</Trans>}>
                    <ActionIcon
                      variant="subtle"
                      color={color("gray")}
                      size="sm"
                      onClick={resetFilter}
                      radius={150}
                      h={32}
                      w={32}
                    >
                      <IconRefresh strokeWidth={1.5} size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Renderer>
              </Group>
            </Group>

            <Group gap={10} justify="end">
              {!DateTime.isSame(normalizedQuery.date, new Date(), "day") && (
                <Button
                  size="compact-sm"
                  variant="light"
                  leftIcon={IconCalendarDown}
                  onClick={() => setDate(new Date())}
                >
                  {normalizedQuery.view === CalendarView.DAY ? (
                    <Trans>Today</Trans>
                  ) : (
                    <Trans>This week</Trans>
                  )}
                </Button>
              )}

              <CalendarViewSelector
                view={normalizedQuery.view}
                onChange={(view) => bookings.setParams({ view })}
              />

              <Tooltip
                label={<Trans>You can drag and drop to select a time slot in the calendar.</Trans>}
              >
                <Button
                  size="compact-sm"
                  h={30}
                  leftIcon={IconPlus}
                  onClick={() => modalCreateBookingRef.current?.open()}
                >
                  <Trans>Create booking</Trans>
                </Button>
              </Tooltip>
            </Group>
          </Group>

          <Stack gap={0}>
            <TimeSlots
              cols={columns}
              events={events}
              isAllowUnavailableTimeIntervals
              availableTimeIntervals={availableTimeIntervals}
              onSelect={(value) => {
                const date = dates[value.columnIndex];
                const startMins = getMinutesFromStringTime(value.start);
                const endMins = getMinutesFromStringTime(value.end);

                if (!date || !startMins || !endMins) return;

                const startOfDate = DateTime.getRange(date, "date").start;
                const startTime = new Date(startOfDate.getTime() + startMins * 60 * 1000);
                const endTime = new Date(startOfDate.getTime() + endMins * 60 * 1000);

                modalCreateBookingRef.current?.open({
                  startTime,
                  endTime,
                });
              }}
              onEventClick={({ id }) => {
                const event = bookings.data.find((b) => b._id === id);
                if (!event) return;
                modalBookingDetailRef.current?.open(event);
              }}
            />
          </Stack>
        </Stack>
      </Card>

      <ModalCreateBooking ref={modalCreateBookingRef} />
      <ModalBookingDetail ref={modalBookingDetailRef} />
    </Stack>
  );
};
