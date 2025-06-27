"use client";

import { AppEntity, ResponseList } from "@/types";
import { Button } from "@/components/buttons/button";
import { OnModalTagForm } from "@/modules/tags/modals/modal-tag-form";
import { t } from "@/modules/lang/lang-service";
import { searchEntity } from "@/modules/search/search-service";
import { getTags, interactTag } from "@/modules/tags/tags-service";
import { TagEntity, TagType } from "@/modules/tags/tags-types";
import { Combobox, em, Group, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC, type ReactNode } from "react";
import { Selector, SelectorContext } from "@/components/selector";
import { Circle } from "@/components/circle";
import { useQuery } from "@/modules/apis/use-query";

interface TagSelectorProps {
  type: TagType;
  excludeIds?: string[];
  onSelect: (value?: TagEntity) => void;
  render?: (ctx: SelectorContext<TagEntity>) => ReactNode;
  createable?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

export const TagSelector: FC<TagSelectorProps> = (props) => {
  const { type, excludeIds, onSelect, render, createable = true, onClose, onOpen, ...rest } = props;

  const initOptions = useQuery<ResponseList<TagEntity>>({
    route: "/tags",
    params: {
      limit: 9,
      sort: "lastInteractionAtDesc",
      type: props.type,
    },
  });

  return (
    <Selector
      {...rest}
      onOpen={props.onOpen}
      onClose={props.onClose}
      excludeIds={props.excludeIds}
      initOptions={initOptions.data?.data?.map((tag) => ({ ...tag, _group: t("recently") }))}
      autoCloseOnChange={false}
      onSearch={(q) => searchEntity<TagEntity>(AppEntity.TAGS, q, { type: props.type })}
      searchPlaceholder={`${t("search_with", {
        query: ["name"].map((v) => t(v).toLowerCase()).join(", "),
      })}`}
      renderOption={(tag) => {
        return (
          <Combobox.Option value={tag._id} key={tag._id}>
            <Group gap={10}>
              <Circle color={tag.color || "gray"} size={12} />
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
        interactTag(e._id);
        return props.onSelect(e);
      }}
      onCreate={
        createable
          ? () =>
              OnModalTagForm({
                type: props.type,
                onDone: (tag) => props.onSelect(tag),
              })
          : undefined
      }
    />
  );
};
