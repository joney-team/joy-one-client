"use client";

import { tl } from "@/modules/lang/lang-service";
import { ActionIcon, Input, InputWrapper, InputWrapperProps } from "@mantine/core";
import { type FC } from "react";
import { IconX } from "@tabler/icons-react";
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
          <InputWrapper {...rest} label={rest.label || tl("product")}>
            <Input
              value={value?.name ?? ""}
              flex={1}
              placeholder={tl("select_entity", { entity: tl("product") })}
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
