"use client";

import { EntityImage } from "@/components/entity-image";
import { List } from "@/components/list";
import { dateTimeColumn } from "@/components/list/columns/date-time-column";
import { primaryColumn } from "@/components/list/columns/primary-column";
import { EventType } from "@/graphql/enums.graphql";
import { useRouter } from "@/hooks/use-router";
import { onArchive } from "@/utils/actions";
import { useApolloClient } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import { Stack } from "@mantine/core";
import { IconArchive, IconNews } from "@tabler/icons-react";
import { type FC } from "react";
import { CategoryColumn } from "../categories/components/category-column";
import { WorkspacePermission } from "../workspace-roles/workspace-roles-types";
import BulkArchivePostsDocument from "./graphql/bulkArchivePosts.graphql";
import { PostFragment } from "./graphql/fragmentPost.graphql";
import GetPostsDocument from "./graphql/getPosts.graphql";

export const PostsList: FC = () => {
  const router = useRouter();
  const client = useApolloClient();

  return (
    <Stack p="md">
      <List<PostFragment>
        icon={IconNews}
        id="pst"
        name={<Trans>Posts</Trans>}
        query={GetPostsDocument}
        columns={{
          _id: primaryColumn({
            name: <Trans>Title</Trans>,
            route: "/posts/:_id/edit",
            valuePath: "title",
            defaultWidth: 350,
          }),
          thumbnail: {
            name: <Trans>Thumbnail</Trans>,
            defaultWidth: 230,
            render: ({ value }) => {
              return <EntityImage src={value} w={200} h={100} readonly />;
            },
          },
          categoryId: CategoryColumn(),
          excerpt: { name: <Trans>Excerpt</Trans>, defaultWidth: 200 },
          publishedAt: dateTimeColumn({
            name: <Trans>Published at</Trans>,
            valuePath: "publishedAt",
            defaultWidth: 200,
          }),
        }}
        creatable={{
          permission: WorkspacePermission.POSTS_MANAGER,
          onCreate: () => router.push("/posts/new"),
        }}
        events={[EventType.PostNew, EventType.PostUpdated, EventType.PostArchived]}
        bulkActions={[
          {
            type: "archive",
            label: <Trans>Archive</Trans>,
            icon: IconArchive,
            permission: WorkspacePermission.POSTS_MANAGER,
            handler: async (data) => {
              onArchive({
                process: () =>
                  client.mutate({
                    mutation: BulkArchivePostsDocument,
                    variables: {
                      ids: data.map((v) => v._id),
                    },
                  }),
              });
            },
          },
        ]}
      />
    </Stack>
  );
};
