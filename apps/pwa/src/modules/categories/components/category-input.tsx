"use client";

import { t } from "@/modules/lang/lang-service";
import { ActionIcon, Input, InputWrapperProps } from "@mantine/core";
import { type FC } from "react";
import { CategorySelector } from "./category-selector";
import { CategoryEntity, CategoryType } from "../category-types";
import { IconX } from "@tabler/icons-react";

interface CategoryInputProps extends Omit<InputWrapperProps, "value" | "onChange"> {
  type: CategoryType;
  value?: CategoryEntity;
  onChange?: (value?: CategoryEntity | null) => void;
  disabled?: boolean;
}

export const CategoryInput: FC<CategoryInputProps> = (props) => {
  const { value, onChange, disabled, ...rest } = props;

  return (
    <CategorySelector
      {...rest}
      label={t("category")}
      excludeIds={value ? [value._id] : undefined}
      onSelect={onChange}
      target={(ctx) => {
        return (
          <Input
            value={value?.name ?? ""}
            flex={1}
            placeholder={t("select_category")}
            readOnly
            onClick={ctx.toggle}
            rightSectionPointerEvents="all"
            rightSection={
              value && (
                <ActionIcon onClick={() => onChange?.(null)} color="gray" variant="subtle">
                  <IconX size={14} />
                </ActionIcon>
              )
            }
          />
        );
      }}
    />
  );
};
