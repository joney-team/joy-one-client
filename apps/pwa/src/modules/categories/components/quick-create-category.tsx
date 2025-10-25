"use client";

import { api } from "@/modules/apis";
import { onActionLoad } from "@/utils/actions";
import { t } from "@lingui/core/macro";
import { ActionIcon, Group, Popover, TextInput } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC, PropsWithChildren, useState } from "react";
import { CategoryEntity, CategoryType } from "../category-types";

interface QuickCreateCategoryProps {
  type?: CategoryType;
  onCreated?: (category: CategoryEntity) => void;
}

export const QuickCreateCategory: FC<PropsWithChildren<QuickCreateCategoryProps>> = (props) => {
  const [opened, setOpened] = useState(false);

  const children = props.children ? (
    <Group onClick={() => setOpened((s) => !s)}>{props.children}</Group>
  ) : (
    <ActionIcon onClick={() => setOpened((s) => !s)}>
      <IconPlus size={16} strokeWidth={1.5} />
    </ActionIcon>
  );

  const label = t`Create ${t`Category`}`;

  return (
    <Popover shadow="md" opened={opened} onChange={setOpened}>
      <Popover.Target>{children}</Popover.Target>

      <Popover.Dropdown p={10}>
        <TextInput
          label={label}
          placeholder={t`Enter ${t`Category`.toLowerCase()} name`}
          autoFocus
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              const value = (e.target as any).value;
              onActionLoad({
                name: t`Create ${t`Category`}`,
                process: async () => {
                  const category = await api.post<CategoryEntity>("/categories", {
                    name: value,
                    type: props.type,
                  });
                  props.onCreated?.(category);
                },
              });
              setOpened(false);
            }
          }}
        />
      </Popover.Dropdown>
    </Popover>
  );
};
