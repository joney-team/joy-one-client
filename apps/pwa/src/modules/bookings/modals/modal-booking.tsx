"use client";

import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { BookingEntity, BookingStatus, CreateBookingDto } from "@/modules/bookings/booking-types";
import { CustomerShortInfo } from "@/modules/customers/customer-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import {
  Blockquote,
  Card,
  Center,
  Group,
  Modal,
  Stack,
  Text,
  Textarea,
  ThemeIcon,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconArrowDown, IconCalendar, IconCalendarTime, IconCheck } from "@tabler/icons-react";

import { FormSession } from "@/components/form-session";
import { WorkSlotCreateEventDto, WorkSlotsInput } from "@/components/inputs/work-slots-input";
import { getView } from "@/layout/layout-service";
import {
  createBooking,
  getBookings,
  rescheduleBooking,
  updateBooking,
} from "@/modules/bookings/booking-service";
import { getBookingTitle } from "@/modules/bookings/booking-utils";
import { CustomerInput } from "@/modules/customers/components/customer-input";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { useLang } from "@/modules/lang/lang-context";
import { getDateFormat } from "@/modules/lang/lang-service";
import { useColor } from "@/modules/theme/use-color";
import { WorkspaceMembersInput } from "@/modules/workspace-members/components/workspace-members-input";
import { WorkspaceMemberInfo } from "@/modules/workspace-members/workspace-members-types";
import { DateTime } from "@/utils/date-time.utils";
import { onError } from "@/utils/exceptions.utils";
import { capitalize } from "@/utils/string.utils";
import { zIndexes } from "@joy-one-client/config/layout";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import dayjs from "dayjs";
import { FC, Fragment, useEffect, useState } from "react";

interface ModalBookingProps {
  onDone?: (booking: BookingEntity) => any | Promise<any>;
  customer?: CustomerShortInfo;
  booking?: BookingEntity;
  reschedule?: BookingEntity;
  creatingData?: WorkSlotCreateEventDto;
}

export const ModalBooking: FC<ModalBookingProps> = (props) => {
  const workspace = useWorkspace();
  const lang = useLang();
  const color = useColor();

  const getInitAssigneeUsers = () => {
    let assigneeUsers: WorkspaceMemberInfo[] = [];

    if (props.booking) assigneeUsers = props.booking.assigneeUsers || [];
    if (assigneeUsers.length === 0) assigneeUsers = [workspace.userMember];

    return assigneeUsers;
  };

  const [creatingData, setCreatingData] = useState<WorkSlotCreateEventDto | undefined>(
    props.creatingData
  );
  const [note, setNote] = useState<string>(props.booking?.note || props.reschedule?.note || "");
  const [assigneeUsers, setAssigneeUsers] = useState<WorkspaceMemberInfo[]>(getInitAssigneeUsers());

  const [customer, setCustomer] = useState<CustomerShortInfo | undefined>(props.customer);

  const [relatedBookings, setRelatedBookings] = useState<BookingEntity[]>([]);
  const [bookingQuery, setBookingQuery] = useState({
    start: dayjs().startOf("week").toDate(),
    end: dayjs().endOf("week").toDate(),
  });

  const fetchRelatedBookings = async () => {
    const bookings = await getBookings({
      rangeStartTime: `${DateTime.timeToSeconds(bookingQuery.start)}-${DateTime.timeToSeconds(
        bookingQuery.end
      )}`,
      assigneeUserIds: assigneeUsers.map((v) => v.userId),
    });

    setRelatedBookings(bookings.data);
  };

  useEventsListener(
    [
      EventType.BOOKING_NEW,
      EventType.BOOKING_UPDATED,
      EventType.BOOKING_CHECKIN,
      EventType.BOOKING_IN_PROGRESS,
      EventType.BOOKING_COMPLETED,
      EventType.BOOKING_CANCELLED,
    ],
    () => {
      fetchRelatedBookings();
    },
    [bookingQuery, assigneeUsers]
  );

  useEffect(() => {
    fetchRelatedBookings();
  }, [bookingQuery, assigneeUsers]);

  const onSubmit = async () => {
    if (!creatingData || !customer) throw Error(t`Customer is required`);

    try {
      if (assigneeUsers.length === 0) throw Error(t`Assignee is required`);

      const payload: CreateBookingDto = {
        customerId: customer._id,
        note,
        assigneeUserIds: assigneeUsers.map((v) => v.userId),
        startTime: DateTime.timeToSeconds(creatingData.start),
        endTime: DateTime.timeToSeconds(creatingData.end),
        status: BookingStatus.JUST_CREATED,
      };

      let booking: BookingEntity;

      if (props.reschedule) {
        booking = await rescheduleBooking({
          ...payload,
          prevBookingId: props.reschedule._id,
        });
      } else {
        booking = await createBooking(payload);
      }

      await props.onDone?.(booking);
      modals.close("ModalBooking");
    } catch (error) {
      onError(error);
    }
  };

  const onUpdate = async () => {
    if (!props.booking) return;

    try {
      const booking = await updateBooking(props.booking._id, {
        note,
      });

      await props.onDone?.(booking);
      modals.close("ModalBooking");
    } catch (error) {
      onError(error);
    }
  };

  if (props.booking)
    return (
      <Stack>
        <Textarea label={t`Content`} value={note} onChange={(e) => setNote(e.target.value)} />

        <Button leftIcon={IconCheck} onClick={onUpdate}>
          {t`Update`}
        </Button>
      </Stack>
    );

  return (
    <Stack gap={16}>
      <Group>
        <CustomerInput
          label={t`Customer`}
          value={customer}
          disabled={!!props.customer}
          onSelect={(value) => setCustomer(value)}
        />

        <WorkspaceMembersInput
          label={t`Attendees`}
          showMainResponsible
          value={assigneeUsers}
          onChange={(value) => setAssigneeUsers(value)}
          disabled={!!props.reschedule}
        />
      </Group>

      <Text fz={12} c="gray">
        <Trans>Drag and drop to select the appropriate time and enter the content if any</Trans>
      </Text>

      <WorkSlotsInput
        onDateChange={(r) => setBookingQuery({ start: r.start, end: r.end })}
        events={relatedBookings
          .filter(
            (v) =>
              ![
                BookingStatus.CANCELLED,
                BookingStatus.COMPLETED,
                BookingStatus.RESCHEDULED,
              ].includes(v.status) &&
              v._id !== props.booking?._id &&
              v._id !== props.reschedule?._id
          )
          .map((b) => {
            return {
              id: b._id,
              title: getBookingTitle(b),
              start: b.startTime,
              end: b.endTime,
            };
          })}
        onCreate={(e) => {
          try {
            if (e.conflict.events.length > 0) throw Error(t`Booking conflicted`);
            setCreatingData(e);
          } catch (error) {
            onError(error);
          }
        }}
      />

      <Modal
        opened={!!creatingData}
        onClose={() => setCreatingData(undefined)}
        title={
          <ModalTitle
            title={props.reschedule ? t`Reschedule booking` : t`Booking information`}
            icon={IconCalendar}
          />
        }
        size="lg"
      >
        {!!creatingData && (
          <Stack pt={16} gap={30}>
            <FormSession title={t`Customer`}>
              <CustomerInput value={customer} onSelect={(value) => setCustomer(value)} />
            </FormSession>

            <FormSession title={t`Attendees`}>
              <WorkspaceMembersInput
                showMainResponsible
                value={assigneeUsers}
                onChange={(value) => setAssigneeUsers(value)}
              />
            </FormSession>

            <FormSession title={t`Time`}>
              {props.reschedule && (
                <Fragment>
                  <Card withBorder shadow="none" p={10}>
                    <Group align="start" gap={10}>
                      <ThemeIcon color="gray" size="lg" mt={3}>
                        <IconCalendar size={16} />
                      </ThemeIcon>

                      <Stack gap={5}>
                        <Stack gap={0}>
                          <Text fw={600} td="line-through">
                            {dayjs(props.reschedule.startTime * 1000).format(
                              `dddd, ${getDateFormat()}`
                            )}
                          </Text>
                          <Text td="line-through">
                            {`${dayjs(props.reschedule.startTime * 1000).format("HH:mm")} - ${dayjs(
                              props.reschedule.endTime * 1000
                            ).format("HH:mm")}`}
                          </Text>
                        </Stack>

                        <Text c="gray" fw={500} fz={12} tt="capitalize">
                          {dayjs(props.reschedule.endTime * 1000).fromNow()}
                        </Text>
                      </Stack>
                    </Group>
                  </Card>

                  <Center>
                    <ThemeIcon color="gray" variant="transparent">
                      <IconArrowDown />
                    </ThemeIcon>
                  </Center>
                </Fragment>
              )}

              <Card withBorder shadow="none" p={10}>
                <Group align="start" gap={10}>
                  <ThemeIcon color={color("primary")} size="lg" mt={3}>
                    <IconCalendar size={16} />
                  </ThemeIcon>

                  <Stack gap={5}>
                    <Stack gap={0}>
                      <Text fw={600}>
                        {dayjs(creatingData!.start).format(`dddd, ${getDateFormat()}`)}
                      </Text>
                      <Text>
                        {`${dayjs(creatingData!.start).format("HH:mm")} - ${dayjs(
                          creatingData!.end
                        ).format("HH:mm")}`}
                      </Text>
                    </Stack>

                    <Text c="gray" fw={500} fz={12} tt="capitalize">
                      {dayjs(creatingData.end).fromNow()}
                    </Text>

                    {!creatingData.conflict.isInWorkspaceWorkSlots && (
                      <Blockquote color="orange" p={8} fz={14} fw={500} mt={5}>
                        {t`Out of working time slots`}
                      </Blockquote>
                    )}

                    {creatingData.start < dayjs().toDate() && (
                      <Blockquote color="orange" p={8} fz={14} fw={500} mt={5}>
                        {t`You are booking in the past`}
                      </Blockquote>
                    )}
                  </Stack>
                </Group>
              </Card>
            </FormSession>

            <FormSession title={t`Content`}>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t`Enter content`}
              />
            </FormSession>

            <Group justify="center" mt={16}>
              <Button onClick={onSubmit} leftIcon={IconCheck} action>
                {props.reschedule ? t`Reschedule booking` : t`Save`}
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
};

export const OnModalBooking = (props?: ModalBookingProps) => {
  return modals.open({
    modalId: "ModalBooking",
    title: (
      <ModalTitle
        title={
          props?.booking
            ? capitalize(`${t`Update`} ${t`Booking`}`)
            : props?.reschedule
            ? t`Reschedule booking`
            : capitalize(`${t`Create`} ${t`Booking`}`)
        }
        icon={props?.reschedule ? IconCalendarTime : IconCalendar}
      />
    ),
    children: <ModalBooking {...props} />,
    fullScreen: getView() === "mobile",
    zIndex: zIndexes.commonModals,
    size: props?.booking ? undefined : 1200,
    yOffset: 15,
  });
};
