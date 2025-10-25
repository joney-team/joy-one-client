"use client";

import { useLang } from "@/modules/lang/lang-context";
import { getDateFormat } from "@/modules/lang/lang-service";
import { TaskTimeTracking } from "@/modules/tasks/tasks-types";
import { WorkspaceMemberInfo } from "@/modules/workspace-members/workspace-members-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { DateTime, parseTimeInput, setHoursMinutes, timeInputValue } from "@/utils/date-time.utils";
import { String } from "@/utils/string.utils";
import { t } from "@lingui/core/macro";
import {
  ActionIcon,
  Card,
  Divider,
  em,
  Group,
  InputWrapper,
  InputWrapperProps,
  Modal,
  Stack,
  Switch,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useDebouncedCallback, useDisclosure, useForceUpdate } from "@mantine/hooks";
import {
  IconCalendar,
  IconCaretDownFilled,
  IconCaretRightFilled,
  IconClock,
  IconCurrencyDollar,
  IconCurrencyDollarOff,
  IconMinus,
  IconNote,
  IconPlayerPlayFilled,
  IconPlayerStopFilled,
  IconPlus,
  IconStopwatch,
  IconTrash,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { FC, useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { WorkspaceMemberInput } from "../../modules/workspace-members/components/workspace-member-input";
import { Avatar } from "../avatar";
import { Button } from "../buttons/button";
import { ModalTitle } from "../modal-title";
import { Renderer } from "../renderer";
import { DateInput } from "./date-input";

interface TimeTrackingsInputProps extends Omit<InputWrapperProps, "value" | "onChange"> {
  value?: TaskTimeTracking[];
  onChange?: (value: TaskTimeTracking[]) => any;
}

export const TimeTrackingsInput: FC<TimeTrackingsInputProps> = (props) => {
  const { value, onChange, ...rest } = props;
  const workspace = useWorkspace();
  const [opened, { open, close }] = useDisclosure(false);
  const timeTrackings = value || [];

  const totalTime =
    timeTrackings
      .filter((v) => !!v.endAt)
      .reduce((acc, curr) => acc + (curr.endAt || 0) - (curr.startAt || 0), 0) || 0;

  const groupByUsers = timeTrackings.reduce(
    (acc, curr) => {
      if (!curr.endAt) return acc;
      const user = acc.find((u) => u.user.userId === curr.user.userId);
      if (user) {
        user.timeTrackings.push(curr);
      } else {
        acc.push({ user: curr.user, timeTrackings: [curr] });
      }
      return acc;
    },
    [] as {
      user: WorkspaceMemberInfo;
      timeTrackings: TaskTimeTracking[];
    }[]
  );

  const onRemove = (id: string) => {
    onChange?.([...(value || []).filter((t) => t.id !== id)]);
  };

  const inProgressTracking = timeTrackings.find((v) => !!!v.endAt);

  const onStartTracking = (t?: TaskTimeTracking) => {
    const tracking = {
      ...t,
      id: uuid(),
      user: t?.user || workspace.userMember,
      userId: t?.userId || workspace.userMember.userId,
      startAt: DateTime.timeToSeconds(),
    };

    onChange?.([...(value || []), tracking]);
  };

  const onStopTracking = () => {
    const tracking = timeTrackings.find((v) => !!!v.endAt);
    if (!tracking) return;

    const now = DateTime.timeToSeconds();
    const seconds = now - tracking.startAt;
    const minSeconds = 60;

    if (seconds < minSeconds) {
      onRemove(tracking.id);
    } else {
      onChange?.([
        ...(value || []).filter((v) => v.id !== tracking!.id),
        {
          ...tracking,
          endAt: now,
        },
      ]);
    }
  };

  return (
    <InputWrapper {...rest}>
      <Group gap={8} flex={props.flex} onClick={open} style={{ cursor: "pointer" }}>
        <Group>
          <Renderer visible={!!!inProgressTracking}>
            <Text>{DateTime.toHHMM(totalTime)}</Text>
          </Renderer>

          <Renderer visible={!!inProgressTracking}>
            <InProgressTimeTrackingTimmer timeTracking={inProgressTracking!} />
          </Renderer>
        </Group>

        <Renderer visible={!!!inProgressTracking}>
          <ActionIcon
            radius={100}
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onStartTracking();
            }}
            color="green"
          >
            <IconPlayerPlayFilled size={13} />
          </ActionIcon>
        </Renderer>

        <Renderer visible={!!inProgressTracking}>
          <ActionIcon
            radius={100}
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onStopTracking();
            }}
            color="red"
          >
            <IconPlayerStopFilled size={13} />
          </ActionIcon>
        </Renderer>
      </Group>

      <Modal
        opened={opened}
        onClose={close}
        size={500}
        title={<ModalTitle title={t`Time trackings`} icon={IconStopwatch} />}
      >
        <Stack gap={30}>
          <Stack gap={8}>
            <Group justify="space-between">
              <Text fz={14} fw={500}>
                {t`Total time`}
              </Text>
              <Text fz={14} fw={700}>
                {DateTime.toHHMM(totalTime)}
              </Text>
            </Group>

            <TimeTrackingForm
              timeTracking={timeTrackings.find((v) => !!!v.endAt)}
              onSubmit={(t) => {
                onChange?.([...(value || []), t]);
                close();
              }}
              onChange={(t) => onChange?.([...(value || []).map((v) => (v.id === t.id ? t : v))])}
              onStartTracking={onStartTracking}
              onStopTracking={onStopTracking}
            />
          </Stack>

          {groupByUsers.length > 0 && (
            <Stack gap={8}>
              <Group justify="space-between">
                <Text fz={14} fw={500}>
                  {t`All time trackings`}
                </Text>
              </Group>

              {groupByUsers.map((t) => {
                return <TimeTrackingGroupByUser key={t.user.userId} onRemove={onRemove} {...t} />;
              })}
            </Stack>
          )}
        </Stack>
      </Modal>
    </InputWrapper>
  );
};

const InProgressTimeTrackingTimmer: FC<{
  timeTracking: TaskTimeTracking;
}> = (props) => {
  const forceUpdate = useForceUpdate();
  const now = DateTime.timeToSeconds();

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return <Text w={70}>{DateTime.toHHMMSS(now - props.timeTracking.startAt)}</Text>;
};

export const TimeTrackingGroupByUser: FC<{
  onRemove: (id: string) => any;
  user: WorkspaceMemberInfo;
  timeTrackings: TaskTimeTracking[];
}> = (props) => {
  const lang = useLang();
  const totalTime =
    props.timeTrackings
      .filter((v) => !!v.endAt)
      .reduce((acc, curr) => acc + (curr.endAt || 0) - (curr.startAt || 0), 0) || 0;
  const [isShowList, setIsShowList] = useState(false);

  return (
    <Stack>
      <Group gap={3}>
        <ActionIcon variant="subtle" color="gray" onClick={() => setIsShowList((s) => !s)}>
          {isShowList ? <IconCaretDownFilled size={16} /> : <IconCaretRightFilled size={16} />}
        </ActionIcon>

        <Group flex={1} gap={8}>
          <Avatar size={20} src={props.user.avatar} />
          <Text fz={em(13)}>{props.user.name}</Text>
        </Group>
        <Text fz={em(13)} fw={500}>
          {DateTime.toHHMM(totalTime)}
        </Text>
      </Group>

      {isShowList && (
        <Stack pl={30}>
          {props.timeTrackings
            .filter((v) => !!v.endAt)
            .map((t) => {
              return (
                <Card withBorder shadow="none" p={10} key={props.user.userId + t.id}>
                  <Group justify="space-between">
                    <Group gap={0}>
                      <Stack gap={3} align="center">
                        <Text fz={14} fw={500}>
                          {DateTime.toHHMM(t.endAt! - t.startAt)}
                        </Text>

                        <Renderer visible={t.billable}>
                          <ThemeIcon variant="filled" size={18} radius={100}>
                            <IconCurrencyDollar size={14} />
                          </ThemeIcon>
                        </Renderer>
                      </Stack>

                      <Divider orientation="vertical" mx={10} />

                      <Stack gap={8}>
                        <Group gap={5}>
                          <ThemeIcon variant="transparent" size={18} color="gray">
                            <IconCalendar size={16} />
                          </ThemeIcon>

                          <Text fz={14}>
                            {String.capitalizeFirstLetter(
                              dayjs(t.startAt * 1000).format(`dd ${getDateFormat()}`)
                            )}
                          </Text>

                          <ThemeIcon variant="transparent" size={18} color="gray" ml={5}>
                            <IconClock size={16} />
                          </ThemeIcon>

                          <Text fz={14}>
                            {dayjs(t.startAt * 1000).format("HH:mm")} -{" "}
                            {dayjs(t.endAt! * 1000).format("HH:mm")}
                          </Text>
                        </Group>

                        <Renderer visible={!!t.note}>
                          <Group gap={5}>
                            <ThemeIcon variant="transparent" size={18} color="gray">
                              <IconNote />
                            </ThemeIcon>
                            <Text fz={14}>{t.note}</Text>
                          </Group>
                        </Renderer>
                      </Stack>
                    </Group>

                    <Group gap={5}>
                      <ActionIcon variant="subtle" color="red" onClick={() => props.onRemove(t.id)}>
                        <IconTrash size={16} strokeWidth={1.5} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Card>
              );
            })}
        </Stack>
      )}
    </Stack>
  );
};

export const TimeTrackingForm: FC<{
  timeTracking?: TaskTimeTracking;
  onSubmit: (timeTracking: TaskTimeTracking) => any;
  onStartTracking: (t?: TaskTimeTracking) => void;
  onStopTracking: () => void;
  onChange?: (timeTracking: TaskTimeTracking) => void;
}> = (props) => {
  const workspace = useWorkspace();
  const startAtRef = useRef<HTMLInputElement>(null);
  const endAtRef = useRef<HTMLInputElement>(null);
  const timeTrackingRef = useRef<HTMLInputElement>(null);

  const onChange = useDebouncedCallback((values: TaskTimeTracking) => {
    onChange?.(values);
  }, 500);

  const form = useForm<TaskTimeTracking>({
    initialValues: props.timeTracking || {
      id: "",
      userId: workspace.userMember.userId,
      user: workspace.userMember,
      note: "",
      billable: true,
      startAt: DateTime.timeToSeconds(),
      endAt: DateTime.timeToSeconds() + 60 * 15,
    },
    onValuesChange: (values) => {
      if (props.timeTracking?.id) {
        onChange(values);
      }
    },
  });

  const handleTimeTrackingChange = useDebouncedCallback(async (input: string) => {
    const { seconds } = parseTimeInput(input);
    if (seconds > 0) form.setFieldValue("endAt", form.values.startAt + seconds);
  }, 500);

  const onSubmit = form.onSubmit((values) => {
    props.onSubmit({ ...values, id: uuid() });
  });

  useEffect(() => {
    setTimeout(() => {
      timeTrackingRef.current?.focus();
    }, 300);
  }, []);

  return (
    <Card withBorder shadow="none" p="md">
      <Card.Section withBorder p="sm" bg="gray.0">
        <WorkspaceMemberInput
          clearable={false}
          value={form.values.user}
          onChange={(user) => form.setFieldValue("user", user!)}
        />
      </Card.Section>

      <Card.Section withBorder p={0} py="sm" pr="sm">
        <Group justify="space-between">
          {!!!props.timeTracking && (
            <TextInput
              flex={1}
              ref={timeTrackingRef}
              placeholder={t`Enter time (ex 3h 30m) or start timer`}
              styles={{
                input: { border: "none" },
              }}
              onChange={(e) => handleTimeTrackingChange(e.currentTarget.value)}
            />
          )}

          {!!props.timeTracking && (
            <Group px={16} h={36}>
              <InProgressTimeTrackingTimmer timeTracking={props.timeTracking} />
            </Group>
          )}

          {!!!props.timeTracking ? (
            <ActionIcon
              radius={100}
              onClick={() => props.onStartTracking(form.values)}
              color="green"
            >
              <IconPlayerPlayFilled size={16} />
            </ActionIcon>
          ) : (
            <ActionIcon radius={100} color="red" onClick={props.onStopTracking}>
              <IconPlayerStopFilled size={16} />
            </ActionIcon>
          )}
        </Group>
      </Card.Section>

      <Card.Section withBorder p="sm">
        <Stack gap={5} mt={-8}>
          <Renderer visible={!!!props.timeTracking}>
            <InputWrapper label={t`Time`}>
              <Group gap={10} wrap="nowrap">
                <DateInput
                  clearable={false}
                  value={form.values.startAt}
                  onChange={(v) => {
                    if (!v) return;
                    form.setFieldValue("startAt", v);
                    form.setFieldValue("endAt", v + 60);
                  }}
                />

                <Group gap={5} wrap="nowrap">
                  <TimeInput
                    flex={1}
                    ref={startAtRef}
                    value={timeInputValue(form.values.startAt)}
                    onChange={(e) => {
                      if (!form.values.startAt || !e.currentTarget.value) return;
                      const [hours, minutes] = e.currentTarget.value.split(":");
                      const startAt = setHoursMinutes(form.values.startAt, hours, minutes);
                      form.setFieldValue("startAt", startAt);

                      // Sync with end at
                      const timeTracking = timeTrackingRef.current?.value;
                      if (timeTracking) {
                        const { seconds } = parseTimeInput(timeTracking);
                        form.setFieldValue("endAt", startAt + seconds);
                      } else if (form.values.endAt && startAt >= form.values.endAt) {
                        form.setFieldValue("endAt", startAt + 60);
                      }
                    }}
                    rightSection={
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={() => startAtRef.current?.showPicker()}
                      >
                        <IconClock size={16} stroke={1.5} />
                      </ActionIcon>
                    }
                  />

                  <ThemeIcon variant="transparent" size={18} color="dark">
                    <IconMinus />
                  </ThemeIcon>

                  <TimeInput
                    ref={endAtRef}
                    value={timeInputValue(form.values.endAt)}
                    onChange={(e) => {
                      if (!form.values.endAt || !e.currentTarget.value) return;
                      const [hours, minutes] = e.currentTarget.value.split(":");
                      const endAt = setHoursMinutes(form.values.endAt, hours, minutes);
                      form.setFieldValue("endAt", endAt);

                      const timeTracking = timeTrackingRef.current?.value;
                      if (timeTracking) {
                        const { seconds } = parseTimeInput(timeTracking);
                        form.setFieldValue("startAt", endAt - seconds);
                      } else if (form.values.startAt && endAt <= form.values.startAt) {
                        form.setFieldValue("startAt", endAt - 60);
                      }
                    }}
                    onClick={() => endAtRef.current?.showPicker()}
                    rightSection={
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={() => endAtRef.current?.showPicker()}
                      >
                        <IconClock size={16} stroke={1.5} />
                      </ActionIcon>
                    }
                  />
                </Group>
              </Group>
            </InputWrapper>
          </Renderer>

          <TextInput
            label={t`Note`}
            {...form.getInputProps("note")}
            value={form.values.note || ""}
          />
        </Stack>
      </Card.Section>

      <Card.Section p="sm" bg="gray.0">
        <Group justify="space-between">
          <Switch
            label={t`Mark as billable`}
            checked={form.values.billable}
            onChange={(e) => form.setFieldValue("billable", e.target.checked)}
            onLabel={<IconCurrencyDollar size={16} strokeWidth={2} />}
            offLabel={<IconCurrencyDollarOff size={16} strokeWidth={2} />}
            size="md"
          />

          <Renderer visible={!!!props.timeTracking}>
            <Button onClick={onSubmit} leftIcon={IconPlus}>
              {t`Add`}
            </Button>
          </Renderer>
        </Group>
      </Card.Section>
    </Card>
  );
};
