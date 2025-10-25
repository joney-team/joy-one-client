import { Button } from "@/components/buttons/button";
import { ContentEditable } from "@/components/content-editable/content-editable";
import { ModalTitle } from "@/components/modal-title";
import { Renderer } from "@/components/renderer";
import { calendarDayJsLocalizer } from "@/configs/calendar.config";
import { useLayout } from "@/layout/layout-context";
import { useLang } from "@/modules/lang/lang-context";
import { useTasks } from "@/modules/tasks/tasks-context";
import { createTask } from "@/modules/tasks/tasks-service";
import { DefaultTaskStatusId, TaskEntity } from "@/modules/tasks/tasks-types";
import { useColor } from "@/modules/theme/use-color";
import { WorkspaceMemberInput } from "@/modules/workspace-members/components/workspace-member-input";
import { WorkspaceMemberInfo } from "@/modules/workspace-members/workspace-members-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import {
  DateTime,
  findNearestTimeSlot,
  setHoursMinutes,
  timeInputValue,
} from "@/utils/date-time.utils";
import { onError } from "@/utils/exceptions.utils";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  Card,
  em,
  Group,
  InputWrapper,
  Modal,
  ScrollArea,
  Stack,
  Switch,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { DateInput, TimeInput } from "@mantine/dates";
import { useDisclosure, useForceUpdate } from "@mantine/hooks";
import {
  IconChevronDown,
  IconClock,
  IconCurrencyDollar,
  IconCurrencyDollarOff,
  IconFolder,
  IconMinus,
  IconPlus,
  IconStopwatch,
} from "@tabler/icons-react";
import { FC, useEffect, useRef, useState } from "react";
import { Calendar } from "react-big-calendar";
import { v4 as uuId } from "uuid";

export interface TaskTimeTrackingModalProps {
  date: Date;
  onSubmit?: (task: TaskEntity) => any;
}

const ModalTaskTimeTrackingContent: FC<TaskTimeTrackingModalProps & { close: () => void }> = (
  props
) => {
  const workspace = useWorkspace();
  const lang = useLang();
  const tasks = useTasks();
  const layout = useLayout();

  const startAtRef = useRef<HTMLInputElement>(null);
  const endAtRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [user, setUser] = useState<WorkspaceMemberInfo>(workspace.userMember);
  const [billable, setBillable] = useState(true);
  const [date, setDate] = useState(props.date);

  const viewport = useRef<HTMLDivElement>(null);
  const forceUpdate = useForceUpdate();
  const [slot, setSlot] = useState<{ startAt: number; endAt: number }>();
  const color = useColor();

  const scrollToSlot = (time = new Date()) => {
    const offset = 15;
    const nearestTime = findNearestTimeSlot(new Date(time.getTime() - offset * 60 * 1000));
    const el = document.getElementsByClassName(`rbc-time-slot ${nearestTime}`);
    if (el?.[0]) {
      el?.[0].scrollIntoView({ behavior: "instant" });
    } else {
      const indicator = document.getElementsByClassName("rbc-current-time-indicator");
      if (indicator?.[0]) {
        indicator?.[0].scrollIntoView({ behavior: "instant" });
      }
    }
  };

  const onSubmit = async () => {
    try {
      if (!name) throw new Error(t`Please enter task name`);

      if (!slot) throw new Error(t`Please select time`);

      const time = new Date(date);
      const startAt = time.setHours(
        new Date(slot.startAt * 1000).getHours(),
        new Date(slot.startAt * 1000).getMinutes(),
        0,
        0
      );
      const endAt = time.setHours(
        new Date(slot.endAt * 1000).getHours(),
        new Date(slot.endAt * 1000).getMinutes(),
        0,
        0
      );

      if (startAt > endAt) {
        throw new Error(t`Start time must be before end time`);
      }

      const result = await createTask({
        name,
        assigneeUserIds: [user.userId],
        tagFolderId: tasks.tagFolder?._id,
        status: DefaultTaskStatusId.CLOSED,
        timeTrackings: [
          {
            id: uuId(),
            userId: user.userId,
            user,
            startAt: DateTime.timeToSeconds(startAt),
            endAt: DateTime.timeToSeconds(endAt),
            billable,
          },
        ],
      });

      props.onSubmit?.(result);
      props.close();
    } catch (error) {
      onError(error);
    }
  };

  useEffect(() => {
    setTimeout(() => scrollToSlot(), 100);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate();
    }, 1000 * 60);

    return () => clearInterval(interval);
  }, []);

  return (
    <Stack>
      {tasks.tagFolder && (
        <Group gap={2} align="center" wrap="nowrap" ml={-8}>
          <Button
            size="compact-sm"
            variant="subtle"
            color={color(tasks.tagFolder.color || "gray")}
            fz={16}
            fw={500}
            leftIcon={IconFolder}
          >
            {tasks.tagFolder.name}
          </Button>

          <Text>/</Text>

          <Text px={8} fz={em(14)} fw={300}>
            <Trans>New task</Trans>
          </Text>
        </Group>
      )}

      <ContentEditable
        mt={3}
        autoFocus
        placeholder={t`Enter task name`}
        placeHolderFontSize={layout.view === "mobile" ? 12 : 18}
        fz={layout.view === "mobile" ? 18 : 25}
        fw={500}
        value={name}
        onChange={(e) => setName(e || "")}
      />

      <Renderer views={["desktop", "tablet"]}>
        <InputWrapper label={t`Time`}>
          <Card withBorder shadow="none" p={0}>
            <ScrollArea h={450} viewportRef={viewport}>
              <Calendar
                className="hide-header border-none"
                localizer={calendarDayJsLocalizer}
                date={new Date()}
                view="day"
                toolbar={false}
                step={16}
                selectable
                events={
                  slot
                    ? [
                        {
                          start: new Date(slot.startAt * 1000),
                          end: new Date(slot.endAt * 1000),
                          title: (
                            <Group gap={3} ml={-3}>
                              <IconStopwatch size={16} strokeWidth={1.5} />
                              <Text fz={13} fw={500}>
                                {DateTime.toHHMM((slot.endAt * 1000 - slot.startAt * 1000) / 1000)}
                              </Text>
                            </Group>
                          ),
                        },
                      ]
                    : []
                }
                onSelectSlot={(slot) => {
                  setSlot({
                    startAt: DateTime.timeToSeconds(slot.start),
                    endAt: DateTime.timeToSeconds(slot.end),
                  });
                }}
                formats={{
                  timeGutterFormat: (date, culture) => {
                    return calendarDayJsLocalizer.format(date, "HH:mm", culture);
                  },
                  selectRangeFormat: ({ start, end }) => {
                    return DateTime.toHHMM((end.getTime() - start.getTime()) / 1000);
                  },
                  eventTimeRangeFormat: ({ start, end }) => {
                    return `${calendarDayJsLocalizer.format(
                      start,
                      "HH:mm"
                    )} - ${calendarDayJsLocalizer.format(end, "HH:mm")}`;
                  },
                }}
                slotPropGetter={(slot) => {
                  return {
                    className: calendarDayJsLocalizer.format(slot, "HH:mm"),
                  };
                }}
                eventPropGetter={() => {
                  return {
                    style: {
                      backgroundColor: color("primary"),
                      borderRadius: "3px",
                      borderWidth: "1.5px",
                      borderColor: color("primary.8"),
                    },
                  };
                }}
              />
            </ScrollArea>
          </Card>
        </InputWrapper>
      </Renderer>

      <InputWrapper label={t`Time`}>
        <Group gap={10} wrap="nowrap">
          <DateInput
            valueFormat={lang.config.dateFormat}
            value={date}
            onChange={(v) => setDate(new Date(v!))}
          />

          <Group gap={5} wrap="nowrap">
            <TimeInput
              flex={1}
              ref={startAtRef}
              value={timeInputValue(slot?.startAt)}
              onChange={(e) => {
                const [hours, minutes] = e.currentTarget.value.split(":");
                const startAt = setHoursMinutes(new Date().getTime(), +hours, +minutes);

                setSlot(
                  slot
                    ? {
                        startAt: startAt,
                        endAt: slot.endAt > startAt ? slot.endAt : startAt + 60 * 30,
                      }
                    : {
                        startAt: startAt,
                        endAt: startAt + 60 * 30,
                      }
                );

                scrollToSlot(new Date(startAt * 1000));
              }}
              rightSection={
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  component="div"
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
              disabled={!slot}
              defaultValue={timeInputValue(slot?.endAt)}
              onChange={(e) => {
                if (!slot) return;
                const [hours, minutes] = e.currentTarget.value.split(":");
                const endAt = setHoursMinutes(new Date().getTime(), +hours, +minutes);

                setSlot({
                  startAt: slot.startAt,
                  endAt: endAt,
                });

                scrollToSlot(new Date(slot.startAt * 1000));
              }}
              onClick={() => endAtRef.current?.showPicker()}
              rightSection={
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  component="div"
                  onClick={() => endAtRef.current?.showPicker()}
                >
                  <IconClock size={16} stroke={1.5} />
                </ActionIcon>
              }
            />
          </Group>
        </Group>
      </InputWrapper>

      <Group justify="space-between">
        <Switch
          label={t`Mark as billable`}
          checked={billable}
          onChange={(e) => setBillable(e.target.checked)}
          onLabel={<IconCurrencyDollar size={16} strokeWidth={2} />}
          offLabel={<IconCurrencyDollarOff size={16} strokeWidth={2} />}
          size="md"
          color={color(tasks.tagFolder?.color || "primary")}
        />

        <WorkspaceMemberInput
          clearable={false}
          value={user}
          onChange={(user) => setUser(user!)}
          userCardProps={{
            rightSection: (
              <ThemeIcon variant="transparent" color="gray" size="sm" ml={-12} pr={5}>
                <IconChevronDown size={16} />
              </ThemeIcon>
            ),
          }}
        />
      </Group>

      <Button
        leftIcon={IconPlus}
        onClick={onSubmit}
        action
        mt={10}
        color={color(tasks.tagFolder?.color || "primary")}
      >
        {t`Add`}
      </Button>
    </Stack>
  );
};

export let OnModalTaskTimeTracking: (props: TaskTimeTrackingModalProps) => void = (
  props: TaskTimeTrackingModalProps
) => {};

export const ModalTaskTimeTracking: FC = () => {
  const props = useRef<TaskTimeTrackingModalProps | null>(null);
  const forceUpdate = useForceUpdate();
  const [opened, { open, close }] = useDisclosure(false);
  const { tagFolder } = useTasks();

  OnModalTaskTimeTracking = (p) => {
    props.current = p || null;
    forceUpdate();
    open();
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={
        <ModalTitle title={t`Add time trackings`} icon={IconStopwatch} color={tagFolder?.color} />
      }
      size={460}
    >
      {!!props.current && <ModalTaskTimeTrackingContent {...props.current} close={close} />}
    </Modal>
  );
};
