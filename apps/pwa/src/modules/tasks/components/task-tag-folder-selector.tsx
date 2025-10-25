"use client";

import { Button } from "@/components/buttons/button";
import { searchEntity } from "@/modules/search/search-service";
import { TagEntity, TagType } from "@/modules/tags/tags-types";
import { AppEntity } from "@/types";
import { Trans } from "@lingui/react/macro";
import { Combobox, em, Group, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC, ReactNode } from "react";
import { Selector, SelectorContext } from "../../../components/selector";

interface TaskTagFolderSelectorProps {
  excludeIds?: string[];
  onSelect: (value?: TagEntity) => void;
  render?: (ctx: SelectorContext<TagEntity>) => ReactNode;
}

export const TaskTagFolderSelector: FC<TaskTagFolderSelectorProps> = (props) => {
  return (
    <Selector<TagEntity>
      excludeIds={props.excludeIds}
      listRoute="/tags"
      listParams={{ type: TagType.TASK_FOLDER }}
      onSearch={(q) => searchEntity<TagEntity>(AppEntity.TAGS, q, { type: TagType.TASK_FOLDER })}
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
            fz={em(14)}
            fw={500}
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
