"use client";

import { Button } from "@/components/buttons/button";
import { Form } from "@/components/form";
import { CurrencyFormat } from "@/components/format/currency-format";
import { DateInput } from "@/components/inputs/date-input";
import { Modal } from "@/components/modal/modal";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspaceSetting } from "@/modules/workspace-settings/hooks/use-workspace-setting";
import { onError } from "@/utils/exceptions.utils";
import { zIndexes } from "@joy-one-client/config/layout";
import { Currency } from "@joy-one-client/utils/currency";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans, useLingui } from "@lingui/react/macro";
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
import { Icon, IconCalendar, IconCheck, IconClock, IconCursorText } from "@tabler/icons-react";
import { FC, forwardRef, Fragment, ReactNode, useImperativeHandle, useRef, useState } from "react";

export enum InputModalType {
  TEXT = "Text",
  TEXTAREA = "Textarea",
  NUMBER = "Number",
  MONEY = "Money",
  SELECT = "Select",
  DATE_TIME = "DateTime",
}

export interface InputModalState {
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

export interface ModalInputProps {
  children?: (open: (state: InputModalState) => void) => ReactNode;
}

export interface ModalInputRef {
  open: (state: InputModalState) => void;
}

const InputForm: FC<InputModalState & { onClose: () => void }> = (state) => {
  const { t } = useLingui();
  const color = useColor();
  const args = state.args || {};
  const { workspaceSetting } = useWorkspaceSetting();

  const focusInputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const currencyCode = workspaceSetting?.currencyCode ?? undefined;
  const currency = Currency.get(currencyCode);
  const placeholder = state?.placeholder;

  const form = useForm({
    initialValues: {
      value:
        state.type === InputModalType.MONEY
          ? Currency.normalize(state.value, currencyCode)
          : state.value,
    },
    validate: {
      value: (value: any) => {
        if (state?.type === InputModalType.NUMBER) {
          if (value < args.min) return t`Min value is ${args.min}`;
          if (value > args.max) return t`Max value is ${args.max}`;
        }

        if (state?.required && !value) return t`Required`;
      },
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    try {
      await state?.onDone?.(values.value);
      state.onClose();
    } catch (error) {
      onError(error);
    }
  });

  const onClear = () => {
    if (state?.onClear) {
      state.onClear();
    } else {
      form.setInitialValues({ value: null });
      form.reset();
    }
    state.onClose();
  };

  return (
    <Form onSubmit={onSubmit}>
      <Stack gap="md">
        {(function () {
          if (state?.type === InputModalType.DATE_TIME) {
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
                      0,
                    );
                    form.setFieldValue("value", DateTime.toSeconds(date));
                  }}
                />
              </Group>
            );
          }

          if (state.type === InputModalType.MONEY) {
            return (
              <InputWrapper label={state.label}>
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

          if (state.type === InputModalType.SELECT) {
            return (
              <Select
                label={state.label}
                placeholder={placeholder}
                data={state.options?.map((o) => ({ label: o.label, value: o.value })) || []}
                {...form.getInputProps("value")}
              />
            );
          }

          if (state.type === InputModalType.TEXT) {
            return (
              <TextInput
                label={state.label}
                placeholder={placeholder}
                {...form.getInputProps("value")}
                ref={focusInputRef as any}
              />
            );
          }

          if (state.type === InputModalType.NUMBER) {
            return (
              <NumberInput
                label={state.label}
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
              label={state.label}
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
          <Button
            type="submit"
            leftIcon={IconCheck}
            color={color(state.color)}
            label={state.doneLabel || <Trans>Complete</Trans>}
          />

          {!!state.onClear && !!form.values.value && (
            <Anchor onClick={onClear} c="gray" fz={12}>
              <Trans>Clear</Trans>
            </Anchor>
          )}
        </Stack>
      </Stack>
    </Form>
  );
};

export const ModalInput = forwardRef<ModalInputRef, ModalInputProps>(({ children }, ref) => {
  const [state, setState] = useState<InputModalState>();

  useImperativeHandle(ref, () => ({
    open: (state) => setState(state),
  }));

  return (
    <Fragment>
      {children?.((s) => setState(s))}

      <Portal>
        <Modal
          icon={state?.icon || IconCursorText}
          name={state?.title || <Trans>Enter data</Trans>}
          color={state?.color}
          onClose={() => setState(undefined)}
          opened={!!state}
          yOffset={16}
          zIndex={zIndexes.commonModals + 10}
        >
          {state && <InputForm {...state} onClose={() => setState(undefined)} />}
        </Modal>
      </Portal>
    </Fragment>
  );
});
