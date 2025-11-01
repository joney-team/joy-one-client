"use client";

import { EntityImage } from "@/components/entity-image";
import { List } from "@/components/list";
import { dateTimeColumn } from "@/components/list/columns/date-time-column";
import { primaryColumn } from "@/components/list/columns/primary-column";
import { useRouter } from "@/hooks/use-router";
import { Stack } from "@mantine/core";
import { IconArchive, IconNews } from "@tabler/icons-react";
import { type FC } from "react";
import { CategoryColumn } from "../categories/components/category-column";
import { EventType } from "../events/event-types";
import { WorkspacePermission } from "../workspace-roles/workspace-roles-types";
import { PostEntity } from "./posts-types";
import { api } from "../apis";
import { onArchive } from "@/utils/actions";
import { t } from "@lingui/core/macro";

export const PostsList: FC = () => {
  const router = useRouter();

  return (
    <Stack p={16}>
      <List<PostEntity>
        icon={IconNews}
        id="pst"
        route="/posts"
        columns={{
          _id: primaryColumn({ name: t`Title`, route: "/posts/:_id/edit", valuePath: "title" }),
          thumbnail: {
            name: t`Thumbnail`,
            render: ({ value }) => {
              return <EntityImage src={value} w={200} h={100} onlyRead />;
            },
          },
          categoryId: CategoryColumn(),
          excerpt: { name: t`Excerpt` },
          publishedAt: dateTimeColumn({ name: t`Published at`, valuePath: "publishedAt" }),
        }}
        creatable={{
          permission: WorkspacePermission.POSTS_MANAGER,
          onCreate: () => router.push("/posts/new"),
        }}
        events={[EventType.POST_NEW, EventType.POST_UPDATED, EventType.POST_ARCHIVED]}
        bulkActions={[
          {
            type: "archive",
            label: t`Archive`,
            icon: IconArchive,
            permission: WorkspacePermission.POSTS_MANAGER,
            handler: async (data) => {
              onArchive({
                process: () => api.delete("/posts/bulk", { ids: data.map((v) => v._id) }),
              });
            },
          },
        ]}
      />
    </Stack>
  );
};
