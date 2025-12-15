"use client";

import { Button } from "@/components/buttons/button";
import { Circle } from "@/components/circle";
import { Selector, SelectorProps } from "@/components/selector";
import { searchEntity } from "@/modules/search/search-service";
// import { OnModalTagForm } from "@/modules/tags/modals/modal-tag-form";
import { interactTag } from "@/modules/tags/tags-service";
import { TagEntity, TagType } from "@/modules/tags/tags-types";
import { AppEntity } from "@/types";
import { Trans } from "@lingui/react/macro";
import { Combobox, em, Group, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC } from "react";

interface TagSelectorProps
  extends Omit<SelectorProps<TagEntity>, "renderOption" | "searchPlaceholder" | "onSearch"> {
  type: TagType;
  createable?: boolean;
}

export const TagSelector: FC<TagSelectorProps> = (props) => {
  const { type, excludeIds, onSelect, target, createable = true, onClose, onOpen, ...rest } = props;

  return (
    <Selector
      {...rest}
      onOpen={props.onOpen}
      onClose={props.onClose}
      excludeIds={props.excludeIds}
      listRoute="/tags"
      listParams={{ type: props.type }}
      autoCloseOnChange={false}
      onSearch={(q) => searchEntity<TagEntity>(AppEntity.TAGS, q, { type: props.type })}
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
        if (props.target) return props.target(ctx);

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
      onSelect={(e, ctx) => {
        if (!e) return;
        interactTag(e._id);
        return props.onSelect?.(e, ctx);
      }}
      onCreate={
        createable
          ? (ctx) => {
              // TODO:
              // OnModalTagForm({
              //   type: props.type,
              //   onDone: (tag) => props.onSelect?.(tag, ctx),
              // });
            }
          : undefined
      }
    />
  );
};
