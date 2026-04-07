"use client";

import { Button } from "@/components/buttons/button";
import { TagType } from "@/graphql/enums.graphql";
import { searchEntity } from "@/modules/search/search-service";
import { TagFragment } from "@/modules/tags/graphql/fragmentTag.graphql";
import GetTagsDocument from "@/modules/tags/graphql/getTags.graphql";
import { AppEntity } from "@/types";
import { useApolloClient } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import { Combobox, Group, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC, ReactNode } from "react";
import { Selector, SelectorContext } from "../../../components/selector";

interface TaskTagFolderSelectorProps {
  excludeIds?: string[];
  onSelect: (value?: TagFragment) => void;
  render?: (ctx: SelectorContext<TagFragment>) => ReactNode;
}

export const TaskTagFolderSelector: FC<TaskTagFolderSelectorProps> = (props) => {
  const client = useApolloClient();

  return (
    <Selector<TagFragment>
      excludeIds={props.excludeIds}
      listQuery={GetTagsDocument}
      listParams={{ type: TagType.TaskFolder }}
      onSearch={async (q) => {
        const result = await searchEntity(AppEntity.TAGS, q, { type: TagType.TaskFolder });
        const options = await client.query({
          query: GetTagsDocument,
          variables: {
            ids: result.map((v) => v.id),
          },
        });

        return options.data?.list.results ?? [];
      }}
      renderOption={(tag) => {
        return (
          <Combobox.Option value={tag._id} key={tag._id}>
            <Group gap={10}>
              <Text>{tag.name}</Text>
            </Group>
          </Combobox.Option>
        );
      }}
      target={(ctx) => {
        const { toggle } = ctx;
        if (props.render) return props.render(ctx);

        return (
          <Button
            tt="capitalize"
            size="xs"
            variant="light"
            radius={100}
            leftIcon={IconPlus}
            onClick={toggle}
          >
            <Trans>Select</Trans>
          </Button>
        );
      }}
      onSelect={(e) => {
        if (!e) return;
        if ("id" in e && e.id === "none") return props.onSelect(undefined);
        return props.onSelect(e);
      }}
    />
  );
};
