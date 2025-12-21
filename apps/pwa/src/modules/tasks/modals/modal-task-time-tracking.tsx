"use client";

import { Button } from "@/components/buttons/button";
import { ContentEditable } from "@/components/content-editable/content-editable";
import { Modal } from "@/components/modal/modal";
import { useLayout } from "@/layout/layout-context";
import { useLang } from "@/modules/lang/lang-context";
import { useTasks } from "@/modules/tasks/tasks-context";
import { DefaultTaskStatusId } from "@/modules/tasks/tasks-types";
import { useColor } from "@/modules/theme/use-color";
import { WorkspaceMemberInput } from "@/modules/workspace-members/components/workspace-member-input";
import { WorkspaceMemberInfo } from "@/modules/workspace-members/workspace-members-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onError } from "@/utils/exceptions.utils";
import { useMutation } from "@apollo/client/react";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans, useLingui } from "@lingui/react/macro";
import { ActionIcon, Group, InputWrapper, Stack, Text, ThemeIcon } from "@mantine/core";
import { DateInput, TimeInput } from "@mantine/dates";
import { useForceUpdate } from "@mantine/hooks";
import {
  IconChevronDown,
  IconChevronRight,
  IconClock,
  IconFolder,
  IconMinus,
  IconPlus,
  IconStopwatch,
} from "@tabler/icons-react";
import {
  FC,
  forwardRef,
  Fragment,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { v4 as uuId } from "uuid";
import CREATE_TASK_MUTATION, {
  type CreateTaskMutation,
  type CreateTaskMutationVariables,
} from "../graphql/mutationCreateTask.graphql";

export function findNearestTimeSlot(now = new Date()) {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Các mốc thời gian trong ngày (15 phút mỗi mốc)
  const timeSlots = [];
  for (let i = 0; i < 24 * 60; i += 15) {
    timeSlots.push(i); // Lưu trữ số phút từ đầu ngày
  }

  // Tìm mốc thời gian gần nhất
  let nearestSlot = timeSlots[0];
  let minDifference = Math.abs(currentMinutes - timeSlots[0]);

  for (let i = 1; i < timeSlots.length; i++) {
    const difference = Math.abs(currentMinutes - timeSlots[i]);
    if (difference < minDifference) {
      nearestSlot = timeSlots[i];
      minDifference = difference;
    }
  }

  // Chuyển đổi mốc thời gian từ phút thành định dạng hh:mm
  const hours = Math.floor(nearestSlot / 60);
  const minutes = nearestSlot % 60;
  const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;

  return formattedTime;
}

export interface TaskTimeTrackingModalArgs {
  date: Date;
  onSubmit?: (taskId: string) => any;
}

const ModalTaskTimeTrackingContent: FC<TaskTimeTrackingModalArgs & { close: () => void }> = (
  args
) => {
  const workspace = useWorkspace();
  const lang = useLang();
  const tasks = useTasks();
  const layout = useLayout();
  const { t } = useLingui();

  const startAtRef = useRef<HTMLInputElement>(null);
  const endAtRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [user, setUser] = useState<WorkspaceMemberInfo>(workspace.userMember);
  const [date, setDate] = useState(args.date);

  const forceUpdate = useForceUpdate();
  const [slot, setSlot] = useState<{ startAt: number; endAt: number }>();
  const color = useColor();

  const [createTask] = useMutation<CreateTaskMutation, CreateTaskMutationVariables>(
    CREATE_TASK_MUTATION
  );

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
        variables: {
          input: {
            name,
            assigneeUserIds: [user.userId],
            folderId: tasks.activatedFolder?._id,
            status: DefaultTaskStatusId.CLOSED,
            timeTrackings: [
              {
                id: uuId(),
                userId: user.userId,
                startAt: DateTime.toSeconds(startAt),
                endAt: DateTime.toSeconds(endAt),
              },
            ],
          },
        },
      });

      if (!result.data) throw new Error(t`Failed to create task`);

      args.onSubmit?.(result.data.createTask._id);
      args.close();
    } catch (error) {
      onError(error);
    }
  };

  useEffect(() => {
    const interval = setInterval(forceUpdate, 1000 * 60);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const breadcrumbs = useMemo(() => {
    return [
      tasks.activatedFolder && (
        <Group color={tasks.activatedFolder.color ?? "dark"} gap={5}>
          <IconFolder size={18} color={color(tasks.activatedFolder.color ?? "dark")} />
          <Text fz={13} fw={400}>
            {tasks.activatedFolder.name}
          </Text>
        </Group>
      ),
      <Text fz={13} fw={400} c="gray">
        <Trans>New Task</Trans>
      </Text>,
    ].filter(Boolean);
  }, [tasks.activatedFolder]);

  return (
    <Stack>
      {breadcrumbs.length > 1 && (
        <Group gap={0}>
          {breadcrumbs.map((breadcrumb, index) => (
            <Fragment key={index}>
              {breadcrumb}
              {index < breadcrumbs.length - 1 && (
                <ThemeIcon variant="transparent" color="gray" size="sm">
                  <IconChevronRight size={14} />
                </ThemeIcon>
              )}
            </Fragment>
          ))}
        </Group>
      )}

      <ContentEditable
        autoFocus
        placeholder={t`Enter task name`}
        placeHolderFontSize={layout.view === "mobile" ? 12 : 18}
        fz={layout.view === "mobile" ? 18 : 25}
        fw={500}
        value={name}
        onChange={(e) => setName(e || "")}
      />

      <InputWrapper label={<Trans>Time</Trans>}>
        <Group gap={10} wrap="nowrap">
          <DateInput
            valueFormat={DateTime.getDateFormatString(lang.locale)}
            value={date}
            onChange={(v) => setDate(new Date(v!))}
          />

          <Group gap={5} wrap="nowrap">
            <TimeInput
              flex={1}
              ref={startAtRef}
              value={DateTime.toTimeInputValue(slot?.startAt)}
              onChange={(e) => {
                const [hours, minutes] = e.currentTarget.value.split(":");
                const startAt = DateTime.toSeconds(new Date().setHours(+hours, +minutes, 0, 0));

                setSlot(
                  slot
                    ? {
                        startAt: startAt,
                        endAt: slot.endAt > startAt ? slot.endAt : startAt + 60 * 60,
                      }
                    : {
                        startAt: startAt,
                        endAt: startAt + 60 * 60,
                      }
                );
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
              defaultValue={DateTime.toTimeInputValue(slot?.endAt)}
              onChange={(e) => {
                if (!slot) return;
                const [hours, minutes] = e.currentTarget.value.split(":");
                const endAt = DateTime.toSeconds(new Date().setHours(+hours, +minutes, 0, 0));

                setSlot({
                  startAt: slot.startAt,
                  endAt,
                });
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

      <Button leftIcon={IconPlus} onClick={onSubmit} mt={10}>
        <Trans>Add</Trans>
      </Button>
    </Stack>
  );
};

export interface ModalTaskTimeTrackingRef {
  open: (args: TaskTimeTrackingModalArgs) => void;
  close: () => void;
}

export const ModalTaskTimeTracking = forwardRef<
  ModalTaskTimeTrackingRef,
  {
    children?: (ref: ModalTaskTimeTrackingRef) => ReactNode;
  }
>((props, ref) => {
  const [args, setArgs] = useState<TaskTimeTrackingModalArgs | null>(null);

  useImperativeHandle(ref, () => ({
    open: (a) => {
      setArgs(a ?? {});
    },
    close: () => {
      setArgs(null);
    },
  }));

  return (
    <Fragment>
      {typeof props.children === "function"
        ? props.children({
            open: (a) => {
              setArgs(a ?? {});
            },
            close: () => {
              setArgs(null);
            },
          })
        : null}

      <Modal
        opened={!!args}
        onClose={() => setArgs(null)}
        name={<Trans>Add time trackings</Trans>}
        icon={IconStopwatch}
        size={460}
      >
        {!!args && <ModalTaskTimeTrackingContent {...args} close={() => setArgs(null)} />}
      </Modal>
    </Fragment>
  );
});
