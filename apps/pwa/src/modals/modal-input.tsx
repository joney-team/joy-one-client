"use client";

import { useApp } from "@/app.context";
import { Button } from "@/components/buttons/button";
import { DateInput } from "@/components/inputs/date-input";
import { ModalTitle } from "@/components/modal-title";
import { currencies } from "@/configs/currency.config";
import { getDateFormat, num, tl } from "@/modules/lang/lang-service";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { DateTime } from "@/utils/date-time.utils";
import { onError } from "@/utils/exceptions.utils";
import { zIndexes } from "@joy-one-client/config/layout";
import {
  Anchor,
  Group,
  InputWrapper,
  Modal,
  NumberInput,
  Select,
  Slider,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { Icon, IconCalendar, IconCheck, IconClock, IconCursorText } from "@tabler/icons-react";
import dayjs from "dayjs";
import { FC, useRef, useState } from "react";

export enum InputModalType {
  TEXT = "Text",
  TEXTAREA = "Textarea",
  NUMBER = "Number",
  MONEY = "Money",
  SELECT = "Select",
  DATE_TIME = "DateTime",
}

export let OnModalInput: (props: InputModalProps) => any = () => {};

export interface InputModalProps {
  type: InputModalType;
  color?: string;
  title?: string;
  label?: string;
  placeholder?: string;
  value?: any;
  onDone?: (value: any) => void | Promise<void>;
  doneLabel?: string;
  icon?: Icon;
  args?: any;
  onClear?: () => void;
  options?: {
    label: string;
    value: any;
  }[];
  required?: boolean;
}

export const ModalInput: FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [props, setProps] = useState<InputModalProps>();
  const workspace = useWorkspace();
  const args = props?.args || {};
  const color = useColor();

  const focusInputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const currency = currencies.find((c) => c.code === workspace.settings.currencyCode);
  const placeholder = tl(props?.placeholder || props?.label || "");

  const form = useForm({
    initialValues: {
      value: props?.value,
    },
    validate: {
      value: (value: any) => {
        if (props?.type === InputModalType.NUMBER) {
          if (value < args.min) return tl("min_value", { min: args.min });
          if (value > args.max) return tl("max_value", { max: args.max });
        }

        if (props?.required && !value) return tl("required");
      },
    },
  });

  OnModalInput = (p) => {
    form.setInitialValues({ value: p.value });
    form.reset();
    setProps(p);
    open();
    setTimeout(() => {
      focusInputRef.current?.focus();
    }, 100);
  };

  const onSubmit = form.onSubmit(async (values) => {
    try {
      await props?.onDone?.(values.value);
      close();
    } catch (error) {
      onError(error);
    }
  });

  const onClear = () => {
    if (props?.onClear) {
      props.onClear();
    } else {
      form.setInitialValues({ value: null });
      form.reset();
    }
    close();
  };

  return (
    <Modal
      title={
        <ModalTitle
          color={props?.color}
          title={tl(props?.title || "enter_data")}
          icon={props?.icon || IconCursorText}
        />
      }
      onClose={close}
      opened={opened}
      yOffset={16}
      zIndex={zIndexes.commonModals + 10}
    >
      <form onSubmit={onSubmit}>
        <Stack gap={16}>
          {(function () {
            if (props?.type === InputModalType.DATE_TIME) {
              return (
                <Group wrap="nowrap" w="100%">
                  <DateInput
                    leftSection={<IconCalendar size={18} strokeWidth={1.5} />}
                    flex={1}
                    value={form.values.value}
                    onChange={(d) => {
                      if (!d) return;
                      form.setFieldValue("value", d);
                    }}
                  />

                  <TimeInput
                    leftSection={<IconClock size={18} strokeWidth={1.5} />}
                    w={100}
                    defaultValue={
                      form.values.value
                        ? dayjs(form.values.value * 1000).format("HH:mm")
                        : undefined
                    }
                    onChange={(d) => {
                      if (!d || !d.target.value) return;
                      const [hours, mins] = d.target.value.split(":");
                      if (Number.isNaN(+hours) || Number.isNaN(+mins)) return;
                      const date = dayjs(form.values.value * 1000)
                        .hour(+hours)
                        .minute(+mins);
                      form.setFieldValue("value", DateTime.timeToSeconds(date.toDate()));
                    }}
                  />
                </Group>
              );
            }

            if (props?.type === InputModalType.MONEY) {
              return (
                <InputWrapper label={tl(props?.label || "")}>
                  <Stack>
                    {args.min && args.max && (
                      <Stack gap={0}>
                        <Group w="100%" px={0}>
                          <Slider
                            w="100%"
                            label={null}
                            min={args.min}
                            max={args.max}
                            {...form.getInputProps("value")}
                            step={currency?.stepPrice}
                          />
                        </Group>

                        <Group justify="space-between">
                          <Text fz={12} c="gray" ta="left">
                            {num(args.min, { type: "money" })}
                          </Text>
                          <Text fz={12} c="gray" ta="right">
                            {num(args.max, { type: "money" })}
                          </Text>
                        </Group>
                      </Stack>
                    )}

                    <NumberInput
                      {...form.getInputProps("value")}
                      min={args.min}
                      max={args.max}
                      ref={focusInputRef as any}
                      hideControls
                    />
                  </Stack>
                </InputWrapper>
              );
            }

            if (props?.type === InputModalType.SELECT) {
              return (
                <Select
                  label={tl(props?.label || "")}
                  placeholder={placeholder}
                  data={props.options?.map((o) => ({ label: o.label, value: o.value })) || []}
                  {...form.getInputProps("value")}
                />
              );
            }

            if (props?.type === InputModalType.TEXT) {
              return (
                <TextInput
                  label={tl(props?.label || "")}
                  placeholder={placeholder}
                  {...form.getInputProps("value")}
                  ref={focusInputRef as any}
                />
              );
            }

            if (props?.type === InputModalType.NUMBER) {
              return (
                <NumberInput
                  label={tl(props?.label || "")}
                  placeholder={placeholder}
                  {...form.getInputProps("value")}
                  hideControls
                  ref={focusInputRef as any}
                />
              );
            }

            return (
              <Textarea
                ref={focusInputRef as any}
                label={tl(props?.label || "")}
                placeholder={placeholder}
                {...form.getInputProps("value")}
                styles={{
                  input: {
                    minHeight: 150,
                  },
                }}
              />
            );
          })()}

          <Stack align="center">
            <Button type="submit" leftIcon={IconCheck} action color={color(props?.color)}>
              {tl(props?.doneLabel || "complete")}
            </Button>

            {!!props?.onClear && !!form.values.value && (
              <Anchor onClick={onClear} c="gray" fz={12}>
                {tl("clear")}
              </Anchor>
            )}
          </Stack>
        </Stack>
      </form>
    </Modal>
  );
};
