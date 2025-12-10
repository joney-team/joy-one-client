"use client";

import { Button } from "@/components/buttons/button";
import { ModalHead } from "@/components/modal/modal-head";
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
import { Trans, useLingui } from "@lingui/react/macro";
import { Input, InputWrapper, Modal, NumberInput, Stack, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { FC, Fragment, ReactNode, useRef } from "react";

interface ModalProductStockOutArgs {
  stock?: ProductStockEntity;
}

export const ModalProductStockOut: FC<{
  children: (open: (args?: ModalProductStockOutArgs) => void) => ReactNode;
}> = ({ children }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const color = useColor();
  const props = useRef<ModalProductStockOutArgs | null>(null);
  const { t } = useLingui();

  const form = useForm<{
    product?: ProductEntity;
    quantity?: number;
    note?: string;
  }>({
    initialValues: {},
    validate: {},
  });

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
    <Fragment>
      {children((args) => {
        props.current = args || null;
        form.setInitialValues({
          product: args?.stock?.product,
        });
        form.reset();
        open();
      })}

      <Modal
        title={
          <ModalHead
            name={<Trans>Stock out</Trans>}
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
                  <InputWrapper flex={1} label={<Trans>Product</Trans>}>
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
              label={<Trans>Quantity</Trans>}
              {...form.getInputProps("quantity")}
              min={0}
              max={props.current?.stock ? props.current.stock.remainQuantity : undefined}
            />

            <Textarea label={<Trans>Note</Trans>} {...form.getInputProps("note")} />
          </Stack>

          <Stack align="center" mt={16}>
            <Button
              action
              rightIcon={productStockRecordTypeOptions[ProductStockRecordType.STOCK_OUT].icon}
              color={color(productStockRecordTypeOptions[ProductStockRecordType.STOCK_OUT].color)}
              loading={form.submitting}
              onClick={() => onSubmit()}
            >
              <Trans>Complete</Trans>
            </Button>
          </Stack>
        </Stack>
      </Modal>
    </Fragment>
  );
};
