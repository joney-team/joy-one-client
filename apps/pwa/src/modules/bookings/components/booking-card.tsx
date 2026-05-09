"use client";

import { Badge } from "@/components/badge";
import { DateFormat, RelativeTimeFormat } from "@/components/format/date-format";
import { BookingStatus } from "@/graphql/enums.graphql";
import { getBookingTitle } from "@/modules/bookings/booking-utils";
import { OnModalUpdateBooking } from "@/modules/bookings/modals/modal-update-booking";
import { useColor } from "@/modules/theme/use-color";
import { DateTime } from "@joy-one/utils/date-time";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  ActionIcon,
  Anchor,
  Blockquote,
  Card,
  CardProps,
  Divider,
  Group,
  Popover,
  Stack,
  Text,
  ThemeIcon,
  Timeline,
} from "@mantine/core";
import { useClickOutside } from "@mantine/hooks";
import {
  IconCalendarTime,
  IconClock,
  IconDots,
  IconPencil,
  IconPhone,
  IconX,
} from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";
import { CustomerInput } from "../../customers/components/customer-input";
import { WorkspaceMembersInput } from "../../workspace-members/components/workspace-members-input";
import { bookingStatuses } from "../booking-constants";
import { BookingFragment } from "../graphql/fragmentBooking.graphql";

interface BookingCardProps extends CardProps {
  booking: BookingFragment;
  hideCustomerInfo?: boolean;
  hideCtas?: boolean;
  refresh?: () => any | Promise<any>;
  onClick?: () => void;
  onCancel?: () => void;
  onReschedule?: () => void;
  memberCollapsed?: boolean;
}

export const BookingCard: FC<BookingCardProps> = (props) => {
  const {
    booking,
    hideCustomerInfo = false,
    hideCtas = false,
    memberCollapsed = true,
    refresh,
    onCancel,
    onReschedule,
    ...rest
  } = props;

  const color = useColor();
  const { t } = useLingui();

  const [_, setNow] = useState(new Date());
  const startTime = DateTime.toSeconds(booking.startTime)!;
  const endTime = DateTime.toSeconds(booking.endTime)!;

  const [opened, setOpened] = useState(false);
  const ref = useClickOutside(() => setOpened(false));
  const close = () => setOpened(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const bookingStatus = bookingStatuses[booking.status];

  return (
    <Card
      p={10}
      key={booking._id}
      style={rest.onClick ? { cursor: "pointer" } : {}}
      withBorder
      shadow="none"
      maw="100%"
      {...rest}
    >
      <Group wrap="nowrap" align="start">
        <Stack gap={5} align="center">
          <Card bg={color(bookingStatus.color)} w={85} p={5}>
            <Stack gap={0}>
              <Text fz={10} c="white" ta="center" fw={500} tt="uppercase">
                <DateFormat value={startTime} type="custom" format={{ weekday: "long" }} />
              </Text>
              <Text fz={30} my={-5} c="white" ta="center" fw={500}>
                <DateFormat value={startTime} type="custom" format={{ day: "2-digit" }} />
              </Text>
              <Text fz={10} c="white" ta="center" fw={500} tt="capitalize">
                <DateFormat
                  value={startTime}
                  type="custom"
                  format={{ month: "numeric", year: "numeric" }}
                />
              </Text>
            </Stack>
          </Card>

          <Text ta="center" tt="capitalize" fz={8} fw={500}>
            <RelativeTimeFormat value={startTime} />
          </Text>

          <Badge color={bookingStatus.color} size="xs" fz={8} variant="light">
            {t(bookingStatuses[booking.status].label)}
          </Badge>
        </Stack>

        <Stack flex={1} gap={8}>
          <Group align="start">
            <Stack gap={8} flex={1}>
              <Text fz={15} fw={500}>
                {getBookingTitle(booking)}
              </Text>
              {booking.note && (
                <Text fz={12} c="gray" flex={1}>
                  {booking.note}
                </Text>
              )}
            </Stack>

            <Group gap={10}>
              {!props.hideCtas && (
                <Popover withArrow shadow="xs" zIndex={1} opened={opened}>
                  <Popover.Target>
                    <ActionIcon
                      radius={100}
                      color="gray"
                      variant="subtle"
                      size="md"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpened(!opened);
                      }}
                    >
                      <IconDots strokeWidth={1.2} size={18} />
                    </ActionIcon>
                  </Popover.Target>

                  <Popover.Dropdown
                    ref={ref}
                    onClick={(e) => e.stopPropagation()}
                    style={{ zIndex: 500 }}
                  >
                    <Stack>
                      <Divider label={<Trans>Actions</Trans>} labelPosition="left" />
                      {booking.customer && (
                        <Anchor
                          href={`tel:${booking.customer.phone}`}
                          c="dark"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Group gap={10} style={{ cursor: "pointer", userSelect: "none" }}>
                            <ThemeIcon size="sm" radius={100} color="primary">
                              <IconPhone color="white" size={12} />
                            </ThemeIcon>

                            <Text fz={12} fw={500}>
                              <Trans>Call customer</Trans>
                            </Text>
                          </Group>
                        </Anchor>
                      )}

                      {/* <Divider label={<Trans>Status</Trans>} labelPosition="left" />
                          <Group
                            gap={10}
                            style={{ cursor: "pointer", userSelect: "none" }}
                            onClick={() => {
                              close();
                              checkinBooking(booking._id);
                            }}
                          >
                            <ThemeIcon size="sm" radius={100} color="primary">
                              <IconUserCheck size={16} />
                            </ThemeIcon>

                            <Text fz={12} fw={500}>
                              {t(bookingStatuses[BookingStatus.CheckIn].label)}
                            </Text>
                          </Group>

                          <Group
                            gap={10}
                            style={{ cursor: "pointer", userSelect: "none" }}
                            onClick={() => {
                              close();
                              inProgressBooking(booking._id);
                            }}
                          >
                            <ThemeIcon size="sm" radius={100} color="orange">
                              <IconAnalyze color="white" size={16} />
                            </ThemeIcon>

                            <Text fz={12} fw={500}>
                              {t(bookingStatuses[BookingStatus.InProgress].label)}
                            </Text>
                          </Group>

                          <Group
                            gap={10}
                            style={{ cursor: "pointer", userSelect: "none" }}
                            onClick={() => {
                              close();
                            }}
                          >
                            <ThemeIcon size="sm" radius={100} color="green">
                              <IconCheck size={16} />
                            </ThemeIcon>

                            <Text fz={12} fw={500}>
                              {t(bookingStatuses[BookingStatus.Completed].label)}
                            </Text>
                          </Group> */}

                      {onCancel && (
                        <Group
                          gap={10}
                          style={{ cursor: "pointer", userSelect: "none" }}
                          onClick={() => {
                            close();
                            onCancel();
                          }}
                        >
                          <ThemeIcon size="sm" radius={100} color="red" variant="outline">
                            <IconX size={16} />
                          </ThemeIcon>

                          <Text fz={12} fw={500}>
                            <Trans>Cancel booking</Trans>
                          </Text>
                        </Group>
                      )}

                      <Divider label={<Trans>Update</Trans>} labelPosition="left" />

                      <Group
                        gap={10}
                        style={{ cursor: "pointer", userSelect: "none" }}
                        onClick={() => {
                          close();
                          OnModalUpdateBooking(booking);
                        }}
                      >
                        <ThemeIcon size="sm" radius={100} color="dark" variant="transparent">
                          <IconPencil strokeWidth={1.5} size={20} />
                        </ThemeIcon>

                        <Text fz={12} fw={500}>
                          <Trans>Update information</Trans>
                        </Text>
                      </Group>

                      {onReschedule && (
                        <Group
                          gap={10}
                          style={{ cursor: "pointer", userSelect: "none" }}
                          onClick={() => {
                            close();
                            onReschedule?.();
                          }}
                        >
                          <ThemeIcon size="sm" radius={100} color="dark" variant="transparent">
                            <IconCalendarTime strokeWidth={1.5} size={20} />
                          </ThemeIcon>

                          <Text fz={12} fw={500}>
                            <Trans>Reschedule booking</Trans>
                          </Text>
                        </Group>
                      )}
                    </Stack>
                  </Popover.Dropdown>
                </Popover>
              )}
            </Group>
          </Group>

          <Group flex={1} gap={30} align="start">
            <Timeline active={3} bulletSize={10} lineWidth={1} mt={5} mb={-12} color="grey">
              <Timeline.Item title={<DateFormat value={startTime} type="time" />} fz={13} />
              <Timeline.Item title={<DateFormat value={endTime} type="time" />} fz={13} />
            </Timeline>

            <Stack gap={0} align="start">
              <Text fz={10} c="gray">
                <Trans>Duration</Trans>
              </Text>

              <Group gap={0} mt={-3}>
                <ThemeIcon color="dark" variant="transparent" ml={-8} mr={-3}>
                  <IconClock size={16} strokeWidth={1.5} />
                </ThemeIcon>
                <Text fz={13} fw={500}>
                  {DateTime.toHHMM(booking.endTime - booking.startTime)}
                </Text>
              </Group>
            </Stack>
          </Group>

          <Group align="start" mt={12}>
            {booking.customer && !hideCustomerInfo && (
              <Group flex={1}>
                <CustomerInput label={<Trans>Customer</Trans>} value={booking.customer} disabled />
              </Group>
            )}

            {booking.assigneeUsers && booking.assigneeUsers.length > 0 && (
              <Group flex={1}>
                <WorkspaceMembersInput
                  label={<Trans>Attendees</Trans>}
                  value={booking.assigneeUsers}
                  collapsed={memberCollapsed}
                  disabled
                />
              </Group>
            )}
          </Group>

          {booking.status === BookingStatus.Cancelled && booking.reasonForCancellation && (
            <Blockquote cite={<Trans>Cancel reason</Trans>} color="red" p={8} fz={13}>
              {booking.reasonForCancellation}
            </Blockquote>
          )}
        </Stack>
      </Group>
    </Card>
  );
};
