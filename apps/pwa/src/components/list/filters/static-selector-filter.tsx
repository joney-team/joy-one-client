"use client";

import { ActionIcon, Checkbox, Combobox, ComboboxDropdownProps } from "@mantine/core";

import { Renderer } from "@/components/renderer";
import { Group, Text } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { FC, ReactNode } from "react";
import { FilterProps } from "./types";
import { getId, Selector } from "@/components/selector/selector";

export interface StaticSelectorFilterConfig {
  multiple?: boolean;
  dropdownProps?: ComboboxDropdownProps;
  options: {
    label: string;
    value: string;
    render?: () => ReactNode;
  }[];
}

export const StaticSelectorFilter: FC<FilterProps<StaticSelectorFilterConfig>> = ({
  colKey,
  list,
  Wrapper,
  config,
}) => {
  const { multiple, options, dropdownProps } = config;
  const value = list.query[colKey] ? `${list.query[colKey]}`.split(",") : [];
  const selectedOptions = options.filter((v) => value.includes(v.value));

  return (
    <Selector
      key={colKey}
      autoCloseOnChange={!multiple}
      initOptions={config.options.map((v) => ({
        id: v.value,
        label: v.label,
        value: v.value,
      }))}
      renderTarget={(ctx) => {
        return (
          <Wrapper
            onClick={ctx.toggle}
            quantity={multiple ? selectedOptions.length : undefined}
            active={selectedOptions.length > 0}
          >
            <Group gap={5}>
              <Renderer visible={!multiple && selectedOptions.length > 0}>
                <Group gap={5} pl={8}>
                  <Text fw={700} fz={12}>
                    {selectedOptions.map((v) => v.label).join(", ")}
                  </Text>
                </Group>
              </Renderer>

              <ActionIcon
                component="div"
                variant="subtle"
                color="gray.5"
                size="compact-xs"
                onClick={ctx.toggle}
              >
                <IconChevronDown size={16} />
              </ActionIcon>
            </Group>
          </Wrapper>
        );
      }}
      renderOption={(item) => {
        const itemId = getId(item);
        const option = options.find((v) => v.value === item.value);
        if (!option) return null;

        return (
          <Combobox.Option value={itemId} key={itemId} fz={14}>
            <Group gap={8}>
              {multiple && (
                <Checkbox
                  checked={selectedOptions.some((v) => v.value === item.value)}
                  onChange={() => {}}
                  radius={5}
                  size="xs"
                />
              )}

              {option?.render ? <option.render /> : <Text fz={14}>{item.label}</Text>}
            </Group>
          </Combobox.Option>
        );
      }}
      onSelect={(value) => {
        if (multiple) {
          const isSelected = selectedOptions.some((v) => v.value === value?.value);

          let _value = isSelected
            ? selectedOptions.filter((v) => v.value !== value?.value)
            : [...selectedOptions, value];

          if (_value.length === 0) {
            list.removeQuery(colKey);
          } else {
            list.setQuery(
              colKey,
              _value.map((v) => v?.value)
            );
          }
        } else {
          list.setQuery(colKey, value?.value);
        }
      }}
      dropdownProps={dropdownProps}
    />
  );
};
