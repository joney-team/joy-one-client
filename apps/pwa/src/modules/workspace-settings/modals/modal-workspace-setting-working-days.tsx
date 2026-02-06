"use client";

import { Button } from "@/components/buttons/button";
import { Modal } from "@/components/modal/modal";
import { ModalHead } from "@/components/modal/modal-head";
import { TimeSlots } from "@/components/time-slots/time-slots";
import { TimeEvent, TimeInterval } from "@/components/time-slots/time-slots.types";
import { WorkingDayInterval } from "@/graphql/types.graphql";
import { useLang } from "@/modules/lang/lang-context";
import { zIndexes } from "@joy-one-client/config/layout";
import { renderWeekdayFromISO } from "@joy-one-client/utils/date-time-render";
import { Trans, useLingui } from "@lingui/react/macro";
import { Group, Stack, Text, TextInput } from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconCalendar } from "@tabler/icons-react";
import { FC, forwardRef, Fragment, useImperativeHandle, useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import { useWorkspaceSetting } from "../hooks/use-workspace-setting";

export interface ModalWorkspaceSettingWorkingDaysRef {
  open: () => void;
}

const WorkingDayIntervalCard: FC<{
  interval: WorkingDayInterval;
  onDone: (interval: WorkingDayInterval) => void;
  onRemove: () => void;
  onClose: () => void;
}> = ({ interval, onRemove, onClose, onDone }) => {
  const { t } = useLingui();
  const isCreating = interval.id.startsWith("new");

  const form = useForm({
    initialValues: {
      start: interval.start,
      end: interval.end,
      shift: interval.shift ?? "",
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    onDone({ ...interval, ...values });
  });

  return (
    <Stack gap="xs">
      <Group justify="center">
        <Text flex={1} fz="sm">
          <Trans>Time frame</Trans>
        </Text>
        <Group flex={1} gap="xs">
          <TimeInput {...form.getInputProps("start")} />
          <TimeInput {...form.getInputProps("end")} />
        </Group>
      </Group>

      <Group justify="center">
        <Text flex={1} fz="sm">
          <Trans>Shift</Trans>
        </Text>
        <Group flex={1}>
          <TextInput placeholder={t`Enter shift name`} {...form.getInputProps("shift")} />
        </Group>
      </Group>

      <Group justify="center" gap={5} pt="sm">
        {isCreating ? (
          <Button variant="outline" color="gray" onClick={onClose}>
            <Trans>Cancel</Trans>
          </Button>
        ) : (
          <Button variant="outline" color="gray" onClick={onRemove}>
            <Trans>Remove</Trans>
          </Button>
        )}
        <Button onClick={() => onSubmit()} loading={form.submitting}>
          <Trans>Save</Trans>
        </Button>
      </Group>
    </Stack>
  );
};

export const ModalWorkspaceSettingWorkingDays = forwardRef<ModalWorkspaceSettingWorkingDaysRef>(
  (_, ref) => {
    const [selectedInterval, setSelectedInterval] = useState<WorkingDayInterval | null>(null);
    const [creatingInterval, setCreatingInterval] = useState<
      (TimeInterval & { shift?: string | null }) | null
    >(null);

    const [opened, { open, close }] = useDisclosure(false);
    const { locale } = useLang();
    const { workspaceSetting, updateWorkspaceSetting } = useWorkspaceSetting();

    useImperativeHandle(ref, () => ({
      open: () => open(),
      close: () => close(),
    }));

    const cols = useMemo(() => {
      return [1, 2, 3, 4, 5, 6, 7].map((dayWeek) => {
        return {
          dayWeek,
          head: (
            <Stack>
              <Text fz={12} fw={600} tt="capitalize" px="xs">
                {renderWeekdayFromISO(dayWeek, locale)}
              </Text>
            </Stack>
          ),
        };
      });
    }, [locale]);

    const events = useMemo<TimeEvent[]>(() => {
      const currentWorkingDays = (workspaceSetting?.schedule?.workingDays ?? []).reduce<
        TimeEvent[]
      >((combineEvents, workingDay) => {
        const columnIndex = cols.findIndex((col) => col.dayWeek === workingDay.day);

        combineEvents.push({
          ...workingDay,
          columnIndex,
          title: workingDay.shift ? (
            <Text fz={12} fw={600} tt="capitalize">
              <Trans>Shift</Trans> {workingDay.shift}
            </Text>
          ) : null,
        });

        return combineEvents;
      }, []);

      if (creatingInterval) {
        const creatingEvent: TimeEvent = {
          id: "new",
          ...creatingInterval,
        };

        return [...currentWorkingDays, creatingEvent];
      }

      return [...currentWorkingDays];
    }, [workspaceSetting?.schedule?.workingDays, creatingInterval]);

    const onCloseEditing = () => {
      setSelectedInterval(null);
      setCreatingInterval(null);
    };

    return (
      <Fragment>
        <Modal
          opened={opened}
          onClose={close}
          title={<ModalHead name={<Trans>Working days</Trans>} icon={IconCalendar} />}
          size={1200}
        >
          <TimeSlots
            cols={cols}
            events={events}
            onSelect={(value) => {
              setCreatingInterval({
                ...value,
                shift: null,
              });

              setSelectedInterval({
                id: "new",
                start: value.start,
                end: value.end,
                shift: null,
                day: value.columnIndex + 1,
                __typename: "WorkingDayInterval",
              });
            }}
            onEventClick={(event) => {
              const workingDayInterval = workspaceSetting?.schedule?.workingDays.find(
                (interval) => interval.id === event.id
              );

              if (!workingDayInterval) return;

              setSelectedInterval(workingDayInterval);
            }}
            onEventResize={(event) => {
              if (!workspaceSetting || !workspaceSetting.schedule) return;
              updateWorkspaceSetting({
                schedule: {
                  ...workspaceSetting.schedule,
                  workingDays: workspaceSetting.schedule.workingDays.map((workingDay) => {
                    if (workingDay.id !== event.id) return workingDay;
                    return { ...workingDay, start: event.start, end: event.end };
                  }),
                },
              });
            }}
          />
        </Modal>

        <Modal
          title={
            <ModalHead
              name={
                selectedInterval?.id === "new" ? (
                  <Trans>Add new working day</Trans>
                ) : (
                  <Trans>Update working day</Trans>
                )
              }
              icon={IconCalendar}
            />
          }
          opened={!!selectedInterval}
          onClose={onCloseEditing}
          zIndex={zIndexes.commonModals + 10}
          centered
        >
          {selectedInterval && (
            <WorkingDayIntervalCard
              key={selectedInterval.id}
              interval={selectedInterval}
              onDone={(value) => {
                if (!workspaceSetting || !workspaceSetting.schedule) return;

                if (selectedInterval.id.startsWith("new")) {
                  updateWorkspaceSetting({
                    schedule: {
                      ...workspaceSetting.schedule,
                      workingDays: [
                        ...workspaceSetting.schedule.workingDays,
                        {
                          ...value,
                          id: uuid(),
                        },
                      ],
                    },
                  });
                } else {
                  updateWorkspaceSetting({
                    schedule: {
                      ...workspaceSetting.schedule,
                      workingDays: workspaceSetting.schedule.workingDays.map((workingDay) => {
                        if (workingDay.id !== selectedInterval.id) return workingDay;
                        return { ...workingDay, ...value };
                      }),
                    },
                  });
                }

                onCloseEditing();
              }}
              onRemove={() => {
                if (!workspaceSetting || !workspaceSetting.schedule) return;

                if (selectedInterval.id.startsWith("new")) {
                  onCloseEditing();
                  return;
                }

                updateWorkspaceSetting({
                  schedule: {
                    ...workspaceSetting.schedule,
                    workingDays: workspaceSetting.schedule.workingDays.filter(
                      (workingDay) => workingDay.id !== selectedInterval.id
                    ),
                  },
                });

                onCloseEditing();
              }}
              onClose={onCloseEditing}
            />
          )}
        </Modal>
      </Fragment>
    );
  }
);
