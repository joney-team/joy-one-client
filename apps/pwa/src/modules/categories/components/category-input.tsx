"use client";

import { t } from "@lingui/core/macro";
import { ActionIcon, Input, InputWrapperProps } from "@mantine/core";
import { IconPlus, IconX } from "@tabler/icons-react";
import { type FC } from "react";
import { CategoryFragment } from "../graphql/fragmentCategory.graphql";
import { CategorySelector } from "./category-selector";
import { QuickCreateCategory } from "./quick-create-category";
import { CategoryType } from "@/graphql/enums.graphql";

interface CategoryInputProps extends Omit<InputWrapperProps, "value" | "onChange"> {
  type?: CategoryType;
  value?: CategoryFragment;
  onChange?: (value?: CategoryFragment | null) => void;
  disabled?: boolean;
}

export const CategoryInput: FC<CategoryInputProps> = (props) => {
  const { value, onChange, disabled, ...rest } = props;

  return (
    <CategorySelector
      {...rest}
      type={props.type || props.value?.type}
      label={t`Category`}
      excludeIds={value ? [value._id] : undefined}
      onSelect={onChange}
      createable={false}
      target={(ctx) => {
        return (
          <Input
            value={value?.name ?? ""}
            flex={1}
            placeholder={t`Select category`}
            readOnly
            onClick={ctx.toggle}
            rightSectionPointerEvents="all"
            rightSection={
              value ? (
                <ActionIcon onClick={() => onChange?.(null)} color="gray" variant="subtle">
                  <IconX size={14} />
                </ActionIcon>
              ) : (
                <QuickCreateCategory type={props.type} onCreated={onChange}>
                  <ActionIcon onClick={() => onChange?.(null)} color="gray" variant="subtle">
                    <IconPlus size={14} />
                  </ActionIcon>
                </QuickCreateCategory>
              )
            }
          />
        );
      }}
    />
  );
};
