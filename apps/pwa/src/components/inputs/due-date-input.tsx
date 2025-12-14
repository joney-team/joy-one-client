"use client";

import { configs } from "@/configs/layout.config";
import { useLang } from "@/modules/lang/lang-context";
import { useColorScheme } from "@/modules/theme/use-color-scheme";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  Divider,
  em,
  Group,
  InputWrapper,
  InputWrapperProps,
  Stack,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { DatePicker, TimeInput } from "@mantine/dates";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconCalendar, IconClock, IconX } from "@tabler/icons-react";
import { FC, ReactNode, useRef, useState } from "react";
import { Button } from "../buttons/button";

interface DueDateInputProps extends Omit<InputWrapperProps, "value" | "onChange"> {
  startDate?: number | null;
  dueDate?: number | null;
  onChange?: (value: { startDate?: number | null; dueDate?: number | null }) => any;
}

export const DueDateInput: FC<DueDateInputProps> = (props) => {
  const theme = useMantineTheme();
  const timeinputRef = useRef<HTMLInputElement>(null);
  const colorScheme = useColorScheme();
  const lang = useLang();

  const [pointed, setPointed] = useState<"start" | "due">("due");
  const pointedValue =
    pointed === "start" && props.startDate
      ? DateTime.normalizeDate(props.startDate)
      : props.dueDate
      ? DateTime.normalizeDate(props.dueDate)
      : null;

  const startDate = props.startDate ? DateTime.normalizeDate(props.startDate) : null;
  const dueDate = props.dueDate ? DateTime.normalizeDate(props.dueDate) : null;

  let _props = { ...props } as any;
  delete _props.onChange;
  delete _props.value;
  delete _props.startDate;
  delete _props.dueDate;

  const onChangePointedValue = (date: Date | number, applyPrevTime = true) => {
    let temp = new Date(date);

    if (pointedValue && applyPrevTime) {
      temp.setHours(pointedValue.getHours());
      temp.setMinutes(pointedValue.getMinutes());
    }

    if (pointed === "start") {
      props.onChange?.({
        startDate: DateTime.toSeconds(temp),
        dueDate: props.dueDate,
      });
    } else {
      props.onChange?.({
        startDate: props.startDate,
        dueDate: DateTime.toSeconds(temp),
      });
    }
  };

  const getTimeInputValue = () => {
    if (!pointedValue) return "";
    return `${pointedValue.getHours().toString().padStart(2, "0")}:${pointedValue
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const onSyncTimeInput = () => {
    if (!timeinputRef.current) return;
    timeinputRef.current.value = getTimeInputValue();
  };

  const onChangeTimeInput = useDebouncedCallback(async (val: string | null) => {
    if (val === null || val.length === 0 || !pointedValue) return;
    const _date = new Date(pointedValue);
    const hours = val.split(":")[0];
    const minutes = val.split(":")[1];
    if (typeof hours === "undefined" || typeof minutes === "undefined") return;
    _date.setHours(+hours);
    _date.setMinutes(+minutes);
    onChangePointedValue(_date, false);
  }, 1000);

  return (
    <InputWrapper {..._props}>
      <Stack gap={0}>
        <Group miw={400} pb={12}>
          <Group align="end" gap={5}>
            <TextInput
              flex={1}
              label={<Trans>Start date</Trans>}
              readOnly
              leftSection={<IconCalendar strokeWidth={1.3} />}
              value={
                startDate
                  ? DateTime.format(startDate, { dateStyle: "short", locale: lang.locale })
                  : ""
              }
              styles={{
                input: {
                  borderColor: pointed === "start" ? theme.colors.primary[6] : undefined,
                  cursor: "pointer",
                },
                label: {
                  fontSize: 11,
                },
              }}
              placeholder={DateTime.getDateFormatString(lang.locale)}
              onClick={() => {
                setPointed("start");
                onSyncTimeInput();
              }}
              rightSection={
                !!startDate && (
                  <ActionIcon size="sm" variant="subtle" color="gray">
                    <IconX
                      size={16}
                      onClick={() => {
                        props.onChange?.({
                          dueDate: props.dueDate,
                          startDate: undefined,
                        });
                      }}
                    />
                  </ActionIcon>
                )
              }
              onChange={() => {}}
            />
          </Group>

          <Group align="end" gap={5}>
            <TextInput
              flex={1}
              label={<Trans>Due date</Trans>}
              readOnly
              leftSection={<IconCalendar strokeWidth={1.3} />}
              value={
                dueDate ? DateTime.format(dueDate, { dateStyle: "short", locale: lang.locale }) : ""
              }
              placeholder={DateTime.getDateFormatString(lang.locale)}
              styles={{
                input: {
                  borderColor: pointed === "due" ? theme.colors.primary[6] : undefined,
                  cursor: "pointer",
                },
                label: {
                  fontSize: 11,
                },
              }}
              onClick={() => {
                setPointed("due");
                onSyncTimeInput();
              }}
              rightSection={
                !!dueDate && (
                  <ActionIcon size="sm" variant="subtle" color="gray">
                    <IconX
                      size={16}
                      onClick={() => {
                        props.onChange?.({
                          startDate: props.startDate,
                          dueDate: undefined,
                        });
                      }}
                    />
                  </ActionIcon>
                )
              }
              onChange={() => {}}
            />
          </Group>
        </Group>

        <Divider mx={-10} />

        <Group align="start">
          <Stack
            flex={1}
            gap="xs"
            py={10}
            bg="var(--mantine-color-default-hover)"
            mb={-10}
            ml={-10}
            mr={-16}
            px={5}
          >
            <Suggestion
              label={<Trans>Today</Trans>}
              value={DateTime.format(DateTime.getRange(new Date(), "day").end, {
                weekday: "long",
                locale: lang.locale,
              })}
              onSelect={() => {
                onChangePointedValue(DateTime.getRange(new Date(), "day").end);
              }}
            />

            <Suggestion
              label={<Trans>Tomorrow</Trans>}
              value={DateTime.format(
                DateTime.getRange(new Date(Date.now() + 1000 * 60 * 60 * 24), "day").end,
                {
                  dateStyle: "short",
                  locale: lang.locale,
                }
              )}
              onSelect={() => {
                onChangePointedValue(
                  DateTime.getRange(Date.now() + 1000 * 60 * 60 * 24, "day").end
                );
              }}
            />

            <Suggestion
              label={<Trans>This weekend</Trans>}
              value={DateTime.format(DateTime.getRange(Date.now(), "week").end, {
                dateStyle: "short",
                locale: lang.locale,
              })}
              onSelect={() => {
                onChangePointedValue(DateTime.getRange(Date.now(), "week").end);
              }}
            />

            <Suggestion
              label={<Trans>Next weekend</Trans>}
              value={DateTime.format(
                DateTime.getRange(Date.now() + 1000 * 60 * 60 * 24 * 7, "week").end,
                {
                  dateStyle: "short",
                  locale: lang.locale,
                }
              )}
              onSelect={() => {
                onChangePointedValue(
                  DateTime.getRange(Date.now() + 1000 * 60 * 60 * 24 * 7, "week").end
                );
              }}
            />

            <Suggestion
              label={
                <Trans>
                  Range week <span>{2}</span>
                </Trans>
              }
              value={DateTime.format(
                DateTime.getRange(Date.now() + 1000 * 60 * 60 * 24 * 7 * 2, "week").end,
                {
                  dateStyle: "short",
                  locale: lang.locale,
                }
              )}
              onSelect={() => {
                onChangePointedValue(
                  DateTime.getRange(Date.now() + 1000 * 60 * 60 * 24 * 7 * 2, "week").end
                );
              }}
            />

            <Suggestion
              label={
                <Trans>
                  Range week <span>{4}</span>
                </Trans>
              }
              value={DateTime.format(
                DateTime.getRange(Date.now() + 1000 * 60 * 60 * 24 * 7 * 4, "week").end,
                {
                  dateStyle: "short",
                  locale: lang.locale,
                }
              )}
              onSelect={() => {
                onChangePointedValue(
                  DateTime.getRange(Date.now() + 1000 * 60 * 60 * 24 * 7 * 4, "week").end
                );
              }}
            />

            <Suggestion
              label={
                <Trans>
                  Range week <span>{8}</span>
                </Trans>
              }
              value={DateTime.format(
                DateTime.getRange(Date.now() + 1000 * 60 * 60 * 24 * 7 * 8, "week").end,
                {
                  dateStyle: "short",
                  locale: lang.locale,
                }
              )}
              onSelect={() => {
                onChangePointedValue(
                  DateTime.getRange(Date.now() + 1000 * 60 * 60 * 24 * 7 * 8, "week").end
                );
              }}
            />
          </Stack>

          <Divider orientation="vertical" mb={-10} />

          <Stack mt={10} gap={5}>
            <DatePicker
              value={pointedValue}
              getDayProps={(_date) => {
                return {
                  selected: !!pointedValue && DateTime.isSame(_date, pointedValue, "day"),
                  onClick: () => {
                    onChangePointedValue(new Date(_date));
                  },
                };
              }}
            />

            <TimeInput
              ref={timeinputRef}
              defaultValue={getTimeInputValue()}
              leftSection={<IconClock color={theme.colors.dark[6]} strokeWidth={1.5} size={18} />}
              onChange={(e) => {
                if (!pointedValue) return;
                onChangeTimeInput(e.target.value);
              }}
            />
          </Stack>
        </Group>
      </Stack>
    </InputWrapper>
  );
};

const Suggestion: FC<{ label: ReactNode; value: string; onSelect: () => any }> = (props) => {
  return (
    <Button
      variant="subtle"
      color="gray"
      w="100%"
      styles={{
        root: {
          paddingLeft: 8,
          paddingRight: 8,
        },
        inner: {
          display: "flex",
          width: "100%",
          padding: 0,
        },
        label: {
          display: "flex",
          justifyContent: "space-between",
          flex: 1,
          padding: 0,
        },
      }}
      onClick={props.onSelect}
    >
      <Group flex={1} w="100%" justify="space-between">
        <Text tt="capitalize" ta="left" c="dark" fz={em(15)}>
          {props.label}
        </Text>
        <Text tt="capitalize" ta="right" c="gray" fz={em(13)}>
          {props.value}
        </Text>
      </Group>
    </Button>
  );
};
