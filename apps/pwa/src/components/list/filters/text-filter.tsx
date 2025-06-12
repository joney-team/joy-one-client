"use client";

import { t } from "@/modules/lang/lang-service";
import { useColor } from "@/modules/theme/use-color";
import { ActionIcon, Group, Popover, Text, TextInput } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC, useState } from "react";
import { FilterProps } from "./types";

export type TextFilterConfig =
  | boolean
  | {
      placeholder?: string;
    };

export const TextFilter: FC<FilterProps<TextFilterConfig>> = ({
  colKey,
  list,
  Wrapper,
  config,
}) => {
  const [opened, setOpened] = useState(false);
  const value = list.query[colKey] || "";
  const color = useColor();

  const placeholder =
    typeof config === "object" && config.placeholder
      ? config.placeholder
      : "type-content-placeholder";

  return (
    <Popover opened={opened} onClose={() => setOpened(false)} onDismiss={() => setOpened(false)}>
      <Wrapper active={!!value} onClick={() => setOpened((s) => !s)}>
        <Popover.Target>
          <Group>
            {value && (
              <Text c={color("primary")} fz={12} fw={700}>
                {value}
              </Text>
            )}
            {!value && (
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
        </Popover.Target>
      </Wrapper>

      <Popover.Dropdown p={10}>
        <TextInput
          placeholder={t(placeholder)}
          autoFocus
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              const value = (e.target as any).value;
              list.setQuery(colKey, value);
              setOpened(false);
            }
          }}
        />
      </Popover.Dropdown>
    </Popover>
  );
};
