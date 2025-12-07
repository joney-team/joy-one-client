"use client";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { CalendarViewSelector } from "@/components/calendar-view-selector";
import { DateFormat } from "@/components/format/date-format";
import { useList } from "@/components/list/use-list";
import { Renderer } from "@/components/renderer";
import { Selector } from "@/components/selector";
import { useCalendarProps } from "@/configs/calendar.config";
import { EventType } from "@/graphql/enums.graphql";
import { useLayout } from "@/layout/layout-context";
import {
  bookingActiveStatus,
  getBookings,
  getBookingStatusColor,
} from "@/modules/bookings/booking-service";
import { getBookingTitle } from "@/modules/bookings/booking-utils";
import { BookingCard } from "@/modules/bookings/components/booking-card";
import { useLang } from "@/modules/lang/lang-context";
import { useColor } from "@/modules/theme/use-color";
import { useColorScheme } from "@/modules/theme/use-color-scheme";
import {
  WorkspaceMemberSelector,
  WorkspaceMemberSelectorValue,
} from "@/modules/workspace-members/components/workspace-member-selector";
import { useWorkspaceMembers } from "@/modules/workspace-members/workspace-members-hooks";
import {
  isInWorkSlot,
  useWorkDaySlots,
} from "@/modules/workspace-settings/workspace-settings-service";
import { CalendarView } from "@/types";
import { ObjectUtils } from "@/utils/object.utils";
import { zIndexes } from "@joy-one-client/config/layout";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  ActionIcon,
  Card,
  Center,
  Combobox,
  Group,
  HoverCard,
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
import { type FC, Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Calendar } from "react-big-calendar";
import { useAuth } from "../auth/auth-context";
import { bookingStatuses } from "./booking-constants";
import { BookingEntity, BookingStatus } from "./booking-types";
import { ModalCreateBooking } from "./modals/modal-create-booking";

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
  const { t } = useLingui();
  const ref = useRef<HTMLDivElement>(null);
  const workDaySlots = useWorkDaySlots();
  const layout = useLayout();
  const lang = useLang();
  const colorScheme = useColorScheme();
  const color = useColor();
  const auth = useAuth();
  const calendarProps = useCalendarProps();

  const [columnSize, setColumnSize] = useState(0);

  const bookings = useList({
    id: "bk",
    fetch: async (q) => {
      const query = normalizeQuery(q);
      const range = `${DateTime.toSeconds(query.startTime)}-${DateTime.toSeconds(query.endTime)}`;

      return getBookings(
        ObjectUtils.cleanObj({
          rangeStartTime: range,
          assigneeUserIds: query.assigneeUserIds.length > 0 ? query.assigneeUserIds : undefined,
          status: query.status || bookingActiveStatus,
          getAll: true,
        })
      );
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

  const startWeek = DateTime.getRange(normalizedQuery.date, "week").start;
  const daysOfWeek = new Array(7).fill(0).map((_, index) => {
    const date = DateTime.add(startWeek, "day", index);

    return {
      date,
    };
  });

  const syncColumnSize = () => {
    if (ref.current) {
      const collumn = ref.current.getElementsByClassName("rbc-day-slot")[0];
      if (collumn) setColumnSize(collumn.clientWidth);
    }
  };

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

  useEffect(() => {
    syncColumnSize();
  }, [layout.width, auth.user?.settings.isTwelveHour, normalizedQuery.view]);

  return (
    <ModalCreateBooking>
      {(openCreateBooking) => (
        <Stack p={16}>
          <Card shadow="xs">
            <Stack ref={ref}>
              <Group justify="space-between">
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

                    <ActionIcon
                      variant="outline"
                      size="sm"
                      color={color("gray")}
                      onClick={nextRange}
                    >
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
                      pinnedOptions={[
                        {
                          id: "default",
                          label: t`Active`,
                        },
                        {
                          id: BookingStatus.COMPLETED,
                          label: bookingStatuses[BookingStatus.COMPLETED].label(),
                        },
                        {
                          id: BookingStatus.RESCHEDULED,
                          label: bookingStatuses[BookingStatus.RESCHEDULED].label(),
                        },
                        {
                          id: BookingStatus.CANCELLED,
                          label: bookingStatuses[BookingStatus.CANCELLED].label(),
                        },
                      ]}
                      renderOption={(option) => {
                        return (
                          <Combobox.Option value={option.id} key={option.id}>
                            <Group gap={5}>
                              <IconCircleFilled
                                size={13}
                                color={color(
                                  getBookingStatusColor(option.id as BookingStatus) || "primary"
                                )}
                              />
                              <Text fz={11} c="gray" fw={500}>
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
                          : getBookingStatusColor(normalizedQuery.status as BookingStatus);
                        const statusLabel = !normalizedQuery.status
                          ? t`Active`
                          : bookingStatuses[normalizedQuery.status as BookingStatus].label();

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
                      <Tooltip label={t`Reset filter`}>
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
                      {normalizedQuery.view === CalendarView.DAY ? t`Today` : t`This week`}
                    </Button>
                  )}

                  <CalendarViewSelector
                    view={normalizedQuery.view}
                    onChange={(view) => bookings.setParams({ view })}
                  />

                  <Tooltip label={t`You can drag and drop to select a time slot in the calendar.`}>
                    <Button
                      size="compact-sm"
                      h={30}
                      leftIcon={IconPlus}
                      onClick={() => openCreateBooking()}
                    >
                      <Trans>Create booking</Trans>
                    </Button>
                  </Tooltip>
                </Group>
              </Group>

              <Stack gap={0}>
                <Renderer visible={normalizedQuery.view === CalendarView.WEEK}>
                  <Group justify="end" gap={0} wrap="nowrap" w="100%">
                    {daysOfWeek.map((day, index) => {
                      return (
                        <Card
                          key={index}
                          shadow="none"
                          radius={0}
                          px={5}
                          py={0}
                          pb={5}
                          style={{
                            width: `${columnSize}px`,
                            boxSizing: "border-box",
                            display: "flex",
                          }}
                        >
                          <Group justify="center" align="center" wrap="nowrap" w="100%">
                            <Text fz={13} fw={700} tt="capitalize" c="gray">
                              {DateTime.format(day.date, { locale: lang.locale, weekday: "short" })}
                            </Text>

                            <Text fz={13} fw={500} tt="capitalize" c="gray">
                              {DateTime.format(day.date, {
                                locale: lang.locale,
                                month: "2-digit",
                                day: "2-digit",
                              })}
                            </Text>
                          </Group>
                        </Card>
                      );
                    })}
                  </Group>
                </Renderer>

                <Renderer visible={normalizedQuery.view === CalendarView.DAY}>
                  <Group justify="end" gap={0} wrap="nowrap" w="100%">
                    {daysOfWeek.map((day, index) => {
                      const isActive = DateTime.isSame(normalizedQuery.date, day.date, "day");

                      return (
                        <Group flex={1} key={index} justify="center" pb={10}>
                          <Button
                            key={index}
                            variant={isActive ? "filled" : "light"}
                            color={isActive ? "primary" : "gray"}
                            onClick={() => setDate(new Date(day.date))}
                            size="compact-sm"
                          >
                            <Group justify="center" align="center" wrap="nowrap" w="100%">
                              <Text fz={13} fw={700} tt="capitalize">
                                {DateTime.format(day.date, {
                                  locale: lang.locale,
                                  weekday: "short",
                                })}
                              </Text>

                              <Text fz={13} fw={500} tt="capitalize">
                                {DateTime.format(day.date, {
                                  locale: lang.locale,
                                  month: "2-digit",
                                  day: "2-digit",
                                })}
                              </Text>
                            </Group>
                          </Button>
                        </Group>
                      );
                    })}
                  </Group>
                </Renderer>

                <Calendar
                  {...calendarProps}
                  className="hide-header"
                  dayLayoutAlgorithm="no-overlap"
                  date={normalizedQuery.date}
                  view={normalizedQuery.view}
                  toolbar={false}
                  events={bookings.data.map((b) => ({
                    id: b._id,
                    title: getBookingTitle(b),
                    start: new Date(b.startTime * 1000),
                    end: new Date(b.endTime * 1000),
                    _data: b,
                  }))}
                  popup
                  slotPropGetter={(slot) => {
                    const workDaySlot = workDaySlots.find((v) => v.dayWeek === slot.getDay());
                    const isInWorkspaceWorkSlots = isInWorkSlot(slot, workDaySlot?.slots);

                    const bg = {
                      light: isInWorkspaceWorkSlots
                        ? "var(--mantine-color-body)"
                        : `var(--mantine-color-gray-light)`,
                      dark: isInWorkspaceWorkSlots
                        ? "var(--mantine-color-default-hover)"
                        : `var(--mantine-color-body)`,
                    };

                    return {
                      style: {
                        backgroundColor: bg[colorScheme],
                      },
                    };
                  }}
                  eventPropGetter={(e) => {
                    const event = bookings.data.find((v) => v._id === e.id);
                    const statusColor =
                      getBookingStatusColor(event?.status as BookingStatus) || "primary";

                    return {
                      style: {
                        backgroundColor: color(statusColor),
                        borderColor: color(statusColor + ".8"),
                      },
                    };
                  }}
                  components={{
                    event: (props) => {
                      const booking = (props.event as any)._data as BookingEntity;

                      return (
                        <HoverCard shadow="xs" zIndex={zIndexes.pannel + 1}>
                          <HoverCard.Target>
                            <Text fz={14} fw={500}>
                              {getBookingTitle(booking)}
                            </Text>
                          </HoverCard.Target>

                          <HoverCard.Dropdown>
                            <Group w="max-content">
                              <BookingCard w={380} booking={booking} p={0} withBorder={false} />
                            </Group>
                          </HoverCard.Dropdown>
                        </HoverCard>
                      );
                    },
                  }}
                  selectable
                  onSelectSlot={(slot) =>
                    openCreateBooking({
                      startTime: slot.start,
                      endTime: slot.end,
                    })
                  }
                />
              </Stack>
            </Stack>
          </Card>
        </Stack>
      )}
    </ModalCreateBooking>
  );
};
