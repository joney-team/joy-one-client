"use client";

import { useColor } from "@/modules/theme/use-color";
import { t } from "@lingui/core/macro";
import { ActionIcon, Group, Popover, Text, TextInput } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC, useState } from "react";
import { useListContext } from "../list-context";
import { FilterProps } from "./types";

export type TextFilterConfig =
  | boolean
  | {
      placeholder?: string;
    };

export const TextFilter: FC<FilterProps> = ({ wrapper: Wrapper, column }) => {
  const { list, fixedParams } = useListContext();
  const isReadonly = Boolean(fixedParams?.[column.columnKey]);
  const config = column.filter?.text ?? ({} as Partial<TextFilterConfig>);
  const [opened, setOpened] = useState(false);
  const value = list.params[column.columnKey] || "";
  const color = useColor();

  const placeholder =
    typeof config === "object" && config.placeholder ? config.placeholder : t`Enter content`;

  return (
    <Popover opened={opened} onClose={() => setOpened(false)} onDismiss={() => setOpened(false)}>
      <Popover.Target>
        <Group flex={1}>
          <Wrapper active={!!value} onClick={() => setOpened((s) => !s)}>
            <Group>
              {value && (
                <Text c={color("primary")} fz={12} fw={700}>
                  {value}
                </Text>
              )}
              {!value && !isReadonly && (
                <ActionIcon
                  component="div"
                  variant="subtle"
                  color="var(--mantine-color-dimmed)"
                  size="xs"
                >
                  <IconPlus size={14} />
                </ActionIcon>
              )}
            </Group>
          </Wrapper>
        </Group>
      </Popover.Target>

      <Popover.Dropdown p={10}>
        <TextInput
          placeholder={placeholder}
          autoFocus
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              const value = (e.target as any).value;
              list.setParams({ [column.columnKey]: value });
              setOpened(false);
            }
          }}
        />
      </Popover.Dropdown>
    </Popover>
  );
};
