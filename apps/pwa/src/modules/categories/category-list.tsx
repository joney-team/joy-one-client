"use client";

import { Clickable } from "@/components/clickable";
import { List } from "@/components/list";
import { enumColumn } from "@/components/list/columns/enum-column";
import { t } from "@lingui/core/macro";
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
        name="categories"
        icon={IconCategory}
        route="/categories"
        columns={{
          name: {
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
          slug: { filter: { text: true }, icon: IconOutlet },
          type: enumColumn({
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
            label: t`Edit`,
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
