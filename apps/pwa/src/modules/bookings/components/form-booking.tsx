"use client";

import { Button } from "@/components/buttons/button";
import { FormSessionIcon } from "@/components/form-session";
import { DateFormat, RelativeTimeFormat } from "@/components/format/date-format";
import { TimeInput } from "@/components/inputs/time-input";
import { getBookingTitle } from "@/modules/bookings/booking-utils";
import { CustomerInput } from "@/modules/customers/components/customer-input";
import { useLang } from "@/modules/lang/lang-context";
import { useColor } from "@/modules/theme/use-color";
import { WorkspaceMembersInput } from "@/modules/workspace-members/components/workspace-members-input";
import { WorkspaceMemberDataFragment } from "@/modules/workspace-members/graphql/fragmentWorkspaceMember.graphql";
import { isInWorkingDayInterval } from "@/modules/workspace-settings/workspace-settings-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onFormError } from "@/utils/exceptions.utils";
import { useMutation } from "@apollo/client/react";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans, useLingui } from "@lingui/react/macro";
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

import { BookingStatus } from "@/graphql/enums.graphql";
import { CustomerDataFragment } from "@/modules/customers/graphql/fragmentCustomer.graphql";
import { useWorkspaceSetting } from "@/modules/workspace-settings/hooks/use-workspace-setting";
import { BookingDataFragment } from "../graphql/fragmentBooking.graphql";
import CREATE_BOOKING_MUTATION, {
  CreateBookingMutationVariables,
} from "../graphql/mutationCreateBooking.graphql";
import RESCHEDULE_BOOKING_MUTATION from "../graphql/mutationRescheduleMeeting.graphql";
import UPDATE_BOOKING_MUTATION from "../graphql/mutationUpdateBooking.graphql";

export interface BookingFormProps {
  startTime?: Date;
  endTime?: Date;
  customer?: CustomerDataFragment;
  assigneeUsers?: WorkspaceMemberDataFragment[];

  reschedule?: BookingDataFragment;
  update?: BookingDataFragment;

  onFinished?: () => void;
  onCancel?: () => void;
  onRescheduled?: (booking: BookingDataFragment) => void;
}

export const BookingForm: FC<BookingFormProps> = (props) => {
  const { reschedule } = props;
  const { t } = useLingui();
  const color = useColor();
  const lang = useLang();
  const dateFormat = DateTime.getDateFormatString(lang.locale);
  const workspace = useWorkspace();
  const { workspaceSetting } = useWorkspaceSetting();

  const type = props.update ? "UPDATE" : props.reschedule ? "RESCHEDULE" : "CREATE";

  const [createBooking] = useMutation(CREATE_BOOKING_MUTATION);
  const [rescheduleBooking] = useMutation(RESCHEDULE_BOOKING_MUTATION);
  const [updateBooking] = useMutation(UPDATE_BOOKING_MUTATION);

  const initialValues = useMemo(() => {
    return {
      title: props.update?.title ?? "",
      note: props.update?.note ?? "",
      customer: props.update?.customer ?? props.reschedule?.customer ?? props.customer,
      assigneeUsers: props.update?.assigneeUsers ??
        props.reschedule?.assigneeUsers ??
        props.assigneeUsers ?? [workspace.member],
      startTime: props.update?.startTime
        ? DateTime.normalizeDate(props.update.startTime)
        : props.startTime,
      endTime: props.update?.endTime ? DateTime.normalizeDate(props.update.endTime) : props.endTime,
    };
  }, [props.customer, props.assigneeUsers, props.startTime, props.endTime, props.update, type]);

  const form = useForm({ initialValues });

  const onSubmit = form.onSubmit(async (values) => {
    try {
      if (!values.startTime || !values.endTime) {
        throw Error(t`Start time and end time are required`);
      }

      const variables: CreateBookingMutationVariables = {
        title: values.title,
        note: values.note,
        customerId: values.customer?._id,
        assigneeUserIds: values.assigneeUsers?.map((v) => v.userId) ?? [],
        startTime: DateTime.toSeconds(values.startTime),
        endTime: DateTime.toSeconds(values.endTime),
        status: BookingStatus.JustCreated,
      };

      if (type === "RESCHEDULE") {
        const { data } = await rescheduleBooking({
          variables: {
            ...variables,
            prevBookingId: props.reschedule!._id,
          },
        });

        if (data?.rescheduleBooking) {
          props.onRescheduled?.(data?.rescheduleBooking);
        }
      }

      if (type === "CREATE") {
        await createBooking({
          variables,
        });
      }

      if (type === "UPDATE") {
        await updateBooking({
          variables: {
            ...variables,
            id: props.update!._id,
          },
        });
      }

      props.onFinished?.();
    } catch (error) {
      onFormError(form, error);
    }
  });

  const workingDayIntervals = workspaceSetting?.schedule?.workingDays ?? [];

  const isInWorkspaceWorkSlots = useMemo(() => {
    return form.values.startTime && form.values.endTime && workingDayIntervals.length > 0
      ? isInWorkingDayInterval(form.values.startTime, workingDayIntervals) &&
          isInWorkingDayInterval(form.values.endTime, workingDayIntervals)
      : false;
  }, [form.values.startTime, workingDayIntervals]);

  const isPassed = useMemo(() => {
    return form.values.startTime && DateTime.isBefore(form.values.startTime, new Date());
  }, [form.values.startTime]);

  useEffect(() => {
    form.setInitialValues(initialValues);
    form.reset();
  }, [props]);

  return (
    <Stack pt={16} gap="md">
      <FormSessionIcon icon={IconReservedLine} description={<Trans>Title</Trans>}>
        {type === "RESCHEDULE" ? (
          <Title order={5} fw={500}>
            {getBookingTitle(form.values) || <Trans>Title</Trans>}
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
        description={<Trans>Customer</Trans>}
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
        description={<Trans>Attendees</Trans>}
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
        description={<Trans>Date time</Trans>}
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
                      {v} <Trans>mins</Trans>
                    </Fragment>
                  )}
                </Button>
              );
            })}
          </Group>
        </Stack>
      </FormSessionIcon>

      <FormSessionIcon
        icon={IconNotebook}
        description={<Trans>Detail</Trans>}
        visible={type !== "RESCHEDULE"}
      >
        <Textarea
          {...form.getInputProps("note")}
          placeholder={t`Enter detail (Optional)`}
          minRows={4}
          autosize
          readOnly={type === "RESCHEDULE"}
        />
      </FormSessionIcon>

      {(type === "CREATE" || type === "RESCHEDULE") &&
        form.values.startTime &&
        (!isInWorkspaceWorkSlots ||
          isPassed ||
          (form.values.endTime &&
            DateTime.isBefore(form.values.endTime, form.values.startTime))) && (
          <Stack gap={8}>
            {!isInWorkspaceWorkSlots && (
              <Blockquote color="orange" p={8} fz={14} fw={500} mt={5}>
                <Trans>Out of work slots</Trans>
              </Blockquote>
            )}

            {isPassed && (
              <Blockquote color="orange" p={8} fz={14} fw={500} mt={5}>
                <Trans>You are booking in the past</Trans>
              </Blockquote>
            )}

            {form.values.endTime &&
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

        <Button onClick={() => onSubmit()} leftIcon={IconCheck} loading={form.submitting}>
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
