"use client";

import { TaskDataFragment } from "@/modules/tasks/graphql/fragmentTask.graphql";
import { TaskTimeTrackingDataFragment } from "@/modules/tasks/graphql/fragmentTaskTimeTracking.graphql";
import { useUpdateTasks } from "@/modules/tasks/hooks/use-update-tasks";
import { WorkspaceMemberDataFragment } from "@/modules/workspace-members/graphql/fragmentWorkspaceMember.graphql";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  ActionIcon,
  Card,
  Divider,
  em,
  Group,
  GroupProps,
  InputWrapper,
  Stack,
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
  IconMinus,
  IconNote,
  IconPlayerPlayFilled,
  IconPlayerStopFilled,
  IconPlus,
  IconStopwatch,
  IconTrash,
} from "@tabler/icons-react";
import { FC, Fragment, useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { WorkspaceMemberInput } from "../../modules/workspace-members/components/workspace-member-input";
import { Avatar } from "../avatar";
import { Button } from "../buttons/button";
import { DateFormat } from "../format/date-format";
import { Modal } from "../modal/modal";
import { Renderer } from "../renderer";
import { DateInput } from "./date-input";

interface TimeTrackingsInputProps extends GroupProps {
  task: TaskDataFragment;
}

export const TimeTrackingsInput: FC<TimeTrackingsInputProps> = ({ task, ...rest }) => {
  const workspace = useWorkspace();
  const [opened, { open, close }] = useDisclosure(false);
  const { updateTasks } = useUpdateTasks();
  const timeTrackings = task.timeTrackings ?? [];

  const totalTime =
    timeTrackings
      .filter((v) => !!v.endAt)
      .reduce((acc, curr) => acc + (curr.endAt || 0) - (curr.startAt || 0), 0) || 0;

  const groupByUsers = timeTrackings.reduce<
    {
      user: WorkspaceMemberDataFragment;
      timeTrackings: TaskTimeTrackingDataFragment[];
    }[]
  >((acc, curr) => {
    if (!curr.endAt || !curr.user) return acc;
    const user = acc.find((u) => u.user.userId === curr.user?._id);
    if (user) {
      user.timeTrackings.push(curr);
    } else {
      acc.push({ user: curr.user, timeTrackings: [curr] });
    }
    return acc;
  }, []);

  const onRemove = (id: string) => {
    updateTasks({ _id: task._id, timeTrackings: timeTrackings.filter((t) => t.id !== id) });
  };

  const inProgressTracking = timeTrackings.find((v) => !!!v.endAt);

  const onStartTracking = (t?: TaskTimeTrackingDataFragment) => {
    const timeTracking: TaskTimeTrackingDataFragment = {
      __typename: "TaskTimeTracking",
      ...t,
      id: uuid(),
      user: t?.user || workspace.member,
      userId: t?.userId || workspace.userMember.userId,
      startAt: DateTime.toSeconds(new Date()),
      workspaceId: workspace.userMember.workspaceId,
      note: null,
      endAt: null,
    };

    updateTasks({ _id: task._id, timeTrackings: [...timeTrackings, timeTracking] });
  };

  const onStopTracking = () => {
    const tracking = timeTrackings.find((v) => !!!v.endAt);
    if (!tracking) return;

    const now = DateTime.toSeconds(new Date());
    const seconds = now - tracking.startAt;
    const minSeconds = 60;

    if (seconds < minSeconds) {
      onRemove(tracking.id);
    } else {
      updateTasks({
        _id: task._id,
        timeTrackings: timeTrackings.map((t) => (t.id === tracking.id ? { ...t, endAt: now } : t)),
      });
    }
  };

  return (
    <Fragment>
      <Group gap={8} flex={rest.flex} onClick={open}>
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
        id="time-trackings-input"
        opened={opened}
        onClose={close}
        size={500}
        name={<Trans>Time trackings</Trans>}
        icon={IconStopwatch}
      >
        <Stack gap={30}>
          <Stack gap={8}>
            <Group justify="space-between">
              <Text fz={14} fw={500}>
                <Trans>Total time</Trans>
              </Text>
              <Text fz={14} fw={700}>
                {DateTime.toHHMM(totalTime)}
              </Text>
            </Group>

            <TimeTrackingForm
              key={timeTrackings.find((v) => !!!v.endAt)?.id ?? "new-tracking"}
              timeTracking={timeTrackings.find((v) => !!!v.endAt)}
              onSubmit={(t) => {
                updateTasks({ _id: task._id, timeTrackings: [...timeTrackings, t] });
                close();
              }}
              onChange={(t) => {
                updateTasks({
                  _id: task._id,
                  timeTrackings: timeTrackings.map((v) => (v.id === t.id ? t : v)),
                });
              }}
              onStartTracking={onStartTracking}
              onStopTracking={onStopTracking}
            />
          </Stack>

          {groupByUsers.length > 0 && (
            <Stack gap={8}>
              <Group justify="space-between">
                <Text fz={14} fw={500}>
                  <Trans>All time trackings</Trans>
                </Text>
              </Group>

              {groupByUsers.map((t) => {
                return <TimeTrackingGroupByUser key={t.user.userId} onRemove={onRemove} {...t} />;
              })}
            </Stack>
          )}
        </Stack>
      </Modal>
    </Fragment>
  );
};

const InProgressTimeTrackingTimmer: FC<{
  timeTracking: TaskTimeTrackingDataFragment;
}> = (props) => {
  const forceUpdate = useForceUpdate();
  const now = DateTime.toSeconds(new Date());

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
  onRemove: (id: string) => void;
  user: WorkspaceMemberDataFragment;
  timeTrackings: TaskTimeTrackingDataFragment[];
}> = (props) => {
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
                      </Stack>

                      <Divider orientation="vertical" mx={10} />

                      <Stack gap={8}>
                        <Group gap={5}>
                          <ThemeIcon variant="transparent" size={18} color="gray">
                            <IconCalendar size={16} />
                          </ThemeIcon>

                          <Text fz={14}>
                            <DateFormat value={t.startAt} type="date" />
                          </Text>

                          <ThemeIcon variant="transparent" size={18} color="gray" ml={5}>
                            <IconClock size={16} />
                          </ThemeIcon>

                          <Text fz={14}>
                            {DateTime.toTimeInputValue(t.startAt)} -{" "}
                            {DateTime.toTimeInputValue(t.endAt)}
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
  timeTracking?: TaskTimeTrackingDataFragment | null;
  onSubmit: (timeTracking: TaskTimeTrackingDataFragment) => any;
  onStartTracking: (t?: TaskTimeTrackingDataFragment) => void;
  onStopTracking: () => void;
  onChange?: (timeTracking: TaskTimeTrackingDataFragment) => void;
}> = (props) => {
  const { t } = useLingui();
  const workspace = useWorkspace();
  const startAtRef = useRef<HTMLInputElement>(null);
  const endAtRef = useRef<HTMLInputElement>(null);
  const timeTrackingRef = useRef<HTMLInputElement>(null);

  const onChange = useDebouncedCallback((values: TaskTimeTrackingDataFragment) => {
    props.onChange?.(values);
  }, 500);

  const form = useForm<TaskTimeTrackingDataFragment>({
    initialValues: props.timeTracking
      ? { ...props.timeTracking }
      : {
          __typename: "TaskTimeTracking",
          id: "",
          workspaceId: workspace.member.workspaceId,
          userId: workspace.member.userId,
          user: workspace.member,
          note: "",
          startAt: DateTime.toSeconds(new Date()),
          endAt: DateTime.toSeconds(new Date()) + 60 * 15,
        },
    onValuesChange: (values) => {
      if (props.timeTracking?.id) {
        onChange(values);
      }
    },
  });

  const handleTimeTrackingChange = useDebouncedCallback(async (input: string) => {
    const { seconds } = DateTime.parseTimeInputValue(input);
    if (seconds > 0) form.setFieldValue("endAt", form.values.startAt + seconds);
  }, 500);

  const onSubmit = form.onSubmit((values) => {
    props.onSubmit({
      ...values,
      id: uuid(),
    });
  });

  useEffect(() => {
    setTimeout(() => {
      timeTrackingRef.current?.focus();
    }, 300);
  }, []);

  return (
    <Card withBorder shadow="none" p="md" style={{ overflow: "visible" }}>
      <Card.Section
        withBorder
        p="sm"
        bg="gray.0"
        style={{
          borderTopLeftRadius: `var(--paper-radius)`,
          borderTopRightRadius: `var(--paper-radius)`,
        }}
      >
        <WorkspaceMemberInput
          clearable={false}
          value={form.values.user}
          onChange={(user) => {
            if (user) form.setFieldValue("user", user as any);
          }}
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
                    value={DateTime.toTimeInputValue(form.values.startAt)}
                    onChange={(e) => {
                      if (!form.values.startAt || !e.currentTarget.value) return;
                      const [hours, minutes] = e.currentTarget.value.split(":");
                      const startAt = DateTime.toSeconds(
                        new Date().setHours(+hours, +minutes, 0, 0)
                      );
                      form.setFieldValue("startAt", startAt);

                      // Sync with end at
                      const timeTracking = timeTrackingRef.current?.value;
                      if (timeTracking) {
                        const { seconds } = DateTime.parseTimeInputValue(timeTracking);
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
                    value={DateTime.toTimeInputValue(form.values.endAt)}
                    onChange={(e) => {
                      if (!form.values.endAt || !e.currentTarget.value) return;
                      const [hours, minutes] = e.currentTarget.value.split(":");
                      const endAt = DateTime.toSeconds(new Date().setHours(+hours, +minutes, 0, 0));
                      form.setFieldValue("endAt", endAt);

                      const timeTracking = timeTrackingRef.current?.value;
                      if (timeTracking) {
                        const { seconds } = DateTime.parseTimeInputValue(timeTracking);
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
            label={<Trans>Note</Trans>}
            defaultValue={form.values.note || ""}
            onChange={(e) => form.setFieldValue("note", e.currentTarget.value)}
          />
        </Stack>
      </Card.Section>

      {!props.timeTracking && (
        <Card.Section
          p="sm"
          bg="gray.0"
          style={{
            borderBottomLeftRadius: `var(--paper-radius)`,
            borderBottomRightRadius: `var(--paper-radius)`,
          }}
        >
          <Group justify="center">
            <Button onClick={() => onSubmit()} leftIcon={IconPlus}>
              <Trans>Add</Trans>
            </Button>
          </Group>
        </Card.Section>
      )}
    </Card>
  );
};
