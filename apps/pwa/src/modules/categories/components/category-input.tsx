"use client";

import { tl } from "@/modules/lang/lang-service";
import { ActionIcon, Input, InputWrapperProps } from "@mantine/core";
import { type FC } from "react";
import { CategorySelector } from "./category-selector";
import { CategoryEntity, CategoryType } from "../category-types";
import { IconPlus, IconX } from "@tabler/icons-react";
import { QuickCreateCategory } from "./quick-create-category";

interface CategoryInputProps extends Omit<InputWrapperProps, "value" | "onChange"> {
  type?: CategoryType;
  value?: CategoryEntity;
  onChange?: (value?: CategoryEntity | null) => void;
  disabled?: boolean;
}

export const CategoryInput: FC<CategoryInputProps> = (props) => {
  const { value, onChange, disabled, ...rest } = props;

  return (
    <CategorySelector
      {...rest}
      type={props.type || props.value?.type}
      label={tl("category")}
      excludeIds={value ? [value._id] : undefined}
      onSelect={onChange}
      createable={false}
      target={(ctx) => {
        return (
          <Input
            value={value?.name ?? ""}
            flex={1}
            placeholder={tl("select_category")}
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
