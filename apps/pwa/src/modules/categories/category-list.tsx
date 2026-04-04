"use client";

import { Clickable } from "@/components/clickable";
import { List } from "@/components/list";
import { enumColumn } from "@/components/list/columns/enum-column";
import { CategoryType, EventType } from "@/graphql/enums.graphql";
import { Trans, useLingui } from "@lingui/react/macro";
import { Stack } from "@mantine/core";
import { IconCategory, IconEdit, IconOutlet } from "@tabler/icons-react";
import { type FC } from "react";
import { WorkspacePermission } from "../workspace-roles/workspace-roles-types";
import { categoryTypes } from "./category-constants";
import { OnModalCategory } from "./modals/modal-category";

import { CategoryFragment } from "./graphql/fragmentCategory.graphql";
import GetCategoriesDocument from "./graphql/getCategories.graphql";

export const CategoryList: FC = () => {
  const { t } = useLingui();

  return (
    <Stack p="md">
      <List<CategoryFragment>
        id="categories"
        name={<Trans>Categories</Trans>}
        icon={IconCategory}
        query={GetCategoriesDocument}
        columns={{
          name: {
            name: <Trans>Name</Trans>,
            render: ({ data }) => {
              return (
                <Clickable
                  permission={WorkspacePermission.CATEGORIES_MANAGER}
                  onClick={() => OnModalCategory({ category: data })}
                >
                  {data.name}
                </Clickable>
              );
            },
          },
          slug: { name: <Trans>Slug</Trans>, filter: { text: true }, icon: IconOutlet },
          type: enumColumn({
            name: <Trans>Type</Trans>,
            defaultWidth: 200,
            options: Object.values(CategoryType).map((type) => ({
              value: type,
              label: t(categoryTypes[type].label),
              color: categoryTypes[type].color,
            })),
          }),
        }}
        actions={[
          {
            label: <Trans>Edit</Trans>,
            icon: IconEdit,
            onClick: (data) => {
              OnModalCategory({ category: data });
            },
          },
        ]}
        events={[EventType.CategoryNew, EventType.CategoryUpdated, EventType.CategoryArchived]}
        creatable={{
          onCreate: () => OnModalCategory(),
        }}
      />
    </Stack>
  );
};
