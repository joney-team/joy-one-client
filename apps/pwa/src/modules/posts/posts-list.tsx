"use client";

import { EntityImage } from "@/components/entity-image";
import { List } from "@/components/list";
import { DateTimeColumn } from "@/components/list/columns/date-time-column";
import { useRouter } from "@/hooks/use-router";
import { Stack } from "@mantine/core";
import { IconNews } from "@tabler/icons-react";
import { type FC } from "react";
import { EventType } from "../events/event-types";
import { WorkspacePermission } from "../workspace-roles/workspace-roles-types";
import { PostEntity } from "./posts-types";
import { PrimaryColumn } from "@/components/list/columns/primary-column";

export const PostsList: FC = () => {
  const router = useRouter();

  return (
    <Stack p={16}>
      <List<PostEntity>
        icon={IconNews}
        id="pst"
        route="/posts"
        columns={{
          _id: PrimaryColumn({ name: "title", route: "/posts/:_id", valuePath: "title" }),
          thumbnail: {
            name: "post_thumbnail",
            render: ({ value }) => {
              return <EntityImage src={value} w={200} h={100} onlyRead />;
            },
          },
          excerpt: {},
          publishedAt: DateTimeColumn({ name: "publishedAt" }),
        }}
        creatable={{
          permission: WorkspacePermission.POSTS_MANAGER,
          onCreate: () => router.push("/posts/new"),
        }}
        events={[EventType.POST_NEW, EventType.POST_UPDATED, EventType.POST_ARCHIVED]}
      />
    </Stack>
  );
};
