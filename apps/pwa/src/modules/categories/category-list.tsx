"use client";

import { Clickable } from "@/components/clickable";
import { List } from "@/components/list";
import { enumColumn } from "@/components/list/columns/enum-column";
import { Trans } from "@lingui/react/macro";
import { Stack } from "@mantine/core";
import { IconCategory, IconEdit, IconOutlet } from "@tabler/icons-react";
import { type FC } from "react";
import { EventType } from "../events/event-types";
import { WorkspacePermission } from "../workspace-roles/workspace-roles-types";
import { categoryTypes } from "./category-constants";
import { CategoryEntity, CategoryType } from "./category-types";
import { OnModalCategory } from "./modals/modal-category";

export const CategoryList: FC = () => {
  return (
    <Stack p={16}>
      <List<CategoryEntity>
        id="categories"
        name={<Trans>Categories</Trans>}
        icon={IconCategory}
        route="/categories"
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
              label: categoryTypes[type].label(),
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
        events={[EventType.CATEGORY_NEW, EventType.CATEGORY_UPDATED, EventType.CATEGORY_ARCHIVED]}
        creatable={{
          onCreate: () => OnModalCategory(),
        }}
      />
    </Stack>
  );
};
