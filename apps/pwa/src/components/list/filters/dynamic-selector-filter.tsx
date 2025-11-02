"use client";

import { ActionIcon, Checkbox, Combobox, ComboboxDropdownProps } from "@mantine/core";

import { Renderer } from "@/components/renderer";
import { getId, Selector } from "@/components/selector";
import { Group, Text } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";
import { FilterProps } from "./types";

export interface DynamicSelectorFilterOption {
  label: string;
  value: string;
  data: any;
}

export interface DynamicSelectorFilterConfig {
  multiple?: boolean;
  dropdownProps?: ComboboxDropdownProps;
  listRoute?: string;
  listParams?: Record<string, any>;
  getOptions: (ids: string[]) => Promise<DynamicSelectorFilterOption[]>;
  pinnedOptions?: DynamicSelectorFilterOption[];
  search: (query: string) => Promise<DynamicSelectorFilterOption[]>;
  render?: FC<{ data: any; isSelected: boolean }>;
}

export const DynamicSelectorFilter: FC<FilterProps<DynamicSelectorFilterConfig>> = ({
  column,
  list,
  Wrapper,
  config,
  isReadonly,
}) => {
  const [options, setOptions] = useState<DynamicSelectorFilterOption[]>(config.pinnedOptions ?? []);
  const querySelectedOptions = list.params[column.columnKey]
    ? `${list.params[column.columnKey]}`.split(",")
    : [];

  // Get missing options
  useEffect(() => {
    const missingIds = querySelectedOptions.filter((v) => !options.find((v2) => v2.value === v));
    if (missingIds.length > 0) {
      config
        .getOptions(missingIds)
        .then((options) => {
          setOptions((prevOptions) => [
            ...prevOptions.filter(
              (prevOption) => !options.find((option) => option.value === prevOption.value)
            ),
            ...options,
          ]);
        })
        .catch(() => false);
    }
  }, [list.params[column.columnKey]]);

  const { multiple, render: Render, dropdownProps } = config;
  const selectedOptions = options.filter((v) => querySelectedOptions.includes(v.value));

  return (
    <Selector
      key={column.columnKey}
      listRoute={config.listRoute}
      listParams={config.listParams}
      autoCloseOnChange={!multiple}
      pinnedOptions={options.map((v) => ({ id: v.value, ...v }))}
      target={(ctx) => {
        return (
          <Wrapper
            onClick={ctx.toggle}
            quantity={multiple ? selectedOptions.length : undefined}
            active={selectedOptions.length > 0}
          >
            <Group gap={5}>
              <Renderer visible={!multiple && selectedOptions.length > 0}>
                <Group gap={5} pl={5}>
                  <Text fw={700} fz={12}>
                    {selectedOptions.map((v) => v.label).join(", ")}
                  </Text>
                </Group>
              </Renderer>

              {!isReadonly && (
                <ActionIcon
                  component="div"
                  variant="subtle"
                  color="gray.5"
                  size="compact-xs"
                  onClick={ctx.toggle}
                >
                  <IconChevronDown size={16} />
                </ActionIcon>
              )}
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
        const value = await column?.filter?.dynamicSelector?.search?.(q);
        return (value || []).map((v) => ({
          id: v.value,
          ...v,
        }));
      }}
      onSelect={(option) => {
        const isSelected = querySelectedOptions.some((v) => v === option?.value);

        // Add option if not included
        const isIncluded = options.some((v) => v.value === option?.value);
        if (!isIncluded && option) {
          setOptions((s) => [...s, option]);
        }

        // Update query
        if (multiple) {
          const _querySelectedOptions = isSelected
            ? querySelectedOptions.filter((v) => v !== option?.value)
            : [...querySelectedOptions, option?.value];
          if (_querySelectedOptions.length === 0) {
            list.removeParams([column.columnKey]);
          } else {
            list.setParams({ [column.columnKey]: _querySelectedOptions });
          }
        } else {
          list.setParams({ [column.columnKey]: option?.value });
        }
      }}
      dropdownProps={dropdownProps}
    />
  );
};
