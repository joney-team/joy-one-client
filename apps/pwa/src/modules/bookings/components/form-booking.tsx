"use client";

import { Button } from "@/components/buttons/button";
import { FormSessionIcon } from "@/components/form-session";
import { TimeInput } from "@/components/inputs/time-input";
import { WorkspaceMembersInput } from "@/modules/workspace-members/components/workspace-members-input";
import {
  createBooking,
  rescheduleBooking,
  updateBooking,
} from "@/modules/bookings/booking-service";
import { getBookingTitle } from "@/modules/bookings/booking-utils";
import { CustomerInput } from "@/modules/customers/components/customer-input";
import { CustomerShortInfo } from "@/modules/customers/customer-types";
import { getDateFormat, tl } from "@/modules/lang/lang-service";
import { useColor } from "@/modules/theme/use-color";
import { WorkspaceMemberInfo } from "@/modules/workspace-members/workspace-members-types";
import {
  isInWorkSlot,
  useWorkDaySlots,
} from "@/modules/workspace-settings/workspace-settings-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { DateTime } from "@/utils/date-time.utils";
import { onFormError } from "@/utils/exceptions.utils";
import { capitalize } from "@/utils/string.utils";
import {
  Blockquote,
  Card,
  Center,
  Group,
  Indicator,
  Stack,
  Text,
  Textarea,
  ThemeIcon,
  Tooltip,
  TextInput,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import {
  IconArrowDown,
  IconCalendar,
  IconCheck,
  IconNotebook,
  IconReservedLine,
  IconUsers,
  IconUserSquareRounded,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { FC, Fragment, useEffect, useMemo } from "react";
import { BookingEntity, BookingStatus, CreateBookingDto } from "../booking-types";

export interface BookingFormProps {
  startTime?: Date;
  endTime?: Date;
  customer?: CustomerShortInfo;
  assigneeUsers?: WorkspaceMemberInfo[];
  reschedule?: BookingEntity;
  booking?: BookingEntity;

  onFinished?: () => void;
  onCancel?: () => void;
}

export const BookingForm: FC<BookingFormProps> = (props) => {
  const { reschedule } = props;
  const color = useColor();
  const workDaySlots = useWorkDaySlots();
  const workspace = useWorkspace();
  const type = props.booking ? "UPDATE" : props.reschedule ? "RESCHEDULE" : "CREATE";

  const initialValues = useMemo(() => {
    return {
      title: props.booking?.title ?? "",
      note: props.booking?.note ?? "",
      customer: props.booking?.customer ?? props.reschedule?.customer ?? props.customer,
      assigneeUsers: props.booking?.assigneeUsers ??
        props.reschedule?.assigneeUsers ??
        props.assigneeUsers ?? [workspace.userMember],
      startTime: props.booking?.startTime
        ? dayjs(props.booking.startTime * 1000).toDate()
        : props.startTime,
      endTime: props.booking?.endTime
        ? dayjs(props.booking.endTime * 1000).toDate()
        : props.endTime,
    };
  }, [props.customer, props.assigneeUsers, props.startTime, props.endTime, props.booking, type]);

  const form = useForm({ initialValues });

  const onSubmit = form.onSubmit(async (values) => {
    try {
      const payload: CreateBookingDto = {
        title: values.title,
        note: values.note,
        customerId: values.customer?._id,
        assigneeUserIds: values.assigneeUsers?.map((v) => v.userId) ?? [],
        startTime: DateTime.timeToSeconds(values.startTime),
        endTime: DateTime.timeToSeconds(values.endTime),
        status: BookingStatus.JUST_CREATED,
      };

      if (type === "RESCHEDULE") {
        await rescheduleBooking({
          ...payload,
          prevBookingId: props.reschedule!._id,
        });
      }

      if (type === "CREATE") {
        await createBooking(payload);
      }

      if (type === "UPDATE") {
        await updateBooking(props.booking!._id, payload);
      }

      props.onFinished?.();
    } catch (error) {
      onFormError(form, error);
    }
  });

  const isInWorkspaceWorkSlots = form.values.startTime
    ? isInWorkSlot(
        form.values.startTime,
        workDaySlots.find((v) => v.dayWeek === form.values.startTime!.getDay())?.slots
      )
    : false;

  const isPassed =
    form.values.startTime && dayjs(form.values.startTime).isBefore(dayjs().subtract(1, "day"));

  useEffect(() => {
    form.setInitialValues(initialValues);
    form.reset();
  }, [props]);

  return (
    <Stack pt={16} gap={30}>
      <FormSessionIcon icon={IconReservedLine} description="title">
        {type === "RESCHEDULE" ? (
          <Title order={5} fw={500}>
            {getBookingTitle(form.values) || tl("title")}
          </Title>
        ) : (
          <TextInput
            {...form.getInputProps("title")}
            placeholder={getBookingTitle(form.values) || tl("title")}
          />
        )}
      </FormSessionIcon>

      <FormSessionIcon
        icon={IconUserSquareRounded}
        description="customer"
        visible={!(type === "RESCHEDULE" && !form.values.customer)}
      >
        <CustomerInput
          {...form.getInputProps("customer")}
          clearable
          flex={1}
          disabled={type === "RESCHEDULE"}
        />
      </FormSessionIcon>

      <FormSessionIcon
        icon={IconUsers}
        description="attendees"
        visible={!(type === "RESCHEDULE" && form.values.assigneeUsers?.length === 0)}
      >
        <WorkspaceMembersInput
          {...form.getInputProps("assigneeUsers")}
          flex={1}
          disabled={type === "RESCHEDULE"}
        />
      </FormSessionIcon>

      <FormSessionIcon
        icon={IconCalendar}
        description="dateTime"
        visible={type === "CREATE" || type === "RESCHEDULE"}
      >
        {reschedule && (
          <Fragment>
            <Card withBorder shadow="none" p={10}>
              <Group align="start" gap={10}>
                <ThemeIcon color="gray" size="lg" mt={3}>
                  <IconCalendar size={16} />
                </ThemeIcon>

                <Stack gap={5}>
                  <Stack gap={0}>
                    <Text tt="capitalize" fw={600} td="line-through" fz={14}>
                      {dayjs(reschedule.startTime * 1000).format(`dddd, ${getDateFormat()}`)}
                    </Text>
                    <Group gap={8}>
                      <Text td="line-through" fz={12}>
                        {`${dayjs(reschedule.startTime * 1000).format("HH:mm")} - ${dayjs(
                          reschedule.endTime * 1000
                        ).format("HH:mm")}`}
                      </Text>

                      <Text c="gray" fz={10} tt="capitalize">
                        {dayjs(reschedule.endTime * 1000).fromNow()}
                      </Text>
                    </Group>
                  </Stack>
                </Stack>
              </Group>
            </Card>

            <Center>
              <ThemeIcon color="gray" variant="transparent">
                <IconArrowDown strokeWidth={1.3} />
              </ThemeIcon>
            </Center>
          </Fragment>
        )}

        <Stack>
          <Group flex={1}>
            <Tooltip label={tl("select_date")}>
              <Group flex={1}>
                <DateInput
                  flex={1}
                  defaultValue={form.values.startTime}
                  placeholder={getDateFormat()}
                  valueFormat={getDateFormat()}
                  onChange={(value) => {
                    const currentStartTime = dayjs(form.values.startTime);
                    const currentEndTime = dayjs(form.values.endTime);

                    const startTime = dayjs(value)
                      .set("hour", currentStartTime.hour())
                      .set("minute", currentStartTime.minute());
                    let endTime = dayjs(value)
                      .set("hour", currentEndTime.hour())
                      .set("minute", currentEndTime.minute());

                    if (!form.values.endTime) endTime = endTime.add(15, "minutes");

                    form.setValues({
                      ...form.values,
                      startTime: startTime.toDate(),
                      endTime: endTime.toDate(),
                    });
                  }}
                  renderDay={(date) => {
                    const day = dayjs(date).date();
                    const isToday = dayjs(date).isSame(dayjs(), "day");
                    return (
                      <Indicator disabled={!isToday} size={6} color={color("primary")} offset={-2}>
                        <div>{day}</div>
                      </Indicator>
                    );
                  }}
                />
              </Group>
            </Tooltip>

            <Tooltip label={tl("startTime")}>
              <Group>
                <TimeInput
                  value={form.values.startTime}
                  onChange={(value) => {
                    form.setValues({
                      ...form.values,
                      startTime: dayjs(form.values.startTime)
                        .set("hour", value[0])
                        .set("minute", value[1])
                        .toDate(),
                    });
                  }}
                />
              </Group>
            </Tooltip>

            <Tooltip label={tl("endTime")}>
              <Group>
                <TimeInput
                  value={form.values.endTime}
                  onChange={(value) => {
                    form.setValues({
                      ...form.values,
                      endTime: dayjs(form.values.endTime)
                        .set("hour", value[0])
                        .set("minute", value[1])
                        .toDate(),
                    });
                  }}
                />
              </Group>
            </Tooltip>
          </Group>

          <Group wrap="nowrap" gap={5}>
            <Text fz={12} flex={1}>
              {tl("suggest_time")}
            </Text>

            {[15, 30, 45, 60].map((v) => {
              const isSelected =
                form.values.endTime &&
                dayjs(form.values.endTime).diff(form.values.startTime, "minute") === v;
              return (
                <Button
                  key={v}
                  variant="outline"
                  size="compact-sm"
                  color={isSelected ? undefined : "gray"}
                  radius="xl"
                  fw={400}
                  fz={12}
                  style={{
                    borderColor: isSelected ? undefined : "var(--mantine-color-default-border)",
                  }}
                  onClick={() => {
                    form.setFieldValue(
                      "endTime",
                      dayjs(form.values.startTime).add(v, "minute").toDate()
                    );
                  }}
                >
                  {v === 60 ? tl("one_hour") : tl("minutes", { count: v })}
                </Button>
              );
            })}
          </Group>
        </Stack>
      </FormSessionIcon>

      <FormSessionIcon icon={IconNotebook} description="details" visible={type !== "RESCHEDULE"}>
        <Textarea
          {...form.getInputProps("note")}
          placeholder={capitalize(`${tl("enter")} ${tl("details")} (${tl("optional")})`)}
          minRows={4}
          autosize
          readOnly={type === "RESCHEDULE"}
        />
      </FormSessionIcon>

      {(type === "CREATE" || type === "RESCHEDULE") && (
        <Stack gap={8}>
          {form.values.startTime && !isInWorkspaceWorkSlots && (
            <Blockquote color="orange" p={8} fz={14} fw={500} mt={5}>
              {tl("out_of_work_slots")}
            </Blockquote>
          )}

          {form.values.startTime && isPassed && (
            <Blockquote color="orange" p={8} fz={14} fw={500} mt={5}>
              {tl("booking_time_passed")}
            </Blockquote>
          )}

          {form.values.startTime &&
            form.values.endTime &&
            dayjs(form.values.endTime).isBefore(dayjs(form.values.startTime)) && (
              <Blockquote color="red" p={8} fz={14} fw={500} mt={5}>
                {tl("end_time_before_start_time")}
              </Blockquote>
            )}
        </Stack>
      )}

      <Group justify="center">
        {props.onCancel && !form.submitting && (
          <Button variant="outline" color="gray" onClick={props.onCancel}>
            {tl("cancel")}
          </Button>
        )}

        <Button onClick={onSubmit} leftIcon={IconCheck} action loading={form.submitting}>
          {tl(
            type === "CREATE" ? "confirm" : type === "RESCHEDULE" ? "reschedule_booking" : "save"
          )}
        </Button>
      </Group>
    </Stack>
  );
};
