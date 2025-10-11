"use client";

import { Avatar } from "@/components/avatar";
import { BookingCard } from "@/modules/bookings/components/booking-card";
import { Button } from "@/components/buttons/button";
import { CalendarViewSelector } from "@/components/calendar-view-selector";
import { Renderer } from "@/components/renderer";
import { Selector } from "@/components/selector";
import { WorkspaceMemberSelector } from "@/modules/workspace-members/components/workspace-member-selector";
import { calendarProps } from "@/configs/calendar.config";
import { useLayout } from "@/layout/layout-context";
import { OnModalCreateBooking } from "./modals/modal-create-booking";
import { CalendarView } from "@/types";
import {
  bookingActiveStatus,
  getBookings,
  getBookingStatusColor,
} from "@/modules/bookings/booking-service";
import { BookingEntity, BookingStatus } from "./booking-types";
import { getBookingTitle } from "@/modules/bookings/booking-utils";
import { EventType } from "@/modules/events/event-types";
import { useLang } from "@/modules/lang/lang-context";
import { getDateFormat, t } from "@/modules/lang/lang-service";
import { useWorkspaceMembers } from "@/modules/workspace-members/workspace-members-hooks";
import { WorkspaceMember } from "@/modules/workspace-members/workspace-members-types";
import {
  isInWorkSlot,
  useWorkDaySlots,
} from "@/modules/workspace-settings/workspace-settings-service";
import { DateTimeUtils } from "@/utils/dateTime.utils";
import { ObjectUtils } from "@/utils/object.utils";
import { useList } from "@/components/list/use-list";
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
import dayjs from "dayjs";
import { type FC, useEffect, useRef, useState } from "react";
import { Calendar } from "react-big-calendar";
import { useColorScheme } from "@/modules/theme/use-color-scheme";
import { useColor } from "@/modules/theme/use-color";
import { zIndexes } from "@joy-one-client/config/layout";

const normalizeQuery = (query: any) => {
  const date = query.date ? dayjs(+query.date * 1000).toDate() : new Date();
  const view = Object.values(CalendarView).includes(query.view) ? query.view : CalendarView.WEEK;
  const startTime = dayjs(date).startOf(view).toDate();
  const endTime = dayjs(date).endOf(view).toDate();
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
  const ref = useRef<HTMLDivElement>(null);
  const workDaySlots = useWorkDaySlots();
  const layout = useLayout();
  const lang = useLang();
  const colorScheme = useColorScheme();
  const color = useColor();

  const [columnSize, setColumnSize] = useState(0);

  const bookings = useList({
    id: "bk",
    fetch: async (q) => {
      const query = normalizeQuery(q);

      return getBookings(
        ObjectUtils.cleanObj({
          rangeStartTime: `${DateTimeUtils.timeToSeconds(
            query.startTime
          )}-${DateTimeUtils.timeToSeconds(query.endTime)}`,
          assigneeUserIds: query.assigneeUserIds.length > 0 ? query.assigneeUserIds : undefined,
          status: query.status || bookingActiveStatus,
          getAll: true,
        })
      );
    },
    isIgnoreEventActionType: true,
    events: [
      EventType.BOOKING_NEW,
      EventType.BOOKING_UPDATED,
      EventType.BOOKING_CHECKIN,
      EventType.BOOKING_IN_PROGRESS,
      EventType.BOOKING_COMPLETED,
      EventType.BOOKING_CANCELLED,
    ],
  });

  const [assignees, isAssigneesReady, setWorkspaceMember] = useWorkspaceMembers(
    bookings.params.assigneeUserIds
  );

  const query = normalizeQuery(bookings.params);

  const startWeek = dayjs(query.date).startOf("week");
  const dayWeek = new Array(7).fill(0).map((_, index) => {
    const date = startWeek.add(index, "day");

    return {
      date,
      nameDay: date.format("ddd"),
      name: date.format("ddd DD/MM"),
    };
  });

  const syncColumnSize = () => {
    if (ref.current) {
      const collumn = ref.current.getElementsByClassName("rbc-day-slot")[0];
      if (collumn) setColumnSize(collumn.clientWidth);
    }
  };

  const setDate = (date: Date) => {
    const isToday = dayjs(date).isSame(new Date(), "day");
    if (isToday) {
      bookings.removeParams(["date"]);
    } else {
      bookings.setParams({ date: DateTimeUtils.timeToSeconds(date) });
    }
  };

  const nextRange = () => {
    const nextDate = dayjs(query.date).add(1, query.view).toDate();
    if (dayjs(nextDate).isSame(new Date(), "day")) {
      bookings.removeParams(["date"]);
    } else {
      bookings.setParams({ date: DateTimeUtils.timeToSeconds(nextDate) });
    }
  };

  const previousRange = () => {
    const previousDate = dayjs(query.date).subtract(1, query.view).toDate();
    if (dayjs(previousDate).isSame(new Date(), "day")) {
      bookings.removeParams(["date"]);
    } else {
      bookings.setParams({ date: DateTimeUtils.timeToSeconds(previousDate) });
    }
  };

  const renderDate = () => {
    if ([CalendarView.WEEK, CalendarView.MONTH].includes(query.view)) {
      const start = dayjs(query.date).startOf(query.view);
      const end = dayjs(query.date).endOf(query.view);
      return `${start.format(`ddd ${getDateFormat()}`)} - ${end.format(`ddd ${getDateFormat()}`)}`;
    }

    return dayjs(query.date).format(`dddd ${getDateFormat()}`);
  };

  const toggleAssigneeUser = (member?: WorkspaceMember) => {
    if (!member) return;

    setWorkspaceMember(member);
    const isSelected = query.assigneeUserIds.includes(member.userId);
    const assigneeUserIds = isSelected
      ? query.assigneeUserIds.filter((id) => id !== member.userId)
      : [...query.assigneeUserIds, member.userId];

    if (assigneeUserIds.length === 0) {
      bookings.removeParams(["assigneeUserIds"]);
    } else {
      bookings.setParams({ assigneeUserIds: assigneeUserIds.toString() });
    }
  };

  const selectedAssignees = assignees.filter((u) => query.assigneeUserIds.includes(u.userId));

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
  }, [layout.width, lang.state.isTwelveHour, query.view]);

  return (
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

                <ActionIcon variant="outline" size="sm" color={color("gray")} onClick={nextRange}>
                  <IconChevronRight strokeWidth={1.5} size={18} />
                </ActionIcon>
              </Group>

              <Text fz={14} fw={500} tt="capitalize">
                {renderDate()}
              </Text>

              <Group gap={8}>
                <WorkspaceMemberSelector
                  onSelect={toggleAssigneeUser}
                  optionRightSection={(user) => {
                    const isSelected = query.assigneeUserIds.includes(user.userId);
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
                              {t("attendees")}
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
                      label: t("active"),
                    },
                    {
                      id: BookingStatus.COMPLETED,
                      label: t(`booking_status_${BookingStatus.COMPLETED}`),
                    },
                    {
                      id: BookingStatus.RESCHEDULED,
                      label: t(`booking_status_${BookingStatus.RESCHEDULED}`),
                    },
                    {
                      id: BookingStatus.CANCELLED,
                      label: t(`booking_status_${BookingStatus.CANCELLED}`),
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
                    const statusColor = !query.status
                      ? "primary"
                      : getBookingStatusColor(query.status as BookingStatus);
                    const statusLabel = !query.status
                      ? t("active")
                      : t(`booking_status_${query.status}`);

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
                  <Tooltip label={t("reset_filter")}>
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
              {!dayjs(query.date).isSame(new Date(), query.view) && (
                <Button
                  size="compact-sm"
                  fz={12}
                  leftIcon={IconCalendarDown}
                  iconSize={16}
                  iconSpacing={-10}
                  variant="light"
                  onClick={() => setDate(new Date())}
                >
                  {t(query.view === CalendarView.DAY ? "today" : "this_week")}
                </Button>
              )}

              <CalendarViewSelector
                view={query.view}
                onChange={(view) => bookings.setParams({ view })}
              />

              <Tooltip label={t("select_booking_slots_to_create_booking_desc")}>
                <Button
                  size="compact-sm"
                  h={30}
                  leftIcon={IconPlus}
                  onClick={() => OnModalCreateBooking()}
                >
                  {t("create_booking")}
                </Button>
              </Tooltip>
            </Group>
          </Group>

          <Stack gap={0}>
            <Renderer visible={query.view === CalendarView.WEEK}>
              <Group justify="end" gap={0} wrap="nowrap" w="100%">
                {dayWeek.map((day, index) => {
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
                          {day.date.format("ddd")}
                        </Text>

                        <Text fz={13} fw={500} tt="capitalize" c="gray">
                          {day.date.format(getDateFormat().replace("/YYYY", ""))}
                        </Text>
                      </Group>
                    </Card>
                  );
                })}
              </Group>
            </Renderer>

            <Renderer visible={query.view === CalendarView.DAY}>
              <Group justify="end" gap={0} wrap="nowrap" w="100%">
                {dayWeek.map((day, index) => {
                  const isActive = dayjs(query.date).isSame(day.date, "day");

                  return (
                    <Group flex={1} key={index} justify="center" pb={10}>
                      <Button
                        key={index}
                        variant={isActive ? "filled" : "light"}
                        color={isActive ? "primary" : "gray"}
                        onClick={() => setDate(day.date.toDate())}
                        size="compact-sm"
                      >
                        <Group justify="center" align="center" wrap="nowrap" w="100%">
                          <Text fz={13} fw={700} tt="capitalize">
                            {day.date.format("ddd")}
                          </Text>

                          <Text fz={13} fw={500} tt="capitalize">
                            {day.date.format(getDateFormat().replace("/YYYY", ""))}
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
              date={query.date}
              view={query.view}
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

                const isAvailable = isInWorkspaceWorkSlots;

                const bg = {
                  light: isAvailable
                    ? "var(--mantine-color-body)"
                    : `var(--mantine-color-gray-light)`,
                  dark: isAvailable
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
                OnModalCreateBooking({
                  startTime: slot.start,
                  endTime: slot.end,
                })
              }
            />
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
};
