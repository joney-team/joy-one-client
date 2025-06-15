"use client";

import { AppEntity } from "@/types";
import { Button } from "@/components/buttons/button";
import { OnModalTagForm } from "@/modules/tags/modals/modal-tag-form";
import { t } from "@/modules/lang/lang-service";
import { searchEntity } from "@/modules/search/search-service";
import { getTags, interactTag } from "@/modules/tags/tags-service";
import { TagEntity, TagType } from "@/modules/tags/tags-types";
import { em, Group, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC, type ReactNode } from "react";
import { Selector, SelectorContext } from "@/components/selector";
import { Circle } from "@/components/circle";

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

  const onInitOptions = async () => {
    return getTags({ limit: 9, sort: "lastInteractionAtDesc", type: props.type }).then((res) =>
      res.data.map((tag) => ({ ...tag, _group: t("recently") }))
    );
  };

  return (
    <Selector
      {...rest}
      onOpen={props.onOpen}
      onClose={props.onClose}
      excludeIds={props.excludeIds}
      onInitOptions={onInitOptions}
      autoCloseOnChange={false}
      onSearch={(q) => searchEntity<TagEntity>(AppEntity.TAGS, q, { type: props.type })}
      searchPlaceholder={`${t("search_with", {
        query: ["name"].map((v) => t(v).toLowerCase()).join(", "),
      })}`}
      renderOptionChild={(tag) => {
        return (
          <Group gap={10}>
            <Circle color={tag.color || "gray"} size={12} />
            <Text>{tag.name}</Text>
          </Group>
        );
      }}
      renderTarget={(ctx) => {
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
