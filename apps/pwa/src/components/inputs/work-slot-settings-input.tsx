"use client";

import { CalendarEvent, useCalendarProps } from "@/configs/calendar.config";
import { configs } from "@/configs/layout.config";
import { useLayout } from "@/layout/layout-context";
import { useAuth } from "@/modules/auth/auth-context";
import { useColor } from "@/modules/theme/use-color";
import { WorkSlot } from "@/types";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans } from "@lingui/react/macro";
import {
  Anchor,
  Card,
  Center,
  Divider,
  em,
  Group,
  Modal,
  RangeSlider,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconClock, IconEdit, IconPlus } from "@tabler/icons-react";
import { FC, Fragment, JSX, useEffect, useRef, useState } from "react";
import { Calendar, Views } from "react-big-calendar";
import { v4 as uuid } from "uuid";
import { Button } from "../buttons/button";
import { FormSession } from "../form-session";
import { DateFormat } from "../format/date-format";
import { ModalHead } from "../modal/modal-head";

interface WorkSlotsSettingsInputProps {
  slots?: WorkSlot[];
  onChange?: (slots: WorkSlot[]) => void;
  disabled?: boolean;
}

export const WorkSlotsSettingsInput: FC<WorkSlotsSettingsInputProps> = (props) => {
  const auth = useAuth();
  const slots = props.slots || [];
  const layout = useLayout();
  const ref = useRef<HTMLDivElement>(null);
  const startOfWeek = DateTime.getRange(new Date(), "week").start;
  const calendarProps = useCalendarProps();

  const [pointedSlot, setPointedSlot] = useState<WorkSlot | null>(null);
  const isPointedSlotNew = pointedSlot?.id === "new";

  const [opened, { open, close }] = useDisclosure(false);
  const color = useColor();

  const [columnSize, setColumnSize] = useState(0);

  const dayWeek = new Array(7).fill(0).map((_, index) => {
    const date = DateTime.add(startOfWeek, "day", index);

    return {
      date,
      name: <DateFormat value={date} type="custom" format={{ weekday: "short" }} />,
    };
  });

  const syncColumnSize = () => {
    if (ref.current) {
      const collumn = ref.current.getElementsByClassName("rbc-day-slot")[0];
      setColumnSize(collumn.clientWidth);
    }
  };

  useEffect(() => {
    syncColumnSize();
  }, [layout.width, auth.user?.settings.isTwelveHour]);

  // Convert slots to calendar events
  const events = dayWeek.reduce((output, val) => {
    const _slots = [...slots].filter((slot) => slot.dayWeek === val.date.getDay());

    if (pointedSlot?.id === "new" && pointedSlot.dayWeek === val.date.getDay()) {
      _slots.push(pointedSlot);
    }

    output.push(
      ..._slots.map((s) => ({
        id: s.id,
        start: DateTime.normalizeDate(new Date(val.date).setHours(s.startHour, s.startMin, 0, 0)),
        end: DateTime.normalizeDate(new Date(val.date).setHours(s.endHour, s.endMin, 0, 0)),
      }))
    );
    return output;
  }, [] as CalendarEvent[]);

  return (
    <Stack gap={0} w="100%" ref={ref}>
      <Group justify="end" gap={0} wrap="nowrap" w="100%">
        {dayWeek.map((day, index) => {
          return (
            <Card
              key={index}
              shadow="none"
              radius={0}
              px={5}
              py={0}
              pb={5}
              style={{
                width: `${columnSize}px`,
                boxSizing: "border-box",
                display: "flex",
              }}
            >
              <Text w="100%" fz={12} ta="right" fw={500} tt="capitalize">
                {day.name}
              </Text>
            </Card>
          );
        })}
      </Group>

      <Calendar
        {...calendarProps}
        className="hide-header"
        date={events[0]?.start || new Date()}
        view={Views.WEEK}
        selectable={!props.disabled}
        toolbar={false}
        events={events}
        onSelectSlot={(s) => {
          const slot: WorkSlot = {
            id: "new",
            dayWeek: s.start.getDay(),
            startHour: s.start.getHours(),
            startMin: s.start.getMinutes(),
            endHour: s.end.getHours(),
            endMin: s.end.getMinutes(),
          };
          setPointedSlot(slot);
          open();
        }}
        onSelectEvent={(e) => {
          const slot = slots.find((v) => v.id === e.id);
          if (!slot) return;
          setPointedSlot(slot);
          open();
        }}
        eventPropGetter={(e) => {
          const slot = slots.find((v) => v.id === e.id);
          if (slot) {
            return {
              style: {
                backgroundColor: color(configs.workslotGroupColors[+(slot.groupId || "0")]),
                borderColor: color(configs.workslotGroupColors[+(slot.groupId || "0")] + ".8"),
                borderWidth: "1.5px",
                borderRadius: "3px",
              },
            };
          }

          return {
            style: {
              backgroundColor: color("gray"),
            },
          };
        }}
      />

      <Modal
        opened={opened}
        onClose={() => {
          close();
          setPointedSlot(null);
        }}
        title={<ModalHead name={<Trans>Work schedule</Trans>} icon={IconClock} />}
        zIndex={300}
        yOffset={100}
        size="lg"
      >
        {pointedSlot && (
          <Stack mt={16}>
            <FormSession
              title={<Trans>Time frame</Trans>}
              description={
                <Trans>Working time frame, activities are performed in these time frames</Trans>
              }
            >
              <Stack gap={0}>
                <Group>
                  <Text fw={600}>
                    {pointedSlot.startHour.toString().padStart(2, "0")}:
                    {pointedSlot.startMin.toString().padStart(2, "0")} -{" "}
                    {pointedSlot.endHour.toString().padStart(2, "0")}:
                    {pointedSlot.endMin.toString().padStart(2, "0")}
                  </Text>
                </Group>

                <Group p={16}>
                  <RangeSlider
                    w="100%"
                    min={0}
                    max={1440} // 24 hours * 60 minutes
                    step={30}
                    minRange={30}
                    label={null}
                    value={slotToMinutes(pointedSlot)}
                    onChange={(value) => {
                      const newSlot = minutesToSlot(value, pointedSlot);
                      setPointedSlot(newSlot);
                    }}
                    marks={[
                      { value: 0, label: "00:00" },
                      { value: 360, label: "06:00" },
                      { value: 720, label: "12:00" },
                      { value: 1080, label: "18:00" },
                      { value: 1440, label: "24:00" },
                    ]}
                    styles={{
                      markLabel: {
                        fontSize: 12,
                        fontWeight: 600,
                      },
                    }}
                  />
                </Group>
              </Stack>
            </FormSession>

            <Divider opacity={0.5} my={10} />

            <FormSession
              title={<Trans>Working shift</Trans>}
              description={<Trans>Applied to staff working in shifts</Trans>}
            >
              <Group>
                {new Array(3).fill(0).map((_, index) => {
                  const groupId = index.toString();
                  const isActive = (pointedSlot.groupId || "0") === groupId;
                  const onSelect = () => setPointedSlot({ ...pointedSlot, groupId });

                  return (
                    <Button
                      key={index}
                      color={configs.workslotGroupColors[index]}
                      variant={isActive ? "filled" : "outline"}
                      onClick={onSelect}
                    >
                      {<Trans>Shift</Trans>} {index + 1}
                    </Button>
                  );
                })}
              </Group>
            </FormSession>

            <Divider opacity={0.5} my={10} />

            <Center mt={16}>
              <Button
                leftIcon={isPointedSlotNew ? IconPlus : IconEdit}
                onClick={() => {
                  if (isPointedSlotNew) {
                    props.onChange?.([
                      ...slots,
                      {
                        ...pointedSlot,
                        id: uuid(),
                      },
                    ]);
                  } else {
                    props.onChange?.([
                      ...slots.map((slot) => (slot.id === pointedSlot.id ? pointedSlot : slot)),
                    ]);
                  }

                  setPointedSlot(null);
                  close();
                }}
                label={isPointedSlotNew ? <Trans>Add</Trans> : <Trans>Save</Trans>}
              />
            </Center>

            <Anchor
              variant="outline"
              c="gray"
              ta="center"
              fz={em(12)}
              fw={400}
              onClick={() => {
                if (!isPointedSlotNew) {
                  props.onChange?.([...slots.filter((slot) => slot.id !== pointedSlot.id)]);
                }

                setPointedSlot(null);
                close();
              }}
            >
              <Trans>Remove</Trans>
            </Anchor>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
};

export function SlotTime(
  slot: Pick<WorkSlot, "dayWeek" | "startHour" | "startMin" | "endHour" | "endMin">
): JSX.Element {
  const start = DateTime.normalizeDate(
    new Date(new Date().setDate(slot.dayWeek)).setHours(slot.startHour, slot.startMin, 0, 0)
  );

  const end = DateTime.normalizeDate(
    new Date(new Date().setDate(slot.dayWeek)).setHours(slot.endHour, slot.endMin, 0, 0)
  );

  return (
    <Fragment>
      <DateFormat value={start} type="time" />
      {" - "}
      <DateFormat value={end} type="time" />
    </Fragment>
  );
}

// Convert WorkSlot to slider minutes
const slotToMinutes = (slot: WorkSlot): [number, number] => {
  const startMinutes = slot.startHour * 60 + slot.startMin;
  const endMinutes = slot.endHour * 60 + slot.endMin;
  return [startMinutes, endMinutes];
};

// Convert slider minutes to WorkSlot
const minutesToSlot = (minutes: [number, number], originalSlot: WorkSlot): WorkSlot => {
  const startHour = Math.floor(minutes[0] / 60);
  const startMin = minutes[0] % 60;
  const endHour = Math.floor(minutes[1] / 60);
  const endMin = minutes[1] % 60;

  return {
    ...originalSlot,
    startHour,
    startMin,
    endHour,
    endMin,
  };
};
