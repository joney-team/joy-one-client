"use client";

import { ActionIcon, Checkbox, Combobox, ComboboxDropdownProps } from "@mantine/core";

import { Renderer } from "@/components/renderer";
import { Group, Text } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";
import { FilterProps } from "./types";
import { getId, Selector } from "@/components/selector";

export interface DynamicSelectorFilterOption {
  label: string;
  value: string;
  data: any;
}

export interface DynamicSelectorFilterConfig {
  multiple?: boolean;
  dropdownProps?: ComboboxDropdownProps;
  getOptions: (ids: string[]) => Promise<DynamicSelectorFilterOption[]>;
  getInitialOptions?: () => Promise<DynamicSelectorFilterOption[]>;
  initOptions?: DynamicSelectorFilterOption[];
  search: (query: string) => Promise<DynamicSelectorFilterOption[]>;
  render?: FC<{ data: any; isSelected: boolean }>;
}

export const DynamicSelectorFilter: FC<FilterProps<DynamicSelectorFilterConfig>> = ({
  colKey,
  columns,
  list,
  Wrapper,
  config,
}) => {
  const [options, setOptions] = useState<DynamicSelectorFilterOption[]>([]);
  const querySelectedOptions = list.query[colKey] ? `${list.query[colKey]}`.split(",") : [];

  // Get initial options
  useEffect(() => {
    if (config.getInitialOptions) {
      config
        .getInitialOptions()
        .then((v) =>
          setOptions((s) => [...s.filter((sv) => !v.find((v2) => v2.value === sv.value)), ...v])
        )
        .catch(console.error);
    } else {
      setOptions(config.initOptions || []);
    }
  }, [config.getInitialOptions]);

  // Get missing options
  useEffect(() => {
    const missingIds = querySelectedOptions.filter((v) => !options.find((v2) => v2.value === v));
    if (missingIds.length > 0) {
      config
        .getOptions(missingIds)
        .then((v) =>
          setOptions((s) => [...s.filter((sv) => !v.find((v2) => v2.value === sv.value)), ...v])
        )
        .catch(console.error);
    }
  }, [list.query[colKey]]);

  const { multiple, render: Render, dropdownProps } = config;
  const selectedOptions = options.filter((v) => querySelectedOptions.includes(v.value));

  return (
    <Selector
      key={colKey}
      autoCloseOnChange={!multiple}
      initOptions={options.map((v) => ({
        id: v.value,
        label: v.label,
        value: v.value,
        data: v.data,
      }))}
      target={(ctx) => {
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
        const selectedOptions = options.filter((v) => querySelectedOptions.includes(v.value));

        return (
          <Combobox.Option value={getId(item)} key={getId(item)} fz={14}>
            <Group gap={8}>
              {multiple && (
                <Checkbox
                  checked={selectedOptions.some((v) => v.value === item.value)}
                  onChange={() => {}}
                  radius={5}
                  size="xs"
                />
              )}

              {Render ? (
                <Render
                  data={item.data}
                  isSelected={selectedOptions.some((v) => v.value === item.value)}
                />
              ) : (
                <Text fz={14}>{item.label}</Text>
              )}
            </Group>
          </Combobox.Option>
        );
      }}
      onSearch={async (q) => {
        const value = await columns[colKey]?.filter?.dynamicSelector?.search?.(q);
        return (value || []).map((v) => ({
          id: v.value,
          label: v.label,
          value: v.value,
          data: v.data,
        }));
      }}
      onSelect={(value) => {
        const isSelected = querySelectedOptions.some((v) => v === value?.value);

        // Add option if not included
        const isIncluded = options.some((v) => v.value === value?.value);
        if (!isIncluded && value) {
          setOptions((s) => [
            ...s,
            {
              label: value.label,
              value: value.value,
              data: value.data,
            },
          ]);
        }

        // Update query
        if (multiple) {
          const _querySelectedOptions = isSelected
            ? querySelectedOptions.filter((v) => v !== value?.value)
            : [...querySelectedOptions, value?.value];
          if (_querySelectedOptions.length === 0) {
            list.removeQuery(colKey);
          } else {
            list.setQuery(colKey, _querySelectedOptions);
          }
        } else {
          list.setQuery(colKey, value?.value);
        }
      }}
      dropdownProps={dropdownProps}
    />
  );
};
