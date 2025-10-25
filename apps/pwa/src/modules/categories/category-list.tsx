"use client";

import { EnumColumn } from "@/components/list/columns/enum-column";
import { List } from "@/components/list/list";
import { Stack, Text } from "@mantine/core";
import { IconCategory, IconEdit, IconOutlet } from "@tabler/icons-react";
import { type FC } from "react";
import { EventType } from "../events/event-types";
import { tl } from "../lang/lang-service";
import { categoryTypeConfigs } from "./category-service";
import { CategoryEntity, CategoryType } from "./category-types";
import { OnModalCategory } from "./modals/modal-category";
import { Clickable } from "@/components/clickable";
import { WorkspacePermission } from "../workspace-roles/workspace-roles-types";

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
                  <Text>{data.name}</Text>
                </Clickable>
              );
            },
          },
          slug: { filter: { text: true }, icon: IconOutlet },
          type: EnumColumn({
            w: 200,
            options: Object.values(CategoryType).map((type) => ({
              label: tl(`category_type_${type}`),
              value: type,
              color: categoryTypeConfigs[type]?.color,
            })),
          }),
        }}
        actions={[
          {
            label: "edit",
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
