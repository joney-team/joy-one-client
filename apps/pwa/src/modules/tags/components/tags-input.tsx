"use client";

import { Renderer } from "@/components/renderer";
import { t } from "@/modules/lang/lang-service";
import { TagEntity, TagType } from "@/modules/tags/tags-types";
import { TaskTag } from "@/modules/tasks/components/task-tag";
import { capitalize } from "@/utils/string.utils";
import { em, Group, InputWrapperProps, Text, ThemeIcon } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC } from "react";
import { TagSelector } from "./tag-selector";

interface TagsInputProps extends Omit<InputWrapperProps, "value" | "onChange"> {
  type: TagType;
  value?: TagEntity[];
  onChange?: (value: TagEntity[]) => void;
  disabled?: boolean;
}

export const TagsInput: FC<TagsInputProps> = (props) => {
  const { type, value: rawValue, onChange, disabled, ...rest } = props;
  const value = rawValue || [];

  const toogleSelect = (tag?: TagEntity) => {
    if (!tag || disabled) return;
    const tags = value.find((t) => t._id === tag._id)
      ? value.filter((t) => t._id !== tag._id)
      : [...value, tag];
    onChange?.(tags);
  };

  return (
    <TagSelector
      {...rest}
      type={type}
      excludeIds={value.map((tag) => tag._id)}
      target={(ctx) => {
        return (
          <Group
            flex={1}
            w="100%"
            align="center"
            style={{ cursor: "pointer" }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              ctx.toggle();
            }}
          >
            <Renderer visible={value.length === 0}>
              <Group gap={0} px={5}>
                <ThemeIcon color="gray" variant="transparent">
                  <IconPlus size={16} strokeWidth={1.5} />
                </ThemeIcon>

                <Text c="gray" fz={em(13)}>
                  {capitalize(`${t("add")} ${t("tags")}`)}
                </Text>
              </Group>
            </Renderer>

            <Renderer visible={value.length > 0}>
              <Group px={5} gap={5}>
                {value.map((tag) => (
                  <TaskTag key={tag._id} id={tag._id} onRemove={() => toogleSelect(tag)} />
                ))}
              </Group>
            </Renderer>
          </Group>
        );
      }}
      onSelect={(value) => {
        toogleSelect(value);
      }}
    />
  );
};
