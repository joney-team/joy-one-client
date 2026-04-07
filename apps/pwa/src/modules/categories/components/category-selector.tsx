"use client";

import { Button } from "@/components/buttons/button";
import { Selector, SelectorContext, SelectorProps } from "@/components/selector";
import { CategoryType } from "@/graphql/enums.graphql";
import { searchEntity } from "@/modules/search/search-service";
import { AppEntity } from "@/types";
import { useApolloClient, useQuery } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Combobox, Group, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC, ReactNode } from "react";
import { CategoryFragment } from "../graphql/fragmentCategory.graphql";
import GetCategoriesDocument from "../graphql/getCategories.graphql";
import InteractCategoryDocument from "../graphql/interactCategory.graphql";
import { OnModalCategory } from "../modals/modal-category";

interface CategorySelectorProps extends Omit<
  SelectorProps<CategoryFragment>,
  "onSelect" | "onSearch" | "renderOption"
> {
  type?: CategoryType;
  excludeIds?: string[];
  onSelect?: (value?: CategoryFragment) => void;
  render?: (ctx: SelectorContext<CategoryFragment>) => ReactNode;
  createable?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

export const CategorySelector: FC<CategorySelectorProps> = (props) => {
  const client = useApolloClient();
  const { t } = useLingui();

  const { type, excludeIds, onSelect, render, createable = true, onClose, onOpen, ...rest } = props;

  const { data: initOptions } = useQuery(GetCategoriesDocument, {
    variables: {
      limit: 9,
      query: {
        type: props.type,
        sortLastInteractionAt: -1,
      },
    },
  });

  return (
    <Selector
      {...rest}
      onOpen={props.onOpen}
      onClose={props.onClose}
      excludeIds={props.excludeIds}
      pinnedOptions={initOptions?.list.results.map((item) => ({ ...item, _group: t`Recently` }))}
      autoCloseOnChange={false}
      onSearch={async (q) => {
        const result = await searchEntity(AppEntity.CATEGORIES, q, { type });
        return client
          .query({
            query: GetCategoriesDocument,
            variables: {
              query: {
                ids: result.map((i) => i.id),
              },
            },
          })
          .then((res) => res.data?.list.results ?? []);
      }}
      renderOption={(category) => {
        return (
          <Combobox.Option value={category._id} key={category._id}>
            <Group gap={10}>
              <Text>{category.name}</Text>
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
      onSelect={(e) => {
        if (!e) return;
        client
          .mutate({
            mutation: InteractCategoryDocument,
            variables: {
              categoryId: e._id,
            },
          })
          .catch(() => {});
        return props.onSelect?.(e);
      }}
      onCreate={createable ? () => OnModalCategory({ onSuccess: props.onSelect, type }) : undefined}
    />
  );
};
