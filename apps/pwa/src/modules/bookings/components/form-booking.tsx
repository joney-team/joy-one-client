"use client";

import { Button } from "@/components/buttons/button";
import { FormSessionIcon } from "@/components/form-session";
import { DateFormat, RelativeTimeFormat } from "@/components/format/date-format";
import { TimeInput } from "@/components/inputs/time-input";
import {
  createBooking,
  rescheduleBooking,
  updateBooking,
} from "@/modules/bookings/booking-service";
import { getBookingTitle } from "@/modules/bookings/booking-utils";
import { CustomerInput } from "@/modules/customers/components/customer-input";
import { CustomerShortInfo } from "@/modules/customers/customer-types";
import { useLang } from "@/modules/lang/lang-context";
import { useColor } from "@/modules/theme/use-color";
import { WorkspaceMembersInput } from "@/modules/workspace-members/components/workspace-members-input";
import { WorkspaceMemberInfo } from "@/modules/workspace-members/workspace-members-types";
import {
  isInWorkSlot,
  useWorkDaySlots,
} from "@/modules/workspace-settings/workspace-settings-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onFormError } from "@/utils/exceptions.utils";
import { DateTime } from "@joy-one-client/utils/date-time";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  Blockquote,
  Card,
  Center,
  Group,
  Indicator,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
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
  const lang = useLang();
  const dateFormat = DateTime.getDateFormatString(lang.locale);
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
        ? DateTime.normalizeDate(props.booking.startTime)
        : props.startTime,
      endTime: props.booking?.endTime
        ? DateTime.normalizeDate(props.booking.endTime)
        : props.endTime,
    };
  }, [props.customer, props.assigneeUsers, props.startTime, props.endTime, props.booking, type]);

  const form = useForm({ initialValues });

  const onSubmit = form.onSubmit(async (values) => {
    try {
      if (!values.startTime || !values.endTime) {
        throw Error(t`Start time and end time are required`);
      }

      const payload: CreateBookingDto = {
        title: values.title,
        note: values.note,
        customerId: values.customer?._id,
        assigneeUserIds: values.assigneeUsers?.map((v) => v.userId) ?? [],
        startTime: DateTime.toSeconds(values.startTime),
        endTime: DateTime.toSeconds(values.endTime),
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
    form.values.startTime &&
    DateTime.isBefore(form.values.startTime, DateTime.subtract(new Date(), "day", 1));

  useEffect(() => {
    form.setInitialValues(initialValues);
    form.reset();
  }, [props]);

  return (
    <Stack pt={16} gap={30}>
      <FormSessionIcon icon={IconReservedLine} description={t`Title`}>
        {type === "RESCHEDULE" ? (
          <Title order={5} fw={500}>
            {getBookingTitle(form.values) || t`Title`}
          </Title>
        ) : (
          <TextInput
            {...form.getInputProps("title")}
            placeholder={getBookingTitle(form.values) || t`Title`}
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
                      <DateFormat value={reschedule.startTime} type="date" />
                    </Text>
                    <Group gap={8}>
                      <Text td="line-through" fz={12}>
                        <DateFormat value={reschedule.startTime} type="time" />
                        {" - "}
                        <DateFormat value={reschedule.endTime} type="time" />
                      </Text>

                      <Text c="gray" fz={10} tt="capitalize">
                        <RelativeTimeFormat value={reschedule.endTime} />
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
            <Tooltip label={<Trans>Select date</Trans>}>
              <Group flex={1}>
                <DateInput
                  flex={1}
                  defaultValue={form.values.startTime}
                  placeholder={dateFormat}
                  valueFormat={dateFormat}
                  onChange={(value) => {
                    if (!value) return;

                    const currentStartTime = form.values.startTime
                      ? DateTime.normalizeDate(form.values.startTime)
                      : null;

                    const currentEndTime = form.values.endTime
                      ? DateTime.normalizeDate(form.values.endTime)
                      : null;

                    const startTime = new Date(
                      DateTime.normalizeDate(value).setHours(
                        currentStartTime?.getHours() ?? 0,
                        currentStartTime?.getMinutes() ?? 0,
                        0,
                        0
                      )
                    );

                    const endTime = new Date(
                      DateTime.normalizeDate(value).setHours(
                        currentEndTime?.getHours() ?? 0,
                        currentEndTime?.getMinutes() ?? 0,
                        0,
                        0
                      )
                    );

                    form.setValues({
                      ...form.values,
                      startTime: startTime,
                      endTime: endTime,
                    });
                  }}
                  renderDay={(date) => {
                    const isToday = DateTime.isSame(date, new Date(), "day");
                    return (
                      <Indicator disabled={!isToday} size={6} color={color("primary")} offset={-2}>
                        <div>{DateTime.normalizeDate(date).getDate()}</div>
                      </Indicator>
                    );
                  }}
                />
              </Group>
            </Tooltip>

            <Tooltip label={<Trans>Start time</Trans>}>
              <Group>
                <TimeInput
                  value={form.values.startTime}
                  onChange={(value) => {
                    form.setValues({
                      ...form.values,
                      startTime: new Date(
                        DateTime.normalizeDate(form.values.startTime ?? new Date()).setHours(
                          value[0],
                          value[1]
                        )
                      ),
                    });
                  }}
                />
              </Group>
            </Tooltip>

            <Tooltip label={<Trans>End time</Trans>}>
              <Group>
                <TimeInput
                  value={form.values.endTime}
                  onChange={(value) => {
                    form.setValues({
                      ...form.values,
                      endTime: new Date(
                        DateTime.normalizeDate(form.values.endTime ?? new Date()).setHours(
                          value[0],
                          value[1]
                        )
                      ),
                    });
                  }}
                />
              </Group>
            </Tooltip>
          </Group>

          <Group wrap="nowrap" gap={5}>
            <Text fz={12} flex={1}>
              <Trans>Suggest time</Trans>
            </Text>

            {[15, 30, 45, 60].map((v) => {
              const isSelected =
                form.values.endTime &&
                form.values.startTime &&
                DateTime.diff(form.values.endTime, form.values.startTime, "minute") === v;
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
                    form.setValues({
                      ...form.values,
                      endTime: DateTime.add(form.values.startTime ?? new Date(), "minute", v),
                    });
                  }}
                >
                  {v === 60 ? (
                    <Trans>One hour</Trans>
                  ) : (
                    <Fragment>
                      {v} <Trans> mins</Trans>
                    </Fragment>
                  )}
                </Button>
              );
            })}
          </Group>
        </Stack>
      </FormSessionIcon>

      <FormSessionIcon icon={IconNotebook} description="details" visible={type !== "RESCHEDULE"}>
        <Textarea
          {...form.getInputProps("note")}
          placeholder={t`Enter details (Optional)`}
          minRows={4}
          autosize
          readOnly={type === "RESCHEDULE"}
        />
      </FormSessionIcon>

      {(type === "CREATE" || type === "RESCHEDULE") && (
        <Stack gap={8}>
          {form.values.startTime && !isInWorkspaceWorkSlots && (
            <Blockquote color="orange" p={8} fz={14} fw={500} mt={5}>
              <Trans>Out of work slots</Trans>
            </Blockquote>
          )}

          {form.values.startTime && isPassed && (
            <Blockquote color="orange" p={8} fz={14} fw={500} mt={5}>
              <Trans>You are booking in the past</Trans>
            </Blockquote>
          )}

          {form.values.startTime &&
            form.values.endTime &&
            DateTime.isBefore(form.values.endTime, form.values.startTime) && (
              <Blockquote color="red" p={8} fz={14} fw={500} mt={5}>
                <Trans>End time must be after start time</Trans>
              </Blockquote>
            )}
        </Stack>
      )}

      <Group justify="center">
        {props.onCancel && !form.submitting && (
          <Button variant="outline" color="gray" onClick={props.onCancel}>
            <Trans>Cancel</Trans>
          </Button>
        )}

        <Button onClick={onSubmit} leftIcon={IconCheck} action loading={form.submitting}>
          {type === "CREATE" ? (
            <Trans>Confirm</Trans>
          ) : type === "RESCHEDULE" ? (
            <Trans>Reschedule booking</Trans>
          ) : (
            <Trans>Save</Trans>
          )}
        </Button>
      </Group>
    </Stack>
  );
};
