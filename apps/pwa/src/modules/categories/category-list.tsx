"use client";

import { EnumColumn } from "@/components/list/columns/enum-column";
import { List } from "@/components/list/list";
import { Stack } from "@mantine/core";
import { IconCategory, IconEdit, IconOutlet } from "@tabler/icons-react";
import { type FC } from "react";
import { EventType } from "../events/event-types";
import { t } from "../lang/lang-service";
import { categoryTypeConfigs } from "./category-service";
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
          name: {},
          slug: { filter: { text: true }, icon: IconOutlet },
          type: EnumColumn({
            options: Object.values(CategoryType).map((type) => ({
              label: t(`category_type_${type}`),
              value: type,
              color: categoryTypeConfigs[type].color,
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
