"use client";

import { Button } from "@/components/buttons/button";
import { Circle } from "@/components/circle";
import { Selector, SelectorProps } from "@/components/selector";
import { TagType } from "@/graphql/enums.graphql";
import { searchEntity } from "@/modules/search/search-service";
import { AppEntity } from "@/types";
import { useApolloClient } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import { Combobox, Group, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC, Fragment, useRef } from "react";
import { TagFragment } from "../graphql/fragmentTag.graphql";
import GetTagsDocument from "../graphql/getTags.graphql";
import InteractTagDocument from "../graphql/interactTag.graphql";
import { ModalTagForm, ModalTagFormRef } from "../modals/modal-tag-form";

interface TagSelectorProps extends Omit<
  SelectorProps<TagFragment>,
  "renderOption" | "searchPlaceholder" | "onSearch"
> {
  type: TagType;
  createable?: boolean;
}

export const TagSelector: FC<TagSelectorProps> = (props) => {
  const client = useApolloClient();
  const { type, excludeIds, onSelect, target, createable = true, onClose, onOpen, ...rest } = props;
  const modalTagFormRef = useRef<ModalTagFormRef>(null);

  return (
    <Fragment>
      <Selector
        {...rest}
        onOpen={props.onOpen}
        onClose={props.onClose}
        excludeIds={props.excludeIds}
        listQuery={GetTagsDocument}
        listParams={{ type: props.type }}
        autoCloseOnChange={false}
        onSearch={(q) => searchEntity<TagFragment>(AppEntity.TAGS, q, { type: props.type })}
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
          client.mutate({
            mutation: InteractTagDocument,
            variables: {
              tagId: e._id,
            },
          });
          return props.onSelect?.(e, ctx);
        }}
        onCreate={
          createable
            ? (ctx) => {
                modalTagFormRef.current?.open({
                  type: props.type,
                  onCreated: (tag) => props.onSelect?.(tag, ctx),
                });
              }
            : undefined
        }
      />

      <ModalTagForm ref={modalTagFormRef} />
    </Fragment>
  );
};
