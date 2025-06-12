"use client";

import { t } from "@/modules/lang/lang-service";
import {
  createProductCategory,
  useCategories,
} from "@/modules/product-categories/product-category-service";
import { ProductType } from "@/modules/products/products-types";
import { onActionLoad } from "@/utils/actions";
import {
  ActionIcon,
  Group,
  InputWrapper,
  InputWrapperProps,
  Popover,
  Select,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCheck, IconList, IconPlus } from "@tabler/icons-react";
import { FC, useState } from "react";

interface ProductCategoryInputProps extends Omit<InputWrapperProps, "value" | "onChange"> {
  value?: string | null;
  onChange?: (categoryId?: string | null) => void;
  disabled?: boolean;
  iconSize?: number | string;
  type: ProductType;
}

export const ProductCategoryInput: FC<ProductCategoryInputProps> = (props) => {
  const [categories, fetch] = useCategories();
  const [opened, { close, open }] = useDisclosure(false);

  const [newCategoryName, setNewCategoryName] = useState("");

  let _props = { ...props } as any;

  delete _props.value;
  delete _props.onChange;
  delete _props.iconSize;

  const onChange = (value?: string | null) => {
    if (props.disabled) return;
    return props.onChange?.(value);
  };

  const onCreateCategory = async () => {
    if (!newCategoryName) return;
    await onActionLoad({
      name: "Tạo danh mục",
      icon: IconList,
      process: () => createProductCategory({ name: newCategoryName, productType: props.type }),
      onFinished: async (category) => {
        await fetch();
        onChange(category._id);
        close();
      },
    });
  };

  return (
    <InputWrapper {..._props}>
      <Group gap={5}>
        <Select
          searchable
          clearable
          value={props.value}
          data={categories
            .filter((v) => !props.type || v.productType === props.type)
            .map((v) => ({ label: v.name, value: v._id }))}
          onChange={(value) => onChange(value)}
          flex={1}
        />

        <Popover
          opened={opened}
          onChange={(e) => {
            if (e) open();
            else close();
          }}
        >
          <Popover.Target>
            <ActionIcon variant="outline" color="gray.4" size={36} onClick={open}>
              <IconPlus size={18} />
            </ActionIcon>
          </Popover.Target>

          <Popover.Dropdown p={5}>
            <Group gap={5} align="end" px={5} pb={5}>
              <TextInput
                label={`${t("create_new")} ${t("category")}`}
                placeholder={t("name")}
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.currentTarget.value)}
              />
              <ActionIcon size={36} onClick={onCreateCategory}>
                <IconCheck />
              </ActionIcon>
            </Group>
          </Popover.Dropdown>
        </Popover>
      </Group>
    </InputWrapper>
  );
};
