"use client";

import { t } from "@/modules/lang/lang-service";
import { useTags } from "@/modules/tags/tags-context";
import { TagEntity, TagType } from "@/modules/tags/tags-types";
import { capitalize } from "@/utils/string.utils";
import { em, Group, InputWrapperProps, Text, ThemeIcon } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC } from "react";
import { Renderer } from "@/components/renderer";
import { TagSelector } from "./tag-selector";
import { TaskTag } from "@/modules/tasks/components/task-tag";

interface TagsInputProps extends Omit<InputWrapperProps, "value" | "onChange"> {
  type: TagType;
  value?: string[];
  onChange?: (value: string[]) => void;
  disabled?: boolean;
}

export const TagsInput: FC<TagsInputProps> = (props) => {
  const tags = useTags();
  const value = props.value
    ?.map((v) => tags.list.find((t) => t._id === v))
    .filter((v) => !!v) as TagEntity[];

  const toogleSelect = (tag?: TagEntity) => {
    if (!tag || props.disabled) return;
    const tags = value.find((t) => t._id === tag._id)
      ? value.filter((t) => t._id !== tag._id)
      : [...value, tag];
    props.onChange?.(tags.map((t) => t._id));
  };

  return (
    <TagSelector
      {...props}
      excludeIds={value.map((tag) => tag._id)}
      render={(ctx) => {
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
      onSelect={toogleSelect}
    />
  );
};
