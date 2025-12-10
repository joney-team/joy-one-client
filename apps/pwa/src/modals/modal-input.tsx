"use client";

import { Button } from "@/components/buttons/button";
import { CurrencyFormat } from "@/components/format/currency-format";
import { DateInput } from "@/components/inputs/date-input";
import { ModalHead } from "@/components/modal/modal-head";
import { Modal } from "@/components/modal/modal";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onError } from "@/utils/exceptions.utils";
import { zIndexes } from "@joy-one-client/config/layout";
import { Currency } from "@joy-one-client/utils/currency";
import { DateTime } from "@joy-one-client/utils/date-time";
import { t } from "@lingui/core/macro";
import {
  Anchor,
  Group,
  InputWrapper,
  NumberInput,
  Portal,
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
import { FC, Fragment, ReactNode, useRef, useState } from "react";

export enum InputModalType {
  TEXT = "Text",
  TEXTAREA = "Textarea",
  NUMBER = "Number",
  MONEY = "Money",
  SELECT = "Select",
  DATE_TIME = "DateTime",
}

export interface InputModalProps {
  type: InputModalType;
  color?: string;
  title?: ReactNode;
  label?: ReactNode;
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

export const ModalInput: FC<{
  children: (open: (props: InputModalProps) => void) => ReactNode;
}> = ({ children }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [props, setProps] = useState<InputModalProps>();
  const workspace = useWorkspace();
  const args = props?.args || {};
  const color = useColor();

  const focusInputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const currency = Currency.get(workspace.settings?.currencyCode ?? "USD");
  const placeholder = props?.placeholder;

  const form = useForm({
    initialValues: {
      value: props?.value,
    },
    validate: {
      value: (value: any) => {
        if (props?.type === InputModalType.NUMBER) {
          if (value < args.min) return t`Min value is ${args.min}`;
          if (value > args.max) return t`Max value is ${args.max}`;
        }

        if (props?.required && !value) return t`Required`;
      },
    },
  });

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
    <Fragment>
      {children((p) => {
        const initialValue =
          p.type === InputModalType.MONEY
            ? Currency.normalize(p.value, workspace.settings.currencyCode)
            : p.value;

        form.setInitialValues({ value: initialValue });
        form.reset();
        setProps(p);
        open();
        setTimeout(() => {
          focusInputRef.current?.focus();
        }, 100);
      })}

      <Portal>
        <Modal
          title={
            <ModalHead
              color={props?.color}
              name={props?.title || t`Enter data`}
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
                            ? DateTime.format(form.values.value * 1000, {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : undefined
                        }
                        onChange={(d) => {
                          if (!d || !d.target.value) return;
                          const [hours, mins] = d.target.value.split(":");
                          if (Number.isNaN(+hours) || Number.isNaN(+mins)) return;
                          const date = DateTime.normalizeDate(form.values.value).setHours(
                            +hours,
                            +mins,
                            0,
                            0
                          );
                          form.setFieldValue("value", DateTime.toSeconds(date));
                        }}
                      />
                    </Group>
                  );
                }

                if (props?.type === InputModalType.MONEY) {
                  return (
                    <InputWrapper label={props?.label}>
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
                                <CurrencyFormat value={args.min} />
                              </Text>
                              <Text fz={12} c="gray" ta="right">
                                <CurrencyFormat value={args.max} />
                              </Text>
                            </Group>
                          </Stack>
                        )}

                        <NumberInput
                          {...form.getInputProps("value")}
                          min={args.min}
                          max={args.max}
                          ref={focusInputRef as any}
                          step={currency?.stepPrice}
                          hideControls
                        />
                      </Stack>
                    </InputWrapper>
                  );
                }

                if (props?.type === InputModalType.SELECT) {
                  return (
                    <Select
                      label={props?.label}
                      placeholder={placeholder}
                      data={props.options?.map((o) => ({ label: o.label, value: o.value })) || []}
                      {...form.getInputProps("value")}
                    />
                  );
                }

                if (props?.type === InputModalType.TEXT) {
                  return (
                    <TextInput
                      label={props?.label}
                      placeholder={placeholder}
                      {...form.getInputProps("value")}
                      ref={focusInputRef as any}
                    />
                  );
                }

                if (props?.type === InputModalType.NUMBER) {
                  return (
                    <NumberInput
                      label={props?.label}
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
                    label={props?.label}
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
                  {props?.doneLabel || t`Complete`}
                </Button>

                {!!props?.onClear && !!form.values.value && (
                  <Anchor onClick={onClear} c="gray" fz={12}>
                    {t`Clear`}
                  </Anchor>
                )}
              </Stack>
            </Stack>
          </form>
        </Modal>
      </Portal>
    </Fragment>
  );
};
