"use client";

import { ActionIcon, Checkbox, Combobox, ComboboxDropdownProps, Radio } from "@mantine/core";

import { Renderer } from "@/components/renderer";
import { Selector } from "@/components/selector";
import { Group, Text } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { FC, ReactNode } from "react";
import { useListContext } from "../list-context";
import { FilterProps } from "./types";

export interface StaticSelectorFilterConfig {
  multiple?: boolean;
  dropdownProps?: ComboboxDropdownProps;
  getOptionId?: (data: any) => string;
  options: {
    label: string;
    value: string;
    render?: () => ReactNode;
  }[];
}

export const StaticSelectorFilter: FC<FilterProps> = ({ column, wrapper: Wrapper }) => {
  const { list, fixedParams } = useListContext();
  const isReadonly = Boolean(fixedParams?.[column.columnKey]);
  const config = column.filter?.staticSelector ?? ({} as Partial<StaticSelectorFilterConfig>);
  const { multiple, options, dropdownProps } = config;
  const value = list.params[column.columnKey] ? `${list.params[column.columnKey]}`.split(",") : [];
  const selectedOptions = options?.filter((v) => value.includes(v.value)) ?? [];

  return (
    <Selector
      flex={1}
      key={column.columnKey}
      autoCloseOnChange={false}
      getOptionId={config.getOptionId}
      pinnedOptions={config.options?.map((v) => ({
        id: v.value,
        label: v.label,
        value: v.value,
      }))}
      target={(ctx) => {
        return (
          <Wrapper
            onClick={ctx.toggle}
            quantity={multiple ? selectedOptions.length : undefined}
            active={selectedOptions.length > 0}
            selectedContent={selectedOptions
              .map((v) => v.label)
              .join(", ")
              .trim()}
          >
            <Group gap={5} flex={1}>
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
      renderOption={(item, key) => {
        const option = options?.find((v) => v.value === item.value);
        if (!option) return null;

        const isSelected = selectedOptions.some((v) => v.value === item.value);

        return (
          <Combobox.Option value={item.value} key={key} fz={14}>
            <Group gap={8} wrap="nowrap">
              {multiple ? (
                <Checkbox checked={isSelected} radius={5} size="xs" />
              ) : (
                <Radio.Indicator checked={isSelected} radius={20} size="xs" />
              )}

              {option?.render ? <option.render /> : <Text fz={14}>{item.label}</Text>}
            </Group>
          </Combobox.Option>
        );
      }}
      onSelect={(value) => {
        if (multiple) {
          const isSelected = selectedOptions.some((v) => v.value === value?.value);

          const selectedValues = isSelected
            ? selectedOptions.filter((v) => v.value !== value?.value)
            : [...selectedOptions, value];

          if (selectedValues.length === 0) {
            list.removeParams([column.columnKey]);
          } else {
            list.setParams({ [column.columnKey]: selectedValues.map((v) => v?.value) });
          }
        } else {
          list.setParams({ [column.columnKey]: value?.value });
        }
      }}
      dropdownProps={dropdownProps}
    />
  );
};
