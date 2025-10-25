"use client";

import { EntityImage } from "@/components/entity-image";
import { Selector, SelectorProps } from "@/components/selector";
import { searchEntity } from "@/modules/search/search-service";
import { AppEntity } from "@/types";
import { ActionIcon, Combobox, Group, Input, Text } from "@mantine/core";
import { IconNews, IconX } from "@tabler/icons-react";
import { FC } from "react";
import { PostEntity } from "../posts-types";

export interface PostSelectorProps
  extends Omit<
    SelectorProps<PostEntity>,
    "renderOption" | "searchPlaceholder" | "onSearch" | "target"
  > {
  onChange?: (post?: PostEntity | null) => void;
}

export const PostSelector: FC<PostSelectorProps> = (props) => {
  return (
    <Selector
      {...props}
      listRoute="/posts"
      onSearch={(q) => searchEntity<PostEntity>(AppEntity.POSTS, q)}
      renderOption={(post) => {
        return (
          <Combobox.Option value={post._id} key={post._id}>
            <Group gap={10}>
              <EntityImage src={post.thumbnail} icon={IconNews} size={40} radius={8} />
              <Text>{post.title}</Text>
            </Group>
          </Combobox.Option>
        );
      }}
      onSelect={(post, ctx) => {
        props.onSelect?.(post, ctx);
        props.onChange?.(post);
        return post;
      }}
      target={(ctx) => {
        return (
          <Input
            w="100%"
            readOnly
            value={props.value?.title || ""}
            onClick={ctx.toggle}
            rightSectionPointerEvents="all"
            rightSection={
              props.value ? (
                <ActionIcon onClick={() => props.onChange?.(null)} color="gray" variant="subtle">
                  <IconX size={14} />
                </ActionIcon>
              ) : null
            }
          />
        );
      }}
    />
  );
};
