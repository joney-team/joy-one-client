"use client";

import { t } from "@lingui/core/macro";
import { ActionIcon, Input, InputWrapper, InputWrapperProps } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { type FC } from "react";
import { ProductEntity } from "../products-types";
import { ProductSelector } from "./product-selector";

export type ProductValue = Pick<ProductEntity, "_id" | "name" | "price" | "unit" | "image">;

interface ProductInputProps extends Omit<InputWrapperProps, "value" | "onChange"> {
  value?: ProductValue | null;
  onChange?: (value: ProductValue | null) => void;
  disabled?: boolean;
}

export const ProductInput: FC<ProductInputProps> = (props) => {
  const { value, onChange, disabled, ...rest } = props;

  return (
    <ProductSelector
      onSelect={(value) => onChange?.(value)}
      target={(ctx) => {
        return (
          <InputWrapper {...rest} label={rest.label || t`Product`}>
            <Input
              value={value?.name ?? ""}
              flex={1}
              placeholder={t`Select product`}
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
          </InputWrapper>
        );
      }}
    />
  );
};
