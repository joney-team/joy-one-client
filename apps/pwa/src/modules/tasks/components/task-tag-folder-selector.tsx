"use client";

import { AppEntity } from "@/types";
import { Button } from "@/components/buttons/button";
import { t } from "@/modules/lang/lang-service";
import { searchEntity } from "@/modules/search/search-service";
import { getTags } from "@/modules/tags/tags-service";
import { TagEntity, TagType } from "@/modules/tags/tags-types";
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
  const onInitOptions = async () => {
    const folders = await getTags({
      limit: 5,
      sortLastInteractionAt: -1,
      type: TagType.TASK_FOLDER,
    }).then((res) => res.data.map((tag) => ({ ...tag, _group: t("recently") })));

    return [
      ...folders,
      {
        id: "none",
        name: `${t("general_tasks")}`,
      } as any,
    ];
  };

  return (
    <Selector
      excludeIds={props.excludeIds}
      onInitOptions={onInitOptions}
      onSearch={(q) => searchEntity<TagEntity>(AppEntity.TAGS, q, { type: TagType.TASK_FOLDER })}
      searchPlaceholder={`${t("search_with", {
        query: ["name"].map((v) => t(v).toLowerCase()).join(", "),
      })}`}
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
            {t("select")}
          </Button>
        );
      }}
      onSelect={(e) => {
        if (!e) return;
        if (e.id === "none") return props.onSelect(undefined);
        return props.onSelect(e);
      }}
    />
  );
};
