"use client";

import { EntityImage } from "@/components/entity-image";
import { Selector, SelectorProps } from "@/components/selector";
import { searchEntity } from "@/modules/search/search-service";
import { AppEntity } from "@/types";
import { useApolloClient } from "@apollo/client/react";
import { ActionIcon, Combobox, Group, Input, Text } from "@mantine/core";
import { IconNews, IconX } from "@tabler/icons-react";
import { FC } from "react";
import { PostFragment } from "../graphql/fragmentPost.graphql";
import GetPostsDocument from "../graphql/getPosts.graphql";

export interface PostSelectorProps extends Omit<
  SelectorProps<PostFragment>,
  "renderOption" | "searchPlaceholder" | "onSearch" | "target"
> {
  onChange?: (post?: PostFragment | null) => void;
}

export const PostSelector: FC<PostSelectorProps> = (props) => {
  const client = useApolloClient();
  return (
    <Selector
      {...props}
      listQuery={GetPostsDocument}
      onSearch={async (q) => {
        const result = await searchEntity(AppEntity.POSTS, q);
        const options = await client.query({
          query: GetPostsDocument,
          variables: {
            limit: 10,
            query: {
              ids: result.map((item) => item.id),
            },
          },
        });
        return options.data?.list.results ?? [];
      }}
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
