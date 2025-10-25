"use client";

import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { ProductStockEntity } from "@/modules/product-stocks/product-stocks-entity";
import {
  productStockOut,
  productStockRecordTypeOptions,
} from "@/modules/product-stocks/product-stocks-service";
import {
  ProductStockOutDto,
  ProductStockRecordType,
} from "@/modules/product-stocks/product-stocks-types";
import { ProductSelector } from "@/modules/products/components/product-selector";
import { ProductEntity, ProductType } from "@/modules/products/products-types";
import { useColor } from "@/modules/theme/use-color";
import { onError } from "@/utils/exceptions.utils";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Input, InputWrapper, Modal, NumberInput, Stack, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { FC, useRef } from "react";

interface ModalProductStockOutProps {
  stock?: ProductStockEntity;
}

export let OnModalProductStockOut: (props?: ModalProductStockOutProps) => any = () => {};

export const ModalProductStockOut: FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const color = useColor();
  const props = useRef<ModalProductStockOutProps | null>(null);

  const form = useForm<{
    product?: ProductEntity;
    quantity?: number;
    note?: string;
  }>({
    initialValues: {},
    validate: {},
  });

  OnModalProductStockOut = (_props) => {
    props.current = _props || null;
    form.setInitialValues({
      product: _props?.stock?.product,
    });
    form.reset();
    open();
  };

  const onClose = () => {
    form.reset();
    close();
  };

  const onSubmit = form.onSubmit(async (values) => {
    try {
      const dto: ProductStockOutDto = {
        productId: values.product?._id || "",
        quantity: values.quantity || 0,
        note: values.note || undefined,
        stockId: props.current?.stock?.id,
      };

      await productStockOut(dto);
      onClose();
    } catch (error) {
      onError(error);
    }
  });

  return (
    <Modal
      title={
        <ModalTitle
          title={t`Stock out`}
          icon={productStockRecordTypeOptions[ProductStockRecordType.STOCK_OUT].icon}
          color={color(productStockRecordTypeOptions[ProductStockRecordType.STOCK_OUT].color)}
        />
      }
      onClose={onClose}
      opened={opened}
    >
      <Stack gap={10}>
        <Stack>
          <ProductSelector
            type={ProductType.PRODUCT}
            isStockCheck
            excludeIds={form.values.product?._id ? [form.values.product?._id] : []}
            onSelect={(product) => form.setFieldValue("product", product)}
            target={(ctx) => {
              return (
                <InputWrapper flex={1} label={t`Product`}>
                  <Input
                    onClick={ctx.toggle}
                    flex={1}
                    value={form.values.product?.name || ""}
                    onChange={() => false}
                    placeholder={t`Select product`}
                    disabled={!!props.current?.stock}
                  />
                </InputWrapper>
              );
            }}
          />

          <NumberInput
            label={t`Quantity`}
            {...form.getInputProps("quantity")}
            min={0}
            max={props.current?.stock ? props.current.stock.remainQuantity : undefined}
          />

          <Textarea label={t`Note`} {...form.getInputProps("note")} />
        </Stack>

        <Stack align="center" mt={16}>
          <Button
            action
            rightIcon={productStockRecordTypeOptions[ProductStockRecordType.STOCK_OUT].icon}
            color={color(productStockRecordTypeOptions[ProductStockRecordType.STOCK_OUT].color)}
            loading={form.submitting}
            onClick={onSubmit}
          >
            <Trans>Complete</Trans>
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
};
