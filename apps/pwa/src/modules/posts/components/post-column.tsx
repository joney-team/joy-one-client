"use client";

import { Clickable } from "@/components/clickable";
import { EntityImage } from "@/components/entity-image";
import { Column } from "@/components/list/types";
import { AppEntity } from "@/types";
import { Group, Stack, Text, Tooltip } from "@mantine/core";
import { IconNews } from "@tabler/icons-react";
import { searchEntity } from "../../search/search-service";
import GetPostsDocument from "../graphql/getPosts.graphql";

export interface PostColumnArgs extends Omit<Column, "render"> {}

export const PostColumn = (args?: PostColumnArgs): Column => {
  return {
    defaultWidth: 180,
    icon: IconNews,
    valuePath: "post",
    name: args?.name || "post",
    render: ({ value }) => {
      if (!value) return "";
      return (
        <Tooltip label={value.title}>
          <Clickable href={`/posts/${value._id}`}>{value.title}</Clickable>
        </Tooltip>
      );
    },
    filter: {
      dynamicSelector: {
        ...args?.filter,
        multiple: true,
        listQuery: GetPostsDocument,
        getSelectedOptions: async (ids, client) => {
          const options = await client.query({
            query: GetPostsDocument,
            variables: { ids },
          });

          return (
            options.data?.list.results.map((v) => ({
              label: v.title,
              value: v._id,
              data: v,
            })) ?? []
          );
        },
        search: async (query, client) => {
          const result = await searchEntity(AppEntity.POSTS, query);

          const options = await client.query({
            query: GetPostsDocument,
            variables: { ids: result.map((v) => v.id) },
            fetchPolicy: "network-only",
          });

          return (
            options.data?.list.results.map((v) => ({
              label: v.title,
              value: v._id,
              data: v,
            })) ?? []
          );
        },
        render: ({ data }) => {
          return (
            <Group gap={8} className="clickable">
              <EntityImage src={data.thumbnail} icon={IconNews} size={40} radius={8} />
              <Stack gap={0}>
                <Text fz={14} fw={500}>
                  {data.title}
                </Text>
              </Stack>
            </Group>
          );
        },
      },
    },
    ...args,
  };
};
